'use client'

import { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { redefinirSenha } from '@/app/lib/authService'

const schema = z.object({
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

type RedefinirForm = z.infer<typeof schema>

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

function RedefinirContent() {
  const params = useSearchParams()
  const token = params.get('token')

  const [mostrarSenha, setMostrarSenha] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [concluido, setConcluido] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [senhaAtual, setSenhaAtual] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RedefinirForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(dados: RedefinirForm) {
    if (!token) {
      setErro('Link inválido. Solicite um novo link de recuperação.')
      return
    }
    setCarregando(true)
    setErro(null)
    try {
      await redefinirSenha(token, dados.senha)
      setConcluido(true)
    } catch {
      setErro('Token inválido ou expirado. Solicite um novo link de recuperação.')
    } finally {
      setCarregando(false)
    }
  }

  const indicador = forca(senhaAtual)

  if (!token) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-6"
          style={{ background: '#fee2e2', border: '2px solid #fca5a5' }}>
          ⚠️
        </div>
        <h2 className="text-2xl font-extrabold mb-2"
          style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
          Link inválido
        </h2>
        <p className="text-sm mb-8" style={{ color: '#4a6355', lineHeight: 1.7 }}>
          Este link de recuperação é inválido ou expirou.
        </p>
        <Link href="/recuperar-senha"
          className="block w-full rounded-xl py-3 font-bold text-sm text-center"
          style={{ background: '#16a34a', color: '#fff', boxShadow: '0 4px 14px rgba(22,163,74,0.35)' }}>
          Solicitar novo link →
        </Link>
      </div>
    )
  }

  return (
    <>
      {!concluido ? (
        <>
          <h2 className="text-2xl font-extrabold mb-1"
            style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
            Redefinir senha
          </h2>
          <p className="text-sm mb-8" style={{ color: '#4a6355' }}>
            Escolha uma nova senha para sua conta.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Nova senha</label>
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

            <div className="flex flex-col gap-1">
              <label className="text-xs uppercase tracking-wide"
                style={{ color: '#14532d', fontWeight: 700 }}>Confirmar nova senha</label>
              <input
                type={mostrarSenha ? 'text' : 'password'}
                placeholder="Repita a senha"
                {...register('confirmarSenha')}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
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
              <div className="rounded-lg px-4 py-3 text-xs"
                style={{ background: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626' }}>
                {erro}
              </div>
            )}

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
              {carregando ? 'Salvando...' : 'Salvar nova senha →'}
            </button>
          </form>
        </>
      ) : (
        <div className="text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-6"
            style={{ background: '#dcfce7', border: '2px solid #86efac' }}>
            ✅
          </div>
          <h2 className="text-2xl font-extrabold mb-2"
            style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
            Senha redefinida!
          </h2>
          <p className="text-sm mb-8" style={{ color: '#4a6355', lineHeight: 1.7 }}>
            Sua senha foi alterada com sucesso. Todas as sessões anteriores foram encerradas.
          </p>
          <Link href="/login"
            className="block w-full rounded-xl py-3 font-bold text-sm text-center transition-all"
            style={{
              background: '#16a34a',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(22,163,74,0.35)',
            }}>
            Ir para o login →
          </Link>
        </div>
      )}
    </>
  )
}

export default function RedefinirSenhaPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-sm">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: '#16a34a', color: '#fff' }}>A</div>
          <span className="font-bold text-sm" style={{ color: '#14532d' }}>AutoReminder Contábil</span>
        </div>

        <Suspense fallback={null}>
          <RedefinirContent />
        </Suspense>

        <p className="text-center text-sm mt-8" style={{ color: '#4a6355' }}>
          <Link href="/login" className="font-semibold" style={{ color: '#16a34a' }}>
            ← Voltar para o login
          </Link>
        </p>

      </div>
    </div>
  )
}
