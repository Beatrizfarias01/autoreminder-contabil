'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { listarLancamentos, cancelarLancamento, atualizarStatusLancamento, Lancamento } from '../lib/lancamentoService'
import { listarEmpresas, Empresa } from '../lib/empresaService'
import { pegarToken } from '../lib/authService'
import ProtegerRota from '../components/ProtegerRota'

const statusConfig: Record<string, { label: string; bg: string; cor: string }> = {
  pendente:   { label: 'Pendente',   bg: '#fef3c7', cor: '#92400e' },
  enviado:    { label: 'Enviado',    bg: '#dbeafe', cor: '#1e40af' },
  confirmado: { label: 'Confirmado', bg: '#dcfce7', cor: '#16a34a' },
  atrasado:   { label: 'Atrasado',   bg: '#fee2e2', cor: '#dc2626' },
}

const proximoStatus: Record<string, { label: string; valor: string }> = {
  pendente:  { label: '📤 Marcar Enviado',     valor: 'enviado' },
  enviado:   { label: '✅ Confirmar Pagamento', valor: 'confirmado' },
  atrasado:  { label: '✅ Confirmar Pagamento', valor: 'confirmado' },
}

export default function LancamentosPage() {
  const [filtro, setFiltro] = useState<string>('todos')
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [atualizando, setAtualizando] = useState<string | null>(null)
  const [enviandoWA, setEnviandoWA] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      try {
        const [l, e] = await Promise.all([listarLancamentos(), listarEmpresas()])
        setLancamentos(l)
        setEmpresas(e)
      } catch {
        console.error('Erro ao carregar')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  function nomeEmpresa(empresaId: string) {
    return empresas.find((e) => e.id === empresaId)?.razaoSocial || 'Empresa'
  }

  const filtrados = filtro === 'todos'
    ? lancamentos
    : lancamentos.filter((l) => l.status === filtro)

  async function cancelar(id: string) {
    if (confirm('Cancelar este lançamento?')) {
      try {
        await cancelarLancamento(id)
        setLancamentos((prev) => prev.filter((l) => l.id !== id))
      } catch {
        alert('Erro ao cancelar lançamento')
      }
    }
  }

  async function atualizarStatus(id: string, novoStatus: string) {
    setAtualizando(id)
    try {
      const atualizado = await atualizarStatusLancamento(id, novoStatus)
      setLancamentos((prev) =>
        prev.map((l) => l.id === id ? { ...l, status: atualizado.status } : l)
      )
    } catch {
      alert('Erro ao atualizar status')
    } finally {
      setAtualizando(null)
    }
  }

  async function enviarWhatsapp(id: string) {
    setEnviandoWA(id)
    try {
      const token = pegarToken()
      const res = await fetch('http://localhost:8000/whatsapp/enviar-lembrete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ lancamento_id: id }),
      })
      if (res.ok) {
        alert('✅ Lembrete enviado via WhatsApp!')
        setLancamentos((prev) =>
          prev.map((l) => l.id === id ? { ...l, status: 'enviado' } : l)
        )
      } else {
        const erro = await res.json()
        alert(`❌ Erro: ${erro.detail || 'Erro ao enviar lembrete'}`)
      }
    } catch {
      alert('❌ Erro ao conectar com o servidor')
    } finally {
      setEnviandoWA(null)
    }
  }

  return (
    <ProtegerRota>
      <div className="min-h-screen p-6 md:p-10"
        style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>
                Lançamentos de Impostos
              </h1>
              <p className="text-xs mt-1" style={{ color: '#4a6355' }}>
                {lancamentos.length} lançamento{lancamentos.length !== 1 ? 's' : ''} no total
              </p>
            </div>
            <Link href="/lancamentos/novo"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{
                background: '#16a34a',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              }}>
              + Novo Lançamento
            </Link>
          </div>

          <div className="flex gap-2 mb-5 flex-wrap">
            {(['todos', 'pendente', 'enviado', 'confirmado', 'atrasado'] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: filtro === f ? '#16a34a' : '#fff',
                  color: filtro === f ? '#fff' : '#4a6355',
                  border: '1px solid',
                  borderColor: filtro === f ? '#16a34a' : '#bbf7d0',
                }}>
                {f === 'todos' ? 'Todos' : statusConfig[f]?.label || f}
              </button>
            ))}
          </div>

          {carregando ? (
            <div className="text-center py-16" style={{ color: '#4a6355' }}>
              <div className="text-4xl mb-3">⏳</div>
              <p className="font-semibold">Carregando lançamentos...</p>
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#4a6355' }}>
              <div className="text-4xl mb-3">📋</div>
              <p className="font-semibold">Nenhum lançamento encontrado</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtrados.map((l) => {
                const s = statusConfig[l.status] || statusConfig.pendente
                const proximo = proximoStatus[l.status]
                return (
                  <div key={l.id} className="rounded-2xl p-5"
                    style={{ background: '#fff', border: '1px solid #bbf7d0' }}>

                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0 text-xs"
                        style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
                        {l.tipoImposto}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm truncate" style={{ color: '#052e16' }}>
                            {nomeEmpresa(l.empresaId)}
                          </span>
                          {l.recorrente && (
                            <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                              style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>
                              🔁 Recorrente
                            </span>
                          )}
                        </div>
                        <div className="text-xs mt-0.5" style={{ color: '#4a6355' }}>
                          {l.tipoImposto} · Vence em {l.vencimento}
                        </div>
                        <div className="text-sm font-bold mt-1" style={{ color: '#052e16' }}>
                          R$ {l.valor.toFixed(2).replace('.', ',')}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <span className="text-xs px-2 py-1 rounded-full font-semibold"
                          style={{ background: s.bg, color: s.cor }}>
                          {s.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3 pt-3 flex-wrap"
                      style={{ borderTop: '1px solid #f0fdf4' }}>

                      {l.status !== 'confirmado' && (
                        <button
                          onClick={() => enviarWhatsapp(l.id)}
                          disabled={enviandoWA === l.id}
                          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: enviandoWA === l.id ? '#a8d5b5' : '#25d366',
                            color: '#fff',
                            cursor: enviandoWA === l.id ? 'not-allowed' : 'pointer',
                          }}>
                          {enviandoWA === l.id ? 'Enviando...' : '📱 WhatsApp'}
                        </button>
                      )}

                      {proximo && (
                        <button
                          onClick={() => atualizarStatus(l.id, proximo.valor)}
                          disabled={atualizando === l.id}
                          className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                          style={{
                            background: '#16a34a',
                            color: '#fff',
                            opacity: atualizando === l.id ? 0.6 : 1,
                          }}>
                          {atualizando === l.id ? 'Atualizando...' : proximo.label}
                        </button>
                      )}

                      {l.status !== 'confirmado' && (
                        <button
                          onClick={() => cancelar(l.id)}
                          className="px-4 py-2 rounded-lg text-xs font-semibold"
                          style={{ background: '#fee2e2', color: '#dc2626' }}>
                          Cancelar
                        </button>
                      )}

                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </ProtegerRota>
  )
}