'use client'

import { useState, useEffect } from 'react'
import { listarLancamentos, Lancamento } from '../lib/lancamentoService'
import { listarEmpresas, Empresa } from '../lib/empresaService'
import ProtegerRota from '../components/ProtegerRota'

const statusConfig: Record<string, { bg: string; cor: string; label: string }> = {
  pendente:   { bg: '#fef3c7', cor: '#92400e', label: 'Pendente' },
  enviado:    { bg: '#dbeafe', cor: '#1e40af', label: 'Enviado' },
  confirmado: { bg: '#dcfce7', cor: '#16a34a', label: 'Confirmado' },
  atrasado:   { bg: '#fee2e2', cor: '#dc2626', label: 'Atrasado' },
}

const meses = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const diasSemana = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

export default function CalendarioPage() {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)
  const [hoje] = useState(new Date())
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null)

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

  function lancamentosDoDia(dia: number) {
    return lancamentos.filter((l) => {
      const data = new Date(l.vencimento)
      return data.getDate() === dia &&
        data.getMonth() === mesAtual &&
        data.getFullYear() === anoAtual
    })
  }

  function lancamentosDoMes() {
    return lancamentos.filter((l) => {
      const data = new Date(l.vencimento)
      return data.getMonth() === mesAtual && data.getFullYear() === anoAtual
    })
  }

  function mesAnterior() {
    if (mesAtual === 0) { setMesAtual(11); setAnoAtual(a => a - 1) }
    else setMesAtual(m => m - 1)
    setDiaSelecionado(null)
  }

  function proximoMes() {
    if (mesAtual === 11) { setMesAtual(0); setAnoAtual(a => a + 1) }
    else setMesAtual(m => m + 1)
    setDiaSelecionado(null)
  }

  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const celulas = Array.from({ length: primeiroDia + diasNoMes }, (_, i) =>
    i < primeiroDia ? null : i - primeiroDia + 1
  )

  const lancamentosHoje = diaSelecionado
    ? lancamentosDoDia(diaSelecionado)
    : lancamentosDoMes()

  return (
    <ProtegerRota>
      <div className="min-h-screen p-6 md:p-10"
        style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>
                Calendário de Vencimentos
              </h1>
              <p className="text-xs mt-1" style={{ color: '#4a6355' }}>
                {lancamentosDoMes().length} vencimento{lancamentosDoMes().length !== 1 ? 's' : ''} em {meses[mesAtual]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            <div className="md:col-span-2 rounded-2xl p-5"
              style={{ background: '#fff', border: '1px solid #bbf7d0' }}>

              <div className="flex items-center justify-between mb-4">
                <button onClick={mesAnterior}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>
                  ←
                </button>
                <h2 className="font-extrabold text-sm" style={{ color: '#052e16' }}>
                  {meses[mesAtual]} {anoAtual}
                </h2>
                <button onClick={proximoMes}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm"
                  style={{ background: '#dcfce7', color: '#16a34a' }}>
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 mb-2">
                {diasSemana.map((d) => (
                  <div key={d} className="text-center text-xs font-bold py-1"
                    style={{ color: '#4a6355' }}>
                    {d}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {celulas.map((dia, i) => {
                  if (!dia) return <div key={i} />
                  const eventos = lancamentosDoDia(dia)
                  const ehHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()
                  const selecionado = dia === diaSelecionado
                  return (
                    <button key={i}
                      onClick={() => setDiaSelecionado(dia === diaSelecionado ? null : dia)}
                      className="rounded-xl p-1 min-h-[52px] flex flex-col items-center gap-0.5 transition-all"
                      style={{
                        background: selecionado ? '#16a34a' : ehHoje ? '#dcfce7' : 'transparent',
                        border: ehHoje && !selecionado ? '1.5px solid #16a34a' : '1.5px solid transparent',
                      }}>
                      <span className="text-xs font-bold"
                        style={{ color: selecionado ? '#fff' : ehHoje ? '#16a34a' : '#052e16' }}>
                        {dia}
                      </span>
                      {eventos.slice(0, 2).map((e, j) => {
                        const s = statusConfig[e.status] || statusConfig.pendente
                        return (
                          <div key={j} className="w-full rounded text-center"
                            style={{
                              background: selecionado ? 'rgba(255,255,255,0.3)' : s.bg,
                              padding: '1px 2px',
                            }}>
                            <span className="text-xs font-bold"
                              style={{ color: selecionado ? '#fff' : s.cor, fontSize: '9px' }}>
                              {e.tipoImposto}
                            </span>
                          </div>
                        )
                      })}
                      {eventos.length > 2 && (
                        <span className="text-xs" style={{ color: selecionado ? '#fff' : '#4a6355', fontSize: '9px' }}>
                          +{eventos.length - 2}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="rounded-2xl p-5"
              style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
              <h3 className="font-extrabold text-sm mb-4" style={{ color: '#052e16' }}>
                {diaSelecionado
                  ? `${diaSelecionado} de ${meses[mesAtual]}`
                  : `${meses[mesAtual]} completo`}
              </h3>

              {carregando ? (
                <p className="text-xs text-center py-8" style={{ color: '#4a6355' }}>Carregando...</p>
              ) : lancamentosHoje.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📅</div>
                  <p className="text-xs font-semibold" style={{ color: '#4a6355' }}>
                    {diaSelecionado ? 'Nenhum vencimento neste dia' : 'Nenhum vencimento este mês'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lancamentosHoje.map((l) => {
                    const s = statusConfig[l.status] || statusConfig.pendente
                    return (
                      <div key={l.id} className="rounded-xl p-3"
                        style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                            style={{ background: 'linear-gradient(135deg, #166534, #16a34a)', color: '#fff' }}>
                            {l.tipoImposto}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={{ background: s.bg, color: s.cor }}>
                            {s.label}
                          </span>
                        </div>
                        <p className="text-xs font-semibold mt-1" style={{ color: '#052e16' }}>
                          {nomeEmpresa(l.empresaId)}
                        </p>
                        <p className="text-sm font-extrabold mt-0.5" style={{ color: '#16a34a' }}>
                          R$ {l.valor.toFixed(2).replace('.', ',')}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#4a6355' }}>
                          Vence: {l.vencimento}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </ProtegerRota>
  )
}