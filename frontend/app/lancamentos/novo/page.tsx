'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { listarEmpresas, Empresa } from '../../lib/empresaService'
import { pegarToken } from '../../lib/authService'
import ProtegerRota from '../../components/ProtegerRota'

const schema = z.object({
  empresaId: z.string().min(1, 'Selecione uma empresa'),
  tipoImposto: z.string().min(1, 'Selecione o tipo de imposto'),
  valor: z.string().min(1, 'Informe o valor'),
  vencimento: z.string().min(1, 'Informe o vencimento'),
  linkGuia: z.string().url('URL inválida').optional().or(z.literal('')),
  recorrente: z.boolean().optional(),
  prazos: z.array(z.string()).min(1, 'Selecione ao menos um prazo'),
})

type NovoLancamentoForm = z.infer<typeof schema>

const tiposImposto = ['DAS', 'DARF', 'GPS', 'ISS', 'ICMS', 'IRPJ', 'CSLL', 'PIS/COFINS']

const prazosOpcoes = [
  { value: '5', label: '5 dias antes' },
  { value: '2', label: '2 dias antes' },
  { value: '0', label: 'No dia do vencimento' },
]

export default function NovoLancamentoPage() {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [prazosSelecionados, setPrazosSelecionados] = useState<string[]>(['5', '2'])
  const [pdfSelecionado, setPdfSelecionado] = useState<File | null>(null)

  useEffect(() => {
    listarEmpresas().then(setEmpresas).catch(console.error)
  }, [])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<NovoLancamentoForm>({
    resolver: zodResolver(schema),
    defaultValues: { prazos: ['5', '2'], recorrente: false },
  })

  function togglePrazo(valor: string) {
    const novos = prazosSelecionados.includes(valor)
      ? prazosSelecionados.filter((p) => p !== valor)
      : [...prazosSelecionados, valor]
    setPrazosSelecionados(novos)
    setValue('prazos', novos)
  }

  async function onSubmit(dados: NovoLancamentoForm) {
    setCarregando(true)
    setErro('')
    try {
      const token = pegarToken()
      const formData = new FormData()
      formData.append('empresaId', dados.empresaId)
      formData.append('tipoImposto', dados.tipoImposto)
      formData.append('valor', dados.valor)
      formData.append('vencimento', dados.vencimento)
      formData.append('recorrente', String(dados.recorrente || false))
      formData.append('prazos', dados.prazos.join(','))
      if (dados.linkGuia) formData.append('linkGuia', dados.linkGuia)
      if (pdfSelecionado) formData.append('pdf', pdfSelecionado)

      const res = await fetch('http://localhost:8000/lancamentos/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (res.ok) {
        window.location.href = '/lancamentos'
      } else {
        const erro = await res.json()
        setErro(erro.detail || 'Erro ao criar lançamento')
      }
    } catch {
      setErro('Erro ao conectar com o servidor')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <ProtegerRota>
      <div className="min-h-screen p-6 md:p-10"
        style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-lg mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <Link href="/lancamentos"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
              style={{ background: '#dcfce7', color: '#16a34a' }}>
              ←
            </Link>
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>Novo Lançamento</h1>
              <p className="text-xs" style={{ color: '#4a6355' }}>Registre uma cobrança de imposto</p>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #bbf7d0' }}>

            {erro && (
              <div className="rounded-lg px-4 py-3 mb-4 text-sm"
                style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
                {erro}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

              {/* Empresa */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>Empresa</label>
                <select {...register('empresaId')}
                  className="rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: '#f0fdf4',
                    border: errors.empresaId ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                    color: '#1a2e1f',
                  }}>
                  <option value="">Selecione a empresa...</option>
                  {empresas.map((e) => (
                    <option key={e.id} value={e.id}>{e.razaoSocial}</option>
                  ))}
                </select>
                {errors.empresaId && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.empresaId.message}</span>}
              </div>

              {/* Tipo + Valor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide"
                    style={{ color: '#14532d', fontWeight: 700 }}>Tipo de Imposto</label>
                  <select {...register('tipoImposto')}
                    className="rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      background: '#f0fdf4',
                      border: errors.tipoImposto ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                      color: '#1a2e1f',
                    }}>
                    <option value="">Selecione...</option>
                    {tiposImposto.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {errors.tipoImposto && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.tipoImposto.message}</span>}
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide"
                    style={{ color: '#14532d', fontWeight: 700 }}>Valor (R$)</label>
                  <input type="number" step="0.01" placeholder="0,00"
                    {...register('valor')}
                    className="rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      background: '#f0fdf4',
                      border: errors.valor ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                      color: '#1a2e1f',
                    }} />
                  {errors.valor && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.valor.message}</span>}
                </div>
              </div>

              {/* Vencimento */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>Data de Vencimento</label>
                <input type="date" {...register('vencimento')}
                  className="rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: '#f0fdf4',
                    border: errors.vencimento ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                    color: '#1a2e1f',
                  }} />
                {errors.vencimento && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.vencimento.message}</span>}
              </div>

              {/* Link da guia */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>
                  🔗 Link da Guia
                  <span className="ml-1 normal-case font-normal" style={{ color: '#4a6355' }}>(opcional)</span>
                </label>
                <input type="url" placeholder="https://..."
                  {...register('linkGuia')}
                  className="rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: '#f0fdf4',
                    border: errors.linkGuia ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                    color: '#1a2e1f',
                  }} />
                {errors.linkGuia && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.linkGuia.message}</span>}
              </div>

              {/* Upload PDF */}
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>
                  📄 PDF da Guia/Boleto
                  <span className="ml-1 normal-case font-normal" style={{ color: '#4a6355' }}>(opcional)</span>
                </label>
                <div className="rounded-xl px-4 py-3 text-sm cursor-pointer transition-all"
                  style={{
                    background: '#f0fdf4',
                    border: '1.5px dashed #bbf7d0',
                    color: '#1a2e1f',
                  }}>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setPdfSelecionado(e.target.files?.[0] || null)}
                    className="w-full text-xs"
                    style={{ color: '#4a6355' }}
                  />
                  {pdfSelecionado && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs font-semibold" style={{ color: '#16a34a' }}>
                        ✅ {pdfSelecionado.name}
                      </span>
                      <button type="button" onClick={() => setPdfSelecionado(null)}
                        className="text-xs" style={{ color: '#dc2626' }}>
                        ✕ Remover
                      </button>
                    </div>
                  )}
                </div>
                <span className="text-xs" style={{ color: '#4a6355' }}>
                  O PDF será enviado junto com o lembrete no WhatsApp
                </span>
              </div>

              {/* Prazos */}
              <div className="flex flex-col gap-2">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>Prazos de Aviso</label>
                <div className="flex gap-2 flex-wrap">
                  {prazosOpcoes.map((p) => (
                    <button key={p.value} type="button" onClick={() => togglePrazo(p.value)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                      style={{
                        background: prazosSelecionados.includes(p.value) ? '#16a34a' : '#f0fdf4',
                        color: prazosSelecionados.includes(p.value) ? '#fff' : '#4a6355',
                        border: '1.5px solid',
                        borderColor: prazosSelecionados.includes(p.value) ? '#16a34a' : '#bbf7d0',
                      }}>
                      {p.label}
                    </button>
                  ))}
                </div>
                {errors.prazos && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.prazos.message}</span>}
              </div>

              {/* Recorrente */}
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-xl"
                style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
                <input type="checkbox" {...register('recorrente')} className="w-4 h-4 accent-green-600" />
                <div>
                  <span className="text-sm font-semibold" style={{ color: '#052e16' }}>Lançamento recorrente</span>
                  <p className="text-xs" style={{ color: '#4a6355' }}>Repete automaticamente todo mês</p>
                </div>
              </label>

              {/* Botões */}
              <div className="flex gap-3 mt-2">
                <Link href="/lancamentos"
                  className="flex-1 rounded-xl py-3 font-bold text-sm text-center"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>
                  Cancelar
                </Link>
                <button type="submit" disabled={carregando}
                  className="flex-1 rounded-xl py-3 font-bold text-sm transition-all"
                  style={{
                    background: carregando ? '#86efac' : '#16a34a',
                    color: '#fff',
                    cursor: carregando ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  }}>
                  {carregando ? 'Salvando...' : 'Lançar →'}
                </button>
              </div>

            </form>
          </div>
        </div>
      </div>
    </ProtegerRota>
  )
}