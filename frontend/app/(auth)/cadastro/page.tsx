'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import axios from 'axios'
import { cadastrar, salvarTokens } from '@/app/lib/authService'

const cadastroSchema = z.object({
  nomeCompleto: z.string().min(3, 'Informe seu nome completo'),
  nomeEscritorio: z.string().min(2, 'Informe o nome do escritório'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().min(10, 'Telefone inválido'),
  senha: z.string()
    .min(8, 'Mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Precisa ter uma letra maiúscula')
    .regex(/[a-z]/, 'Precisa ter uma letra minúscula')
    .regex(/[0-9]/, 'Precisa ter um número'),
  confirmarSenha: z.string(),
}).refine((d) => d.senha === d.confirmarSenha, {
  message: 'As senhas não coincidem',
  path: ['confirmarSenha'],
})

type CadastroForm = z.infer<typeof cadastroSchema>

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

export default function CadastroPage() {
  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [erro, setErro] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroForm>({
    resolver: zodResolver(cadastroSchema),
  })

  async function onSubmit(dados: CadastroForm) {
    setCarregando(true)
    setErro('')
    try {
      const res = await cadastrar({
        nomeCompleto: dados.nomeCompleto,
        nomeEscritorio: dados.nomeEscritorio,
        email: dados.email,
        telefone: dados.telefone,
        senha: dados.senha,
      })
      salvarTokens(res.accessToken, res.refreshToken)
      window.location.href = '/dashboard'
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (!e.response) {
          setErro('Não foi possível conectar ao servidor. Verifique se o backend está rodando na porta 8000.')
        } else {
          const detail = e.response.data?.detail
          if (Array.isArray(detail)) {
            setErro('Dados inválidos: ' + detail.map((d: { msg: string }) => d.msg).join(', '))
          } else {
            setErro(detail ?? `Erro ${e.response.status}. Tente novamente.`)
          }
        }
      } else {
        setErro('Erro inesperado. Tente novamente.')
      }
    } finally {
      setCarregando(false)
    }
  }

  const indicador = forca(senhaAtual)

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: '#16a34a', color: '#fff' }}>A</div>
          <span className="font-bold text-sm" style={{ color: '#14532d' }}>AutoReminder Contábil</span>
        </div>

        <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
          Criar conta grátis
        </h2>
        <p className="text-sm mb-8" style={{ color: '#4a6355' }}>
          Preencha os dados do seu escritório para começar
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Nome completo + Escritório */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Nome completo</label>
              <input
                type="text"
                placeholder="Carlos Mendes"
                {...register('nomeCompleto')}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: '#fff',
                  border: errors.nomeCompleto ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }}
              />
              {errors.nomeCompleto && (
                <span className="text-xs" style={{ color: '#dc2626' }}>{errors.nomeCompleto.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Nome do escritório</label>
              <input
                type="text"
                placeholder="Mendes Contabilidade"
                {...register('nomeEscritorio')}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: '#fff',
                  border: errors.nomeEscritorio ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }}
              />
              {errors.nomeEscritorio && (
                <span className="text-xs" style={{ color: '#dc2626' }}>{errors.nomeEscritorio.message}</span>
              )}
            </div>
          </div>

          {/* E-mail + Telefone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>E-mail</label>
              <input
                type="email"
                placeholder="carlos@escritorio.com.br"
                {...register('email')}
                className="rounded-xl px-4 py-3 text-sm outline-none"
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
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Telefone</label>
              <input
                type="tel"
                placeholder="(77) 99999-9999"
                {...register('telefone')}
                className="rounded-xl px-4 py-3 text-sm outline-none"
                style={{
                  background: '#fff',
                  border: errors.telefone ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }}
              />
              {errors.telefone && (
                <span className="text-xs" style={{ color: '#dc2626' }}>{errors.telefone.message}</span>
              )}
            </div>
          </div>

          {/* Senha */}
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide"
              style={{ color: '#14532d', fontWeight: 700 }}>Senha</label>
            <div className="relative">
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                {...register('senha', {
                  onChange: (e) => setSenhaAtual(e.target.value),
                })}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none pr-11"
                style={{
                  background: '#fff',
                  border: errors.senha ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                  color: '#1a2e1f',
                }}
              />
              <button type="button" onClick={() => setMostrarSenha(!mostrarSenha)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm"
                style={{ color: '#4a6355' }}>
                {mostrarSenha ? '🙈' : '👁'}
              </button>
            </div>
            {errors.senha && (
              <span className="text-xs" style={{ color: '#dc2626' }}>{errors.senha.message}</span>
            )}
            {/* Indicador de força */}
            {senhaAtual.length > 0 && (
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

          {/* Confirmar senha */}
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wide"
              style={{ color: '#14532d', fontWeight: 700 }}>Confirmar senha</label>
            <input
              type={mostrarSenha ? 'text' : 'password'}
              placeholder="Repita a senha"
              {...register('confirmarSenha')}
              className="rounded-xl px-4 py-3 text-sm outline-none"
              style={{
                background: '#fff',
                border: errors.confirmarSenha ? '1.5px solid #f87171' : '1.5px solid #bbf7d0',
                color: '#1a2e1f',
              }}
            />
            {errors.confirmarSenha && (
              <span className="text-xs" style={{ color: '#dc2626' }}>{errors.confirmarSenha.message}</span>
            )}
          </div>

          {erro && (
            <div className="rounded-lg px-4 py-3 text-sm flex items-start gap-2"
              style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b' }}>
              <span className="mt-0.5">⚠</span>
              <span>{erro}</span>
            </div>
          )}

          {/* Botão */}
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
            {carregando ? 'Criando conta...' : 'Criar conta grátis →'}
          </button>

        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#4a6355' }}>
          Já tem conta?{' '}
          <Link href="/login" className="font-semibold" style={{ color: '#16a34a' }}>
            Fazer login
          </Link>
        </p>

      </div>
    </div>
  )
}