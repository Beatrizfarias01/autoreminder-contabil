'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ProtegerRota from '../components/ProtegerRota'

const perfilSchema = z.object({
  nomeCompleto: z.string().min(3, 'Informe seu nome completo'),
  nomeEscritorio: z.string().min(2, 'Informe o nome do escritório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  assinatura: z.string().optional(),
})

const senhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Informe a senha atual'),
  novaSenha: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa ter uma letra maiúscula')
    .regex(/[a-z]/, 'Precisa ter uma letra minúscula')
    .regex(/[0-9]/, 'Precisa ter um número'),
  confirmarSenha: z.string(),
}).refine((d) => d.novaSenha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

type PerfilForm = z.infer<typeof perfilSchema>
type SenhaForm = z.infer<typeof senhaSchema>

function forca(senha: string) {
  let pts = 0
  if (senha.length >= 8) pts++
  if (/[A-Z]/.test(senha)) pts++
  if (/[a-z]/.test(senha)) pts++
  if (/[0-9]/.test(senha)) pts++
  if (/[^A-Za-z0-9]/.test(senha)) pts++
  if (pts <= 2) return { label: 'Fraca', cor: '#ef4444', largura: '33%' }
  if (pts <= 3) return { label: 'Média', cor: '#f59e0b', largura: '66%' }
  return { label: 'Forte', cor: '#16a34a', largura: '100%' }
}

export default function PerfilPage() {
  const [abaSelecionada, setAbaSelecionada] = useState<'dados' | 'senha'>('dados')
  const [salvandoDados, setSalvandoDados] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [sucessoDados, setSucessoDados] = useState(false)
  const [sucessoSenha, setSucessoSenha] = useState(false)
  const [novaSenhaAtual, setNovaSenhaAtual] = useState('')
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const perfilForm = useForm<PerfilForm>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nomeCompleto: 'Carlos Mendes',
      nomeEscritorio: 'Mendes Contabilidade',
      email: 'carlos@mendescontabil.com.br',
      telefone: '(77) 99999-9999',
      assinatura: 'Mendes Contabilidade | (77) 99999-9999',
    },
  })

  const senhaForm = useForm<SenhaForm>({
    resolver: zodResolver(senhaSchema),
  })

  async function salvarDados(dados: PerfilForm) {
    setSalvandoDados(true)
    setSucessoDados(false)
    try {
      console.log('Salvar perfil:', dados)
      await new Promise((r) => setTimeout(r, 1000))
      setSucessoDados(true)
      setTimeout(() => setSucessoDados(false), 3000)
    } finally {
      setSalvandoDados(false)
    }
  }

  async function salvarSenha(dados: SenhaForm) {
    setSalvandoSenha(true)
    setSucessoSenha(false)
    try {
      console.log('Trocar senha:', dados)
      await new Promise((r) => setTimeout(r, 1000))
      setSucessoSenha(true)
      senhaForm.reset()
      setNovaSenhaAtual('')
      setTimeout(() => setSucessoSenha(false), 3000)
    } finally {
      setSalvandoSenha(false)
    }
  }

  const indicador = forca(novaSenhaAtual)

  return (
    <ProtegerRota>
      <div className="min-h-screen p-6 md:p-10"
        style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div className="max-w-2xl mx-auto">

          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white"
              style={{ background: '#16a34a' }}>C</div>
            <div>
              <h1 className="text-xl font-extrabold" style={{ color: '#052e16' }}>
                Perfil do Escritório
              </h1>
              <p className="text-xs" style={{ color: '#4a6355' }}>
                Gerencie os dados da sua conta
              </p>
            </div>
          </div>

          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
            style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #166534, #16a34a)' }}>C</div>
            <div className="flex-1">
              <div className="font-bold text-sm" style={{ color: '#052e16' }}>Carlos Mendes</div>
              <div className="text-xs" style={{ color: '#4a6355' }}>Mendes Contabilidade</div>
              <div className="text-xs mt-1" style={{ color: '#4a6355' }}>carlos@mendescontabil.com.br</div>
            </div>
            <div className="text-xs font-bold px-3 py-1 rounded-full"
              style={{ background: '#dcfce7', color: '#16a34a' }}>
              Plano Pro
            </div>
          </div>

          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: '#dcfce7' }}>
            {[
              { id: 'dados', label: '📋 Dados do Escritório' },
              { id: 'senha', label: '🔐 Alterar Senha' },
            ].map((aba) => (
              <button key={aba.id}
                onClick={() => setAbaSelecionada(aba.id as 'dados' | 'senha')}
                className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold transition-all"
                style={{
                  background: abaSelecionada === aba.id ? '#fff' : 'transparent',
                  color: abaSelecionada === aba.id ? '#16a34a' : '#4a6355',
                  boxShadow: abaSelecionada === aba.id ? '0 2px 8px rgba(22,163,74,0.15)' : 'none',
                }}>
                {aba.label}
              </button>
            ))}
          </div>

          {abaSelecionada === 'dados' && (
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
              {sucessoDados && (
                <div className="rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2"
                  style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#14532d' }}>
                  ✅ Dados salvos com sucesso!
                </div>
              )}
              <form onSubmit={perfilForm.handleSubmit(salvarDados)} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-wide"
                      style={{ color: '#14532d', fontWeight: 700 }}>Nome completo</label>
                    <input {...perfilForm.register('nomeCompleto')}
                      className="rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: '#f0fdf4',
                        border: perfilForm.formState.errors.nomeCompleto ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                        color: '#1a2e1f',
                      }} />
                    {perfilForm.formState.errors.nomeCompleto && (
                      <span className="text-xs" style={{ color: '#dc2626' }}>
                        {perfilForm.formState.errors.nomeCompleto.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-wide"
                      style={{ color: '#14532d', fontWeight: 700 }}>Nome do escritório</label>
                    <input {...perfilForm.register('nomeEscritorio')}
                      className="rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: '#f0fdf4',
                        border: perfilForm.formState.errors.nomeEscritorio ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                        color: '#1a2e1f',
                      }} />
                    {perfilForm.formState.errors.nomeEscritorio && (
                      <span className="text-xs" style={{ color: '#dc2626' }}>
                        {perfilForm.formState.errors.nomeEscritorio.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-wide"
                      style={{ color: '#14532d', fontWeight: 700 }}>E-mail</label>
                    <input type="email" {...perfilForm.register('email')}
                      className="rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: '#f0fdf4',
                        border: perfilForm.formState.errors.email ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                        color: '#1a2e1f',
                      }} />
                    {perfilForm.formState.errors.email && (
                      <span className="text-xs" style={{ color: '#dc2626' }}>
                        {perfilForm.formState.errors.email.message}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs uppercase tracking-wide"
                      style={{ color: '#14532d', fontWeight: 700 }}>Telefone</label>
                    <input type="tel" {...perfilForm.register('telefone')}
                      className="rounded-xl px-4 py-3 text-sm outline-none"
                      style={{
                        background: '#f0fdf4',
                        border: perfilForm.formState.errors.telefone ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                        color: '#1a2e1f',
                      }} />
                    {perfilForm.formState.errors.telefone && (
                      <span className="text-xs" style={{ color: '#dc2626' }}>
                        {perfilForm.formState.errors.telefone.message}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide"
                    style={{ color: '#14532d', fontWeight: 700 }}>Assinatura das mensagens</label>
                  <input {...perfilForm.register('assinatura')}
                    placeholder="Ex: Mendes Contabilidade | (77) 99999-9999"
                    className="rounded-xl px-4 py-3 text-sm outline-none"
                    style={{ background: '#f0fdf4', border: '1.5px solid #bbf7d0', color: '#1a2e1f' }} />
                  <span className="text-xs" style={{ color: '#4a6355' }}>
                    Aparece no final de cada mensagem enviada aos clientes
                  </span>
                </div>
                <button type="submit" disabled={salvandoDados}
                  className="w-full rounded-xl py-3 font-bold text-sm mt-1 transition-all"
                  style={{
                    background: salvandoDados ? '#86efac' : '#16a34a',
                    color: '#fff',
                    cursor: salvandoDados ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  }}>
                  {salvandoDados ? 'Salvando...' : 'Salvar alterações →'}
                </button>
              </form>
            </div>
          )}

          {abaSelecionada === 'senha' && (
            <div className="rounded-2xl p-6" style={{ background: '#fff', border: '1px solid #bbf7d0' }}>
              {sucessoSenha && (
                <div className="rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2"
                  style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#14532d' }}>
                  ✅ Senha alterada com sucesso!
                </div>
              )}
              <form onSubmit={senhaForm.handleSubmit(salvarSenha)} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide"
                    style={{ color: '#14532d', fontWeight: 700 }}>Senha atual</label>
                  <input type={mostrarSenha ? 'text' : 'password'} placeholder="••••••••"
                    {...senhaForm.register('senhaAtual')}
                    className="rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      background: '#f0fdf4',
                      border: senhaForm.formState.errors.senhaAtual ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                      color: '#1a2e1f',
                    }} />
                  {senhaForm.formState.errors.senhaAtual && (
                    <span className="text-xs" style={{ color: '#dc2626' }}>
                      {senhaForm.formState.errors.senhaAtual.message}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide"
                    style={{ color: '#14532d', fontWeight: 700 }}>Nova senha</label>
                  <div className="relative">
                    <input type={mostrarSenha ? 'text' : 'password'} placeholder="Mínimo 8 caracteres"
                      {...senhaForm.register('novaSenha', {
                        onChange: (e) => setNovaSenhaAtual(e.target.value),
                      })}
                      className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-11"
                      style={{
                        background: '#f0fdf4',
                        border: senhaForm.formState.errors.novaSenha ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                        color: '#1a2e1f',
                      }} />
                    <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                      style={{ color: '#4a6355' }}>
                      {mostrarSenha ? '🙈' : '👁'}
                    </button>
                  </div>
                  {senhaForm.formState.errors.novaSenha && (
                    <span className="text-xs" style={{ color: '#dc2626' }}>
                      {senhaForm.formState.errors.novaSenha.message}
                    </span>
                  )}
                  {novaSenhaAtual.length > 0 && (
                    <div className="mt-1">
                      <div className="h-1.5 rounded-full w-full" style={{ background: '#dcfce7' }}>
                        <div className="h-1.5 rounded-full transition-all duration-300"
                          style={{ width: indicador.largura, background: indicador.cor }} />
                      </div>
                      <span className="text-xs mt-1 font-medium" style={{ color: indicador.cor }}>
                        Senha {indicador.label}
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-wide"
                    style={{ color: '#14532d', fontWeight: 700 }}>Confirmar nova senha</label>
                  <input type={mostrarSenha ? 'text' : 'password'} placeholder="Repita a nova senha"
                    {...senhaForm.register('confirmarSenha')}
                    className="rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      background: '#f0fdf4',
                      border: senhaForm.formState.errors.confirmarSenha ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                      color: '#1a2e1f',
                    }} />
                  {senhaForm.formState.errors.confirmarSenha && (
                    <span className="text-xs" style={{ color: '#dc2626' }}>
                      {senhaForm.formState.errors.confirmarSenha.message}
                    </span>
                  )}
                </div>
                <button type="submit" disabled={salvandoSenha}
                  className="w-full rounded-xl py-3 font-bold text-sm mt-1 transition-all"
                  style={{
                    background: salvandoSenha ? '#86efac' : '#16a34a',
                    color: '#fff',
                    cursor: salvandoSenha ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
                  }}>
                  {salvandoSenha ? 'Salvando...' : 'Alterar senha →'}
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </ProtegerRota>
  )
}