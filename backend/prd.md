# PRD — AutoReminder Contábil
## Sistema Inteligente de Lembretes Financeiros para Escritórios de Contabilidade

**Versão:** 1.0.0  
**Status:** Draft — MVP  
**Autor:** Arquitetura de Produto  
**Última atualização:** 2025-06

---

## 1. Visão Geral do Produto

### 1.1 Resumo Executivo

O **AutoReminder Contábil** é um MicroSaaS B2B voltado para escritórios de contabilidade e contadores autônomos. Ele automatiza o ciclo de comunicação sobre obrigações fiscais — desde a leitura das guias de impostos até a confirmação de pagamento — eliminando o trabalho manual repetitivo e reduzindo a inadimplência dos clientes.

### 1.2 Problema Central

#### Dores do Contador

| # | Dor | Impacto |
|---|-----|---------|
| 1 | Envio manual de lembretes de vencimento para dezenas (ou centenas) de clientes | Alto consumo de tempo improdutivo |
| 2 | Clientes que pagam fora do prazo e geram multas e juros | Desgaste no relacionamento e retrabalho |
| 3 | Dificuldade em confirmar se o cliente realmente pagou a guia | Risco de inconsistência contábil |
| 4 | Comprovantes enviados incorretos (guia errada, valor divergente, CNPJ trocado) | Retrabalho e risco de autuação fiscal |
| 5 | Falta de rastreabilidade e histórico de comunicações | Exposição a litígios e reclamações |

#### Dores do Cliente do Contador

| # | Dor | Impacto |
|---|-----|---------|
| 1 | Esquece vencimentos e paga multas desnecessárias | Prejuízo financeiro |
| 2 | Não sabe exatamente o que pagar e quando | Ansiedade e dependência total do contador |
| 3 | Processo de confirmação de pagamento é burocrático | Fricção na relação com o escritório |

### 1.3 Solução Proposta

O AutoReminder resolve esse ciclo através de um pipeline de IA composto por **agentes autônomos especializados** que:

1. **Extraem** automaticamente dados de guias fiscais (DAS, DARF, GPS, DAE, ICMS, ISS).
2. **Notificam** os clientes via WhatsApp e e-mail com lembretes personalizados e progressivos.
3. **Auditam** os comprovantes recebidos, verificando se o pagamento confere com a obrigação pendente.
4. **Registram** todo o histórico de comunicação e status de cada obrigação.

---

## 2. Público-Alvo e Personas

### Persona Primária — O Contador

- **Nome fictício:** Carlos Mendes
- **Perfil:** Contador CRC com escritório próprio, atende 80–300 clientes MEI, ME, EPP
- **Ferramentas atuais:** Domínio Sistemas, Questor, Alterdata ou planilhas Excel
- **Dor principal:** Gasta de 2 a 4 horas/semana enviando lembretes manualmente no WhatsApp
- **Objetivo:** Automatizar a cobrança sem perder o toque personalizado com o cliente

### Persona Secundária — O Cliente do Escritório

- **Perfil:** Empresário pequeno, MEI ou ME, pouco familiarizado com obrigações fiscais
- **Canal preferido:** WhatsApp (85% de preferência segundo pesquisas do setor)
- **Comportamento:** Procrastina pagamentos quando não é lembrado ativamente

---

## 3. Funcionalidades Principais

### 3.1 Módulo de Ingestão de Guias (Agente de Extração)

- Upload manual ou automático de PDFs de guias fiscais (DAS, DARF, GPS, DAE, ISS, ICMS)
- Extração de campos críticos via OCR + parsing inteligente:
  - CNPJ / CPF do contribuinte
  - Competência (mês/ano de referência)
  - Tipo de tributo
  - Valor principal, multa e juros
  - Código de barras / linha digitável
  - Data de vencimento
- Vinculação automática da guia ao cliente cadastrado no sistema
- Suporte a lote: múltiplos PDFs em um único upload
- Alerta de inconsistências (ex: CNPJ não cadastrado, vencimento já expirado)

### 3.2 Módulo de Comunicação e Lembretes (Agente de Notificação)

- Régua de comunicação configurável por escritório:
  - **D-5:** Lembrete antecipado amigável
  - **D-2:** Segundo lembrete com código de barras
  - **D-0:** Lembrete urgente no dia do vencimento
  - **D+1:** Alerta de vencimento com informação de multa e juros
  - **D+3:** Escalonamento para o contador
- Canal de disparo: **WhatsApp Business API** e **E-mail**
- Personalização de mensagens por perfil de cliente (MEI, ME, EPP)
- Envio de código de barras copiável diretamente na mensagem
- Registro de status de entrega (entregue, lido, não entregue)
- Gestão de respostas: o cliente pode responder confirmando o pagamento

### 3.3 Módulo de Auditoria de Comprovantes (Agente de Auditoria)

- Recepção de imagens/PDFs de comprovantes via WhatsApp ou upload no portal
- Extração de dados do comprovante:
  - Data de pagamento
  - Valor pago
  - Código de barras / linha digitável
  - Banco pagador
  - CNPJ/CPF
- Confronto automático com a guia pendente (matching)
- Classificação do resultado:
  - ✅ **Confirmado:** Comprovante bate com a guia
  - ⚠️ **Divergência:** Valor, CNPJ ou código diferente
  - ❌ **Rejeitado:** Documento ilegível ou inválido
- Notificação ao contador em caso de divergência
- Atualização automática do status da obrigação no painel

### 3.4 Módulo de Painel de Controle (Dashboard)

- Visão geral por cliente: obrigações pendentes, pagas e vencidas
- Timeline de comunicações enviadas e recebidas por obrigação
- Indicadores: taxa de pagamento no prazo, taxa de resposta, pendências em aberto
- Exportação de relatórios em PDF e Excel
- Filtros por período, cliente, tipo de guia e status

### 3.5 Módulo de Cadastro e Configuração

- Cadastro de clientes com CNPJ, regime tributário e canais de contato
- Configuração do escritório: logo, assinatura de mensagens, horários de envio
- Gestão de templates de mensagens
- Configuração da régua de lembretes por cliente ou grupo
- Controle de usuários e permissões (contador responsável)

---

## 4. Escopo do MVP

### 4.1 O que ENTRA no MVP

| Funcionalidade | Prioridade |
|----------------|------------|
| Upload e extração de PDFs DAS e DARF | P0 — Crítico |
| Cadastro de clientes (CNPJ, nome, WhatsApp, e-mail) | P0 — Crítico |
| Régua de lembretes via WhatsApp (D-5, D-2, D-0) | P0 — Crítico |
| Envio de lembretes via e-mail | P1 — Alto |
| Recepção e auditoria básica de comprovantes via WhatsApp | P1 — Alto |
| Dashboard com status de obrigações | P1 — Alto |
| Alerta ao contador em caso de divergência | P1 — Alto |
| Templates de mensagem configuráveis | P2 — Médio |
| Relatório exportável em PDF | P2 — Médio |

### 4.2 O que FICA FORA do MVP (Backlog)

- Integração direta com sistemas contábeis (Domínio, Questor, Alterdata)
- Suporte a guias estaduais diversas (DAE, ISS municipal variante)
- Integração bancária para confirmação automática de pagamento via OFX/API bancária
- App mobile nativo
- Módulo de cobrança (geração de boleto do escritório)
- Multi-idioma

---

## 5. Regras de Negócio Essenciais

### RN-001 — Vinculação de Guias
Toda guia extraída **deve** ser vinculada a um cliente cadastrado via CNPJ/CPF. Guias com CNPJ não cadastrado ficam em fila de "Pendentes de Vínculo" e o contador é notificado.

### RN-002 — Precedência de Vencimento
Guias com vencimento em menos de 48 horas têm prioridade máxima de disparo, independentemente da régua configurada.

### RN-003 — Não Duplicidade de Envio
O sistema não envia dois lembretes do mesmo tipo (ex: D-5) para a mesma obrigação. Verificação obrigatória antes de qualquer disparo.

### RN-004 — Horário de Envio
Mensagens só são disparadas entre **08h00 e 20h00** no fuso horário do cliente. Fora desse horário, o envio é agendado para o próximo período permitido.

### RN-005 — Auditoria de Comprovante
Um comprovante é considerado **válido** apenas quando: (a) o valor pago é igual ou maior ao valor da guia; (b) o código de barras ou linha digitável confere; (c) a data de pagamento é anterior ou igual ao vencimento. Qualquer divergência aciona o Agente de Auditoria.

### RN-006 — Escalonamento
Se o cliente não responde nem envia comprovante após D+3, o sistema gera um alerta interno para o contador responsável, que assume o contato manualmente.

### RN-007 — Retenção de Dados
Todos os comprovantes, guias e logs de comunicação são retidos por **5 anos** (prazo de guarda fiscal), após o qual são deletados automaticamente com aviso prévio de 30 dias.

### RN-008 — LGPD
Todo dado de cliente (CNPJ, contatos, comprovantes) é armazenado com criptografia em repouso (AES-256). Nenhum dado é compartilhado com terceiros. O contador é o controlador de dados; o AutoReminder atua como operador.

### RN-009 — Limite de Tentativas
O sistema faz no máximo **3 tentativas de reenvio** por mensagem não entregue (via WhatsApp). Após 3 falhas, escala para e-mail automaticamente.

### RN-010 — Imutabilidade de Auditoria
Registros de auditoria (resultado de confronto de comprovante) são imutáveis após gravação. Qualquer reprocessamento gera um novo registro, mantendo o histórico original.

---

## 6. Requisitos Não-Funcionais

| Requisito | Meta |
|-----------|------|
| Disponibilidade | 99,5% uptime mensal |
| Latência de extração de PDF | < 10 segundos por documento |
| Latência de disparo de mensagem | < 5 segundos após trigger |
| Segurança | Criptografia em trânsito (TLS 1.3) e em repouso (AES-256) |
| Escalabilidade | Suporte a 500 escritórios e 50.000 clientes no MVP |
| Auditabilidade | Logs completos de todas as ações de agentes, com timestamp e ID de rastreio |

---

## 7. Stack Tecnológica Sugerida (Referência)

| Camada | Tecnologia |
|--------|------------|
| Backend / Orquestração de Agentes | Python + LangGraph ou CrewAI |
| LLM Central | Claude (Anthropic API) |
| OCR / Extração de PDF | Tesseract + pdfplumber / AWS Textract |
| WhatsApp | Evolution API (self-hosted) ou Twilio WhatsApp Business |
| E-mail | SendGrid ou Amazon SES |
| Banco de Dados | PostgreSQL (dados relacionais) + Redis (filas e cache) |
| Armazenamento de arquivos | AWS S3 ou Cloudflare R2 |
| Frontend / Dashboard | Next.js + TailwindCSS |
| Infraestrutura | Railway, Render ou AWS ECS |

---

## 8. Métricas de Sucesso do MVP

| KPI | Meta (3 meses pós-lançamento) |
|-----|-------------------------------|
| Escritórios ativos | 20 |
| Taxa de pagamento no prazo (clientes dos escritórios) | > 80% |
| Taxa de auditoria automatizada (sem intervenção humana) | > 70% |
| NPS dos contadores | > 50 |
| Tempo médio de processamento de guia | < 15 segundos |
| Redução de trabalho manual reportada | > 60% |

---

*Próximo documento: [`claude.md`](./claude.md) — Definição de Persona e Diretrizes da IA Central*
