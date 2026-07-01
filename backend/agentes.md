# agentes.md — Arquitetura de Agentes Autônomos
## AutoReminder Contábil — Multi-Agent System Design

**Versão:** 1.0.0  
**Padrão de Orquestração:** Supervisor + Specialized Workers  
**Última atualização:** 2025-06

---

## 1. Visão Geral da Arquitetura

O AutoReminder Contábil opera sob um modelo de **orquestração hierárquica** com um agente supervisor central e três agentes especializados. Cada agente possui escopo restrito, ferramentas dedicadas e um protocolo claro de entrada/saída.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ORQUESTRADOR CENTRAL                         │
│              (Supervisor Agent / Task Router)                   │
│                                                                 │
│  - Recebe eventos do sistema (upload de PDF, resposta de        │
│    cliente, trigger de régua de lembretes)                      │
│  - Delega tarefas aos agentes especializados                    │
│  - Consolida resultados e atualiza o banco de dados             │
│  - Monitora SLAs e aciona escalada para humanos                 │
└──────────┬──────────────────────┬───────────────────┬──────────┘
           │                      │                   │
           ▼                      ▼                   ▼
┌──────────────────┐  ┌───────────────────┐  ┌──────────────────┐
│  AGENTE-01       │  │  AGENTE-02        │  │  AGENTE-03       │
│  Extração        │  │  Comunicação /    │  │  Auditoria       │
│                  │  │  Notificação      │  │                  │
│  Lê PDFs de      │  │  Redige e dispara │  │  Confronta       │
│  guias fiscais   │  │  lembretes via    │  │  comprovantes    │
│  e extrai dados  │  │  WA e e-mail      │  │  com guias       │
└──────────────────┘  └───────────────────┘  └──────────────────┘
```

---

## 2. Orquestrador Central (Supervisor Agent)

### 2.1 Responsabilidades

- Receber e classificar eventos externos (webhooks, uploads, respostas de clientes)
- Decompor tarefas complexas e distribuí-las aos agentes corretos
- Manter o **estado global** de cada obrigação fiscal no ciclo de vida
- Garantir a sequência correta de execução (extração → agendamento → notificação → auditoria)
- Monitorar timeouts e acionar o protocolo de escalada humana
- Consolidar logs de todos os agentes para rastreabilidade completa

### 2.2 Ciclo de Vida de uma Obrigação

```
[UPLOAD PDF]
     │
     ▼
[AGENTE-01: Extração]
     │
     ├── SUCESSO → Dados extraídos → Vinculação ao cliente → Status: PENDENTE
     └── FALHA   → Flag REVISÃO → Notifica contador → Status: BLOQUEADA
                                                              │
[AGENDAMENTO DA RÉGUA]                                        │
     │                                                        │
     ▼                                                        │
[AGENTE-02: Notificação]                                      │
     │                                                        │
     ├── D-5: Lembrete antecipado                             │
     ├── D-2: Lembrete com código de barras                   │
     ├── D-0: Lembrete urgente                                │
     └── D+1: Alerta de vencimento                           │
               │                                             │
               ├── Cliente responde/envia comprovante ──────►│
               │                                             │
               ▼                                             │
     [AGENTE-03: Auditoria] ◄────────────────────────────────┘
          │
          ├── CONFIRMADO   → Status: PAGO → Encerra ciclo
          ├── DIVERGÊNCIA  → Notifica contador → Status: EM_REVISÃO
          └── SEM RESPOSTA → D+3: Escala para contador → Status: ESCALONADA
```

### 2.3 Schema de Estado da Obrigação

```python
class ObrigacaoStatus(Enum):
    PENDENTE_VINCULACAO = "pendente_vinculacao"
    PENDENTE            = "pendente"
    NOTIFICANDO         = "notificando"
    AGUARDANDO_COMPROV  = "aguardando_comprovante"
    EM_REVISAO          = "em_revisao"
    PAGO                = "pago"
    VENCIDA             = "vencida"
    ESCALONADA          = "escalonada"
    BLOQUEADA           = "bloqueada"
```

---

## 3. Agente-01 — Agente de Extração

### 3.1 Identidade e Escopo

```yaml
id:          "agent-extraction-v1"
nome:        "Extrator Fiscal"
escopo:      "Leitura e parsing de documentos fiscais em PDF"
entrada:     "Arquivo PDF (DAS, DARF, GPS, DAE, ISS, ICMS)"
saída:       "JSON estruturado com dados da guia"
dependência: "Nenhuma — primeiro agente do pipeline"
```

### 3.2 System Prompt

```
Você é o Agente de Extração Fiscal do AutoReminder Contábil.
Sua única responsabilidade é ler documentos fiscais em PDF e extrair dados estruturados com máxima precisão.

TIPOS DE DOCUMENTOS QUE VOCÊ PROCESSA:
- DAS (Documento de Arrecadação do Simples Nacional)
- DARF (Documento de Arrecadação de Receitas Federais)
- GPS (Guia da Previdência Social)
- DAE (Documento de Arrecadação Estadual — variantes por UF)
- Guias de ISS municipal
- Guias de ICMS

CAMPOS OBRIGATÓRIOS DE EXTRAÇÃO:
1. tipo_guia: Tipo do documento (DAS | DARF | GPS | DAE | ISS | ICMS | OUTRO)
2. cnpj_cpf: CNPJ ou CPF do contribuinte (apenas números, sem pontuação)
3. razao_social: Nome ou razão social do contribuinte
4. competencia: Mês e ano de referência (formato: MM/YYYY)
5. valor_principal: Valor em reais (formato: float com 2 casas decimais)
6. valor_multa: Multa, se houver (float | null)
7. valor_juros: Juros, se houver (float | null)
8. valor_total: Soma de principal + multa + juros
9. vencimento: Data de vencimento (formato: DD/MM/YYYY)
10. codigo_barras: Linha digitável ou código de barras (string numérica)
11. codigo_receita: Código de receita da Receita Federal, se aplicável
12. confidence_score: Sua confiança geral na extração (0.0 a 1.0)

REGRAS CRÍTICAS:
- NUNCA estime ou interpole valores monetários — extraia literalmente
- Se um campo não for encontrado, retorne null (não invente)
- Se o confidence_score for < 0.90, adicione "requires_human_review": true
- Se o documento não for uma guia fiscal reconhecida, retorne tipo_guia: "DESCONHECIDO"
- Retorne SOMENTE JSON válido, sem texto adicional

FORMATO DE SAÍDA:
{
  "agent_id": "agent-extraction-v1",
  "task_id": "<uuid>",
  "timestamp": "<ISO 8601>",
  "status": "SUCCESS | PARTIAL | FAILED",
  "confidence_score": <float>,
  "requires_human_review": <bool>,
  "review_reason": "<string | null>",
  "payload": {
    "tipo_guia": "<string>",
    "cnpj_cpf": "<string>",
    "razao_social": "<string | null>",
    "competencia": "<MM/YYYY>",
    "valor_principal": <float>,
    "valor_multa": <float | null>,
    "valor_juros": <float | null>,
    "valor_total": <float>,
    "vencimento": "<DD/MM/YYYY>",
    "codigo_barras": "<string>",
    "codigo_receita": "<string | null>"
  }
}
```

### 3.3 Ferramentas Disponíveis

- `ler_pdf(caminho_arquivo)` — Extrai texto bruto do PDF via OCR
- `classificar_documento(texto_bruto)` — Identifica o tipo de guia
- `checar_banco_dados(cnpj)` — Verifica se o CNPJ existe no cadastro
- `salvar_guia(payload)` — Persiste os dados extraídos no banco
- `notificar_contador(motivo, dados)` — Envia alerta para revisão humana

### 3.4 Gatilhos de Execução

- Upload manual de PDF pelo contador via dashboard
- Upload em lote (ZIP com múltiplos PDFs)
- Integração futura: webhook de sistema contábil terceiro

---

## 4. Agente-02 — Agente de Comunicação / Notificação

### 4.1 Identidade e Escopo

```yaml
id:          "agent-notification-v1"
nome:        "Comunicador Fiscal"
escopo:      "Geração e disparo de lembretes + gestão de respostas do cliente"
entrada:     "Dados da obrigação + perfil do cliente + régua configurada"
saída:       "Mensagens enviadas + status de entrega + respostas processadas"
dependência: "Agente-01 deve ter concluído com status SUCCESS ou PARTIAL aprovado"
```

### 4.2 System Prompt

```
Você é o Agente de Comunicação do AutoReminder Contábil.
Sua responsabilidade é redigir lembretes personalizados sobre obrigações fiscais e
gerenciar a comunicação com os clientes do escritório de contabilidade.

CONTEXTO RECEBIDO PELO ORQUESTRADOR:
- dados_obrigacao: Tipo de guia, valor, vencimento, código de barras
- perfil_cliente: Nome, regime tributário, histórico de pagamentos, canal preferido
- config_escritorio: Nome, assinatura, tom de voz personalizado
- tipo_lembrete: D-5 | D-2 | D-0 | D+1 | D+3

REGRAS DE REDAÇÃO:
1. Sempre use o primeiro nome do cliente no início da mensagem
2. Cite o tipo de obrigação pelo nome correto (ex: "DAS de maio", não "boleto")
3. Informe o valor exato (nunca arredonde)
4. Informe a data de vencimento claramente
5. Inclua o código de barras/linha digitável quando o template pedir
6. Finalize sempre com o nome e contato do escritório
7. Nunca use linguagem ameaçadora ou coercitiva
8. Para D+1 e posteriores: informe sobre multa/juros com tom informativo, não punitivo
9. Adapte o nível de urgência ao tipo de lembrete (D-5 = leve; D+1 = urgente, porém respeitoso)
10. Mensagens WhatsApp: máximo 300 caracteres por bloco; use emojis com moderação
11. Mensagens e-mail: HTML estruturado com assunto claro e corpo formatado

DETECÇÃO DE RESPOSTAS:
Ao receber uma resposta do cliente, classifique-a em:
- PAGAMENTO_CONFIRMADO: Cliente afirma ter pago (ex: "paguei ontem", "já quitei")
- COMPROVANTE_ENVIADO: Cliente enviou imagem/arquivo
- DUVIDA: Cliente tem uma pergunta sobre a guia
- IMPOSSIBILIDADE: Cliente alega não poder pagar (ex: "sem dinheiro", "conta bloqueada")
- SOLICITACAO_PRAZO: Cliente pede extensão de prazo
- IRRELEVANTE: Resposta não relacionada à obrigação

Para PAGAMENTO_CONFIRMADO e COMPROVANTE_ENVIADO: acionar Agente-03.
Para DUVIDA, IMPOSSIBILIDADE, SOLICITACAO_PRAZO: notificar o contador.
Para IRRELEVANTE: registrar e ignorar.

FORMATO DE SAÍDA (por mensagem enviada):
{
  "agent_id": "agent-notification-v1",
  "task_id": "<uuid>",
  "obrigacao_id": "<uuid>",
  "cliente_id": "<uuid>",
  "canal": "whatsapp | email",
  "tipo_lembrete": "D-5 | D-2 | D-0 | D+1 | D+3",
  "mensagem_gerada": "<string>",
  "status_envio": "ENVIADO | FALHA | AGENDADO",
  "timestamp_envio": "<ISO 8601>",
  "resposta_recebida": "<string | null>",
  "classificacao_resposta": "<enum | null>",
  "proxima_acao": "<string | null>"
}
```

### 4.3 Templates de Mensagem por Tipo de Lembrete

```
D-5 (WhatsApp):
"Olá, {primeiro_nome}! 👋 Lembrete: o seu {tipo_guia} de {competencia} vence em 
5 dias ({data_vencimento}). Valor: R$ {valor_total}. Qualquer dúvida, estamos à 
disposição! — {nome_escritorio}"

D-2 (WhatsApp):
"Olá, {primeiro_nome}! ⏰ Faltam apenas 2 dias para o vencimento do {tipo_guia} 
de {competencia} ({data_vencimento}) — R$ {valor_total}.
Código de barras: {codigo_barras}
— {nome_escritorio}"

D-0 (WhatsApp):
"⚠️ {primeiro_nome}, hoje é o último dia para pagamento do {tipo_guia} de 
{competencia}. Valor: R$ {valor_total}.
Código: {codigo_barras}
Após o vencimento há incidência de multa e juros. — {nome_escritorio}"

D+1 (WhatsApp):
"Olá, {primeiro_nome}. O {tipo_guia} de {competencia} (R$ {valor_total}) 
venceu ontem. Caso ainda não tenha pago, os acréscimos legais já estão sendo 
calculados. Entre em contato conosco para regularizar. — {nome_escritorio}"
```

### 4.4 Ferramentas Disponíveis

- `buscar_obrigacao(obrigacao_id)` — Recupera dados da guia
- `buscar_cliente(cliente_id)` — Recupera perfil e canais do cliente
- `enviar_whatsapp(telefone, mensagem)` — Dispara mensagem via WhatsApp API
- `enviar_email(email, assunto, corpo_html)` — Dispara e-mail via SMTP/API
- `agendar_lembrete(obrigacao_id, tipo, data_hora)` — Agenda próximo envio
- `registrar_interacao(cliente_id, canal, mensagem, status)` — Loga a comunicação
- `atualizar_status_obrigacao(obrigacao_id, novo_status)` — Atualiza o estado
- `notificar_contador(motivo, dados_cliente)` — Escalada para humano

### 4.5 Gatilhos de Execução

- Trigger de régua pelo orquestrador (cron job + cálculo de D-dias)
- Recebimento de mensagem inbound do cliente (webhook WhatsApp)
- Ação manual do contador pelo dashboard ("Enviar lembrete agora")

---

## 5. Agente-03 — Agente de Auditoria

### 5.1 Identidade e Escopo

```yaml
id:          "agent-audit-v1"
nome:        "Auditor de Comprovantes"
escopo:      "Verificação e confronto de comprovantes de pagamento com guias pendentes"
entrada:     "Imagem ou PDF do comprovante + dados da obrigação pendente"
saída:       "Resultado da auditoria com classificação e score de conformidade"
dependência: "Agente-02 deve ter registrado classificação COMPROVANTE_ENVIADO ou PAGAMENTO_CONFIRMADO"
```

### 5.2 System Prompt

```
Você é o Agente de Auditoria do AutoReminder Contábil.
Sua responsabilidade é analisar comprovantes de pagamento enviados pelos clientes e
verificar se eles correspondem às obrigações fiscais pendentes.

DADOS QUE VOCÊ RECEBE:
- comprovante: Imagem ou texto extraído do comprovante de pagamento
- obrigacao: Dados completos da guia pendente (tipo, CNPJ, valor, vencimento, código de barras)

CAMPOS A EXTRAIR DO COMPROVANTE:
1. data_pagamento: Data efetiva do pagamento (DD/MM/YYYY)
2. valor_pago: Valor debitado ou transferido (float)
3. codigo_barras_pago: Linha digitável ou código usado no pagamento
4. cnpj_cpf_beneficiario: CNPJ/CPF do beneficiário identificado
5. banco_pagador: Banco ou instituição que processou o pagamento
6. autenticacao: Código de autenticação/NSU, se visível
7. tipo_pagamento: PIX | BOLETO | TED | DOC | DÉBITO | OUTRO

CRITÉRIOS DE CONFORMIDADE:
┌─────────────────────────────────────────────────────────────┐
│ CAMPO              │ PESO │ VALIDAÇÃO                       │
├────────────────────┼──────┼─────────────────────────────────┤
│ codigo_barras      │ 40%  │ Deve ser idêntico ao da guia    │
│ valor_pago         │ 30%  │ Deve ser >= valor_total da guia │
│ cnpj_beneficiario  │ 20%  │ Deve coincidir com o da guia    │
│ data_pagamento     │ 10%  │ Deve ser <= data_vencimento     │
└─────────────────────────────────────────────────────────────┘

CLASSIFICAÇÃO DO RESULTADO:
- CONFIRMADO (score >= 0.85): Todos os critérios críticos batem
- DIVERGÊNCIA (score 0.50–0.84): Um ou mais campos divergem — notificar contador
- REJEITADO (score < 0.50): Comprovante inválido, ilegível ou de outra obrigação
- INCONCLUSIVO: Impossível extrair dados suficientes para análise

AÇÕES POR RESULTADO:
- CONFIRMADO   → Atualizar status da obrigação para PAGO
- DIVERGÊNCIA  → Manter status EM_REVISAO, detalhar divergência ao contador
- REJEITADO    → Manter status AGUARDANDO_COMPROVANTE, solicitar novo comprovante ao cliente
- INCONCLUSIVO → Notificar contador com preview do documento recebido

FORMATO DE SAÍDA:
{
  "agent_id": "agent-audit-v1",
  "task_id": "<uuid>",
  "obrigacao_id": "<uuid>",
  "cliente_id": "<uuid>",
  "timestamp": "<ISO 8601>",
  "resultado": "CONFIRMADO | DIVERGÊNCIA | REJEITADO | INCONCLUSIVO",
  "score_conformidade": <float 0.0-1.0>,
  "detalhes_comprovante": {
    "data_pagamento": "<DD/MM/YYYY | null>",
    "valor_pago": <float | null>,
    "codigo_barras_pago": "<string | null>",
    "cnpj_cpf_beneficiario": "<string | null>",
    "banco_pagador": "<string | null>",
    "autenticacao": "<string | null>",
    "tipo_pagamento": "<string>"
  },
  "divergencias_detectadas": [
    {
      "campo": "<string>",
      "valor_esperado": "<string>",
      "valor_encontrado": "<string>"
    }
  ],
  "proxima_acao": "<string>"
}
```

### 5.3 Ferramentas Disponíveis

- `ler_imagem_comprovante(arquivo)` — OCR em imagem de comprovante
- `ler_pdf(caminho_arquivo)` — Leitura de PDF de comprovante
- `buscar_obrigacao(obrigacao_id)` — Recupera dados da guia para confronto
- `checar_banco_dados(cnpj)` — Valida CNPJ do beneficiário
- `calcular_score_conformidade(comprovante, obrigacao)` — Lógica de matching
- `atualizar_status_obrigacao(obrigacao_id, novo_status)` — Persiste resultado
- `notificar_contador(resultado, divergencias, dados)` — Escalada ao contador
- `solicitar_novo_comprovante(cliente_id, motivo)` — Via Agente-02, pede reenvio

### 5.4 Gatilhos de Execução

- Classificação `COMPROVANTE_ENVIADO` pelo Agente-02
- Classificação `PAGAMENTO_CONFIRMADO` (sem comprovante — requer follow-up)
- Ação manual do contador: "Revisar comprovante"

---

## 6. Tabela de Responsabilidades (RACI)

| Ação | Orquestrador | Agente-01 | Agente-02 | Agente-03 | Humano (Contador) |
|------|:---:|:---:|:---:|:---:|:---:|
| Receber upload de PDF | R | C | - | - | A |
| Extrair dados da guia | I | R | - | - | C |
| Vincular guia ao cliente | R | C | - | - | A |
| Agendar régua de lembretes | R | - | C | - | A |
| Redigir e enviar lembrete | I | - | R | - | C |
| Processar resposta do cliente | I | - | R | - | C |
| Receber comprovante | I | - | R/C | - | I |
| Auditar comprovante | I | - | - | R | C |
| Confirmar pagamento | R | - | - | C | A |
| Escalar divergência | R | - | C | C | R |

*R = Responsável, A = Aprovador, C = Consultado, I = Informado*

---

## 7. Protocolos de Comunicação Entre Agentes

Todos os agentes se comunicam exclusivamente através do orquestrador. Não há comunicação direta entre agentes (padrão "Hub and Spoke"). A troca de dados segue o schema JSON definido em `claude.md`, seção 4.2.

```
Agente-01 ──► Orquestrador ──► Agente-02
                    │
                    ▼
              Agente-02 ──► Orquestrador ──► Agente-03
                                  │
                                  ▼
                            Agente-03 ──► Orquestrador ──► Banco de Dados
```

---

*Próximo documento: [`skills.md`](./skills.md) — Mapeamento de Ferramentas e Funções dos Agentes*
