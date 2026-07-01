'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { listarEmpresas, excluirEmpresa, Empresa } from '../lib/empresaService'
import ProtegerRota from '../components/ProtegerRota'

export default function EmpresasPage() {
  const [busca, setBusca] = useState('')
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const dados = await listarEmpresas()
        setEmpresas(dados)
      } catch {
        console.error('Erro ao carregar empresas')
      } finally {
        setCarregando(false)
      }
    }
    carregar()
  }, [])

  const empresasFiltradas = empresas.filter((e) =>
    e.razaoSocial.toLowerCase().includes(busca.toLowerCase()) ||
    e.cnpj.includes(busca)
  )

  async function excluir(id: string) {
    if (confirm('Tem certeza que deseja excluir esta empresa?')) {
      try {
        await excluirEmpresa(id)
        setEmpresas((prev) => prev.filter((e) => e.id !== id))
      } catch {
        alert('Erro ao excluir empresa')
      }
    }
  }

  return (
    <ProtegerRota>
      <div className="min-h-screen p-6 md:p-10"
        style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>
                Empresas Clientes
              </h1>
              <p className="text-xs mt-1" style={{ color: '#4a6355' }}>
                {empresas.length} empresa{empresas.length !== 1 ? 's' : ''} cadastrada{empresas.length !== 1 ? 's' : ''}
              </p>
            </div>
            <Link href="/empresas/nova"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
              style={{
                background: '#16a34a',
                color: '#fff',
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              }}>
              + Nova Empresa
            </Link>
          </div>

          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar por nome ou CNPJ..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: '#fff', border: '1.5px solid #bbf7d0', color: '#1a2e1f' }}
            />
          </div>

          {carregando ? (
            <div className="text-center py-16" style={{ color: '#4a6355' }}>
              <div className="text-4xl mb-3">⏳</div>
              <p className="font-semibold">Carregando empresas...</p>
            </div>
          ) : empresasFiltradas.length === 0 ? (
            <div className="text-center py-16" style={{ color: '#4a6355' }}>
              <div className="text-4xl mb-3">🏢</div>
              <p className="font-semibold">Nenhuma empresa encontrada</p>
              <p className="text-xs mt-1">Cadastre sua primeira empresa!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {empresasFiltradas.map((empresa) => (
                <div key={empresa.id} className="rounded-2xl p-5 flex items-center gap-4"
                  style={{ background: '#fff', border: '1px solid #bbf7d0' }}>

                  <div className="w-11 h-11 rounded-xl flex items-center justify-center font-black text-white flex-shrink-0 text-sm"
                    style={{ background: empresa.ativo ? 'linear-gradient(135deg, #166534, #16a34a)' : '#9ca3af' }}>
                    {empresa.razaoSocial.charAt(0)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm truncate" style={{ color: '#052e16' }}>
                        {empresa.razaoSocial}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-semibold"
                        style={{
                          background: empresa.ativo ? '#dcfce7' : '#f3f4f6',
                          color: empresa.ativo ? '#16a34a' : '#6b7280',
                        }}>
                        {empresa.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#4a6355' }}>
                      {empresa.cnpj} · {empresa.nomeResponsavel}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: '#4a6355' }}>
                      {empresa.whatsapp} · {empresa.email}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link href={`/empresas/${empresa.id}/editar`}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: '#dcfce7', color: '#16a34a' }}>
                      Editar
                    </Link>
                    <button onClick={() => excluir(empresa.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: '#fee2e2', color: '#dc2626' }}>
                      Excluir
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </ProtegerRota>
  )
}