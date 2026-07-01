'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtegerRota from '../components/ProtegerRota'
import { listarLancamentos, Lancamento } from '../lib/lancamentoService'
import { listarEmpresas, Empresa } from '../lib/empresaService'

const statusConfig: Record<string, { label: string; bg: string; cor: string }> = {
  pendente:   { label: 'Pendente',   bg: '#fef3c7', cor: '#92400e' },
  enviado:    { label: 'Enviado',    bg: '#dbeafe', cor: '#1e40af' },
  confirmado: { label: 'Confirmado', bg: '#dcfce7', cor: '#16a34a' },
  atrasado:   { label: 'Atrasado',   bg: '#fee2e2', cor: '#dc2626' },
}

export default function DashboardPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [periodo, setPeriodo] = useState<'hoje' | 'semana' | 'mes'>('hoje')

  useEffect(() => {
    async function carregar() {
      try {
        const [l, e] = await Promise.all([listarLancamentos(), listarEmpresas()])
        setLancamentos(l)
        setEmpresas(e)
      } catch {
        console.error('Erro ao carregar dashboard')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  function nomeEmpresa(empresaId: string) {
    return empresas.find((e) => e.id === empresaId)?.razaoSocial || 'Empresa'
  }

  const total = lancamentos.length
  const confirmados = lancamentos.filter((l) => l.status === 'confirmado').length
  const pendentes = lancamentos.filter((l) => l.status === 'pendente').length
  const atrasados = lancamentos.filter((l) => l.status === 'atrasado').length
  const enviados = lancamentos.filter((l) => l.status === 'enviado').length

  const resumo = [
    { label: 'Total enviados', valor: enviados, icone: '📤', cor: '#1e40af', bg: '#dbeafe' },
    { label: 'Confirmados', valor: confirmados, icone: '✅', cor: '#16a34a', bg: '#dcfce7' },
    { label: 'Pendentes', valor: pendentes, icone: '⏳', cor: '#92400e', bg: '#fef3c7' },
    { label: 'Atrasados', valor: atrasados, icone: '🚨', cor: '#dc2626', bg: '#fee2e2' },
  ]

  // Taxa de confirmação por empresa
  const taxasPorEmpresa = empresas.map((e) => {
    const lancsDaEmpresa = lancamentos.filter((l) => l.empresaId === e.id)
    const confirmadosDaEmpresa = lancsDaEmpresa.filter((l) => l.status === 'confirmado').length
    const taxa = lancsDaEmpresa.length > 0
      ? Math.round((confirmadosDaEmpresa / lancsDaEmpresa.length) * 100)
      : 0
    return { empresa: e.razaoSocial, taxa }
  }).filter((t) => t.taxa > 0 || empresas.length > 0).slice(0, 3)

  // Próximos vencimentos ordenados por data
  const proximosVencimentos = [...lancamentos]
    .filter((l) => l.status !== 'confirmado')
    .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
    .slice(0, 5)

  function diasRestantes(vencimento: string) {
    const data = new Date(vencimento)
    const hoje = new Date()
    return Math.ceil((data.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  }

  return (
    <ProtegerRota>
      <div className="min-h-screen p-6 md:p-10"
        style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>
                Painel de Monitoramento
              </h1>
              <p className="text-xs mt-1" style={{ color: '#4a6355' }}>
                Acompanhe os disparos e confirmações em tempo real
              </p>
            </div>

            <div className="flex gap-1 p-1 rounded-xl" style={{ background: '#dcfce7' }}>
              {([
                { id: 'hoje', label: 'Hoje' },
                { id: 'semana', label: 'Semana' },
                { id: 'mes', label: 'Mês' },
              ] as const).map((p) => (
                <button key={p.id} onClick={() => setPeriodo(p.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: periodo === p.id ? '#fff' : 'transparent',
                    color: periodo === p.id ? '#16a34a' : '#4a6355',
                    boxShadow: periodo === p.id ? '0 2px 8px rgba(22,163,74,0.15)' : 'none',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards de resumo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {resumo.map((r) => (
              <div key={r.label} className="rounded-2xl p-5"
                style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                  style={{ background: r.bg }}>
                  {r.icone}
                </div>
                <div className="text-2xl font-extrabold" style={{ color: r.cor }}>
                  {carregando ? '...' : r.valor}
                </div>
                <div className="text-xs mt-1" style={{ color: '#4a6355' }}>
                  {r.label}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Próximos vencimentos */}
            <div className="md:col-span-2 rounded-2xl p-5"
              style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-extrabold text-sm" style={{ color: '#052e16' }}>
                  Próximos Vencimentos
                </h2>
                <Link href="/lancamentos" className="text-xs font-semibold"
                  style={{ color: '#16a34a' }}>
                  Ver todos →
                </Link>
              </div>

              {carregando ? (
                <p className="text-xs text-center py-8" style={{ color: '#4a6355' }}>Carregando...</p>
              ) : proximosVencimentos.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-xs font-semibold" style={{ color: '#4a6355' }}>
                    Nenhum vencimento pendente
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {proximosVencimentos.map((v) => {
                    const s = statusConfig[v.status] || statusConfig.pendente
                    const dias = diasRestantes(v.vencimento)
                    return (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl"
                        style={{ background: '#f0fdf4' }}>
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-white text-xs flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>
                          {v.tipoImposto}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold truncate" style={{ color: '#052e16' }}>
                            {nomeEmpresa(v.empresaId)}
                          </div>
                          <div className="text-xs" style={{ color: '#4a6355' }}>
                            R$ {v.valor.toFixed(2).replace('.', ',')} · {v.vencimento}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: s.bg, color: s.cor }}>
                            {s.label}
                          </span>
                          <span className="text-xs" style={{
                            color: dias < 0 ? '#dc2626' : dias <= 2 ? '#92400e' : '#4a6355'
                          }}>
                            {dias < 0 ? `${Math.abs(dias)}d atrasado` : dias === 0 ? 'Vence hoje' : `${dias}d restantes`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Taxa de confirmação */}
            <div className="rounded-2xl p-5"
              style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
              <h2 className="font-extrabold text-sm mb-4" style={{ color: '#052e16' }}>
                Taxa de Confirmação
              </h2>

              {carregando ? (
                <p className="text-xs text-center py-4" style={{ color: '#4a6355' }}>Carregando...</p>
              ) : taxasPorEmpresa.length === 0 ? (
                <p className="text-xs text-center py-4" style={{ color: '#4a6355' }}>
                  Sem dados ainda
                </p>
              ) : (
                <div className="flex flex-col gap-4">
                  {taxasPorEmpresa.map((t) => (
                    <div key={t.empresa}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold truncate" style={{ color: '#052e16' }}>
                          {t.empresa.split(' ')[0]}
                        </span>
                        <span className="text-xs font-bold" style={{
                          color: t.taxa >= 80 ? '#16a34a' : t.taxa >= 60 ? '#92400e' : '#dc2626'
                        }}>
                          {t.taxa}%
                        </span>
                      </div>
                      <div className="h-2 rounded-full w-full" style={{ background: '#dcfce7' }}>
                        <div className="h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${t.taxa}%`,
                            background: t.taxa >= 80 ? '#16a34a' : t.taxa >= 60 ? '#f59e0b' : '#ef4444',
                          }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 flex flex-col gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wide" style={{ color: '#4a6355' }}>
                  Atalhos
                </h3>
                <Link href="/empresas/nova"
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  🏢 Nova empresa
                </Link>
                <Link href="/lancamentos/novo"
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  📋 Novo lançamento
                </Link>
                <Link href="/perfil"
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-semibold"
                  style={{ background: '#f0fdf4', color: '#16a34a' }}>
                  ⚙️ Meu perfil
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </ProtegerRota>
  )
}