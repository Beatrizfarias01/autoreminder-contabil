'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe sua senha'),
  lembrar: z.boolean().optional(),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erroGeral, setErroGeral] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(dados: LoginForm) {
    setCarregando(true)
    setErroGeral('')
    try {
      console.log('Login:', dados)
      await new Promise((r) => setTimeout(r, 1200))
    } catch {
      setErroGeral('E-mail ou senha incorretos. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* Painel esquerdo */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12"
        style={{ background: 'linear-gradient(135deg, #052e16 0%, #166534 60%, #15803d 100%)' }}>
        <div>
          <div className="flex items-center gap-2 mb-16">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
              style={{ background: '#4ade80', color: '#052e16' }}>A</div>
            <span className="font-bold text-white text-sm tracking-wide">AutoReminder Contábil</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Seus clientes nunca mais<br />
            <span style={{ color: '#4ade80' }}>perderão um vencimento.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Automatize lembretes de DAS, DARF, GPS e muito mais.<br />
            Do lançamento ao comprovante, sem trabalho manual.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { valor: '98%', label: 'taxa de entrega' },
            { valor: '3min', label: 'tempo de setup' },
            { valor: '0', label: 'lembretes manuais' },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="text-2xl font-black" style={{ color: '#4ade80' }}>{s.valor}</div>
              <div className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#f0fdf4' }}>
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
              style={{ background: '#16a34a', color: '#fff' }}>A</div>
            <span className="font-bold text-sm" style={{ color: '#14532d' }}>AutoReminder Contábil</span>
          </div>

          <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
            Entrar na conta
          </h2>
          <p className="text-sm mb-8" style={{ color: '#4a6355' }}>
            Acesse o painel do seu escritório
          </p>

          {erroGeral && (
            <div className="rounded-lg px-4 py-3 mb-5 text-sm flex items-start gap-2"
              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
              <span className="mt-0.5">⚠</span>
              <span>{erroGeral}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700, letterSpacing: '0.08em' }}>
                E-mail
              </label>
              <input
                type="email"
                placeholder="contador@escritorio.com.br"
                {...register('email')}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all"
                style={{
                  background: '#fff',
                  border: errors.email ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }}
              />
              {errors.email && (
                <span className="text-xs" style={{ color: '#dc2626' }}>{errors.email.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700, letterSpacing: '0.08em' }}>
                  Senha
                </label>
                <Link href="/recuperar-senha" className="text-xs font-medium"
                  style={{ color: '#16a34a' }}>
                  Esqueci minha senha
                </Link>
              </div>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('senha')}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none transition-all pr-11"
                  style={{
                    background: '#fff',
                    border: errors.senha ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                    color: '#1a2e1f',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                  style={{ color: '#4a6355' }}>
                  {mostrarSenha ? '🙈' : '👁'}
                </button>
              </div>
              {errors.senha && (
                <span className="text-xs" style={{ color: '#dc2626' }}>{errors.senha.message}</span>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('lembrar')}
                className="w-4 h-4 rounded accent-green-600"
              />
              <span className="text-sm" style={{ color: '#4a6355' }}>Manter conectado por 30 dias</span>
            </label>

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-xl py-3 font-bold text-sm mt-1 transition-all"
              style={{
                background: carregando ? '#86efac' : '#16a34a',
                color: '#fff',
                cursor: carregando ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
              }}>
              {carregando ? 'Entrando...' : 'Entrar →'}
            </button>

          </form>

          <p className="text-center text-sm mt-8" style={{ color: '#4a6355' }}>
            Ainda não tem conta?{' '}
            <Link href="/cadastro" className="font-semibold" style={{ color: '#16a34a' }}>
              Criar conta grátis
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}