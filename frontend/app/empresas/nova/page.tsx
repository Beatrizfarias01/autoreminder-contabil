'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { criarEmpresa } from '../../lib/empresaService'

function validarCNPJ(cnpj: string) {
  const nums = cnpj.replace(/\D/g, '')
  if (nums.length !== 14) return false
  if (/^(\d)\1+$/.test(nums)) return false
  return true
}

const schema = z.object({
  razaoSocial: z.string().min(2, 'Informe a razão social'),
  cnpj: z.string().refine((v) => validarCNPJ(v), 'CNPJ inválido'),
  nomeResponsavel: z.string().min(2, 'Informe o nome do responsável'),
  whatsapp: z.string().min(10, 'WhatsApp inválido'),
  email: z.string().email('E-mail inválido'),
})

type NovaEmpresaForm = z.infer<typeof schema>

function mascaraCNPJ(v: string) {
  return v.replace(/\D/g, '').slice(0, 14)
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

function mascaraWhatsApp(v: string) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function NovaEmpresaPage() {
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [whatsapp, setWhatsapp] = useState('')

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<NovaEmpresaForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(dados: NovaEmpresaForm) {
    setCarregando(true)
    setErro('')
    try {
      await criarEmpresa(dados)
      window.location.href = '/empresas'
    } catch {
      setErro('Erro ao cadastrar empresa. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-10"
      style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="max-w-lg mx-auto">

        <div className="flex items-center gap-3 mb-8">
          <Link href="/empresas"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: '#dcfce7', color: '#16a34a' }}>
            ←
          </Link>
          <div>
            <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>Nova Empresa</h1>
            <p className="text-xs" style={{ color: '#4a6355' }}>Cadastre uma empresa cliente</p>
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

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Razão Social</label>
              <input type="text" placeholder="Silva Comércio Ltda"
                {...register('razaoSocial')}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: '#f0fdf4',
                  border: errors.razaoSocial ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }} />
              {errors.razaoSocial && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.razaoSocial.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>CNPJ</label>
              <input type="text" placeholder="00.000.000/0001-00"
                value={cnpj}
                {...register('cnpj')}
                onChange={(e) => {
                  const masked = mascaraCNPJ(e.target.value)
                  setCnpj(masked)
                  setValue('cnpj', masked)
                }}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: '#f0fdf4',
                  border: errors.cnpj ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }} />
              {errors.cnpj && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.cnpj.message}</span>}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Nome do Responsável</label>
              <input type="text" placeholder="João Silva"
                {...register('nomeResponsavel')}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: '#f0fdf4',
                  border: errors.nomeResponsavel ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }} />
              {errors.nomeResponsavel && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.nomeResponsavel.message}</span>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>WhatsApp</label>
                <input type="text" placeholder="(77) 99999-9999"
                  value={whatsapp}
                  {...register('whatsapp')}
                  onChange={(e) => {
                    const masked = mascaraWhatsApp(e.target.value)
                    setWhatsapp(masked)
                    setValue('whatsapp', masked)
                  }}
                  className="rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: '#f0fdf4',
                    border: errors.whatsapp ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                    color: '#1a2e1f',
                  }} />
                {errors.whatsapp && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.whatsapp.message}</span>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>E-mail</label>
                <input type="email" placeholder="joao@empresa.com.br"
                  {...register('email')}
                  className="rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: '#f0fdf4',
                    border: errors.email ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                    color: '#1a2e1f',
                  }} />
                {errors.email && <span className="text-xs" style={{ color: '#dc2626' }}>{errors.email.message}</span>}
              </div>
            </div>

            <div className="flex gap-3 mt-2">
              <Link href="/empresas"
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
                {carregando ? 'Salvando...' : 'Cadastrar →'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}