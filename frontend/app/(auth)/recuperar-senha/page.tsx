'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { recuperarSenha } from '@/app/lib/authService'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
})

type RecuperarForm = z.infer<typeof schema>

export default function RecuperarSenhaPage() {
  const [enviado, setEnviado] = useState(false)
  const [carregando, setCarregando] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RecuperarForm>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(dados: RecuperarForm) {
    setCarregando(true)
    try {
      await recuperarSenha(dados.email)
    } catch {
      // Silencia o erro para não revelar se o e-mail existe (RF12)
    } finally {
      setCarregando(false)
      setEnviado(true)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#f0fdf4', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
            style={{ background: '#16a34a', color: '#fff' }}>A</div>
          <span className="font-bold text-sm" style={{ color: '#14532d' }}>AutoReminder Contábil</span>
        </div>

        {!enviado ? (
          <>
            <h2 className="text-2xl font-extrabold mb-1"
              style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
              Recuperar senha
            </h2>
            <p className="text-sm mb-8" style={{ color: '#4a6355' }}>
              Informe seu e-mail e enviaremos as instruções para redefinir sua senha.
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs uppercase tracking-wide"
                  style={{ color: '#14532d', fontWeight: 700 }}>E-mail</label>
                <input
                  type="email"
                  placeholder="contador@escritorio.com.br"
                  {...register('email')}
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
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

              {/* Aviso de segurança — não confirma se e-mail existe (RF12) */}
              <div className="rounded-lg px-4 py-3 text-xs flex items-start gap-2"
                style={{ background: '#fefce8', border: '1px solid #fde68a', color: '#78350f' }}>
                <span>🔒</span>
                <span>Se este e-mail estiver cadastrado, você receberá as instruções em breve.</span>
              </div>

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
                {carregando ? 'Enviando...' : 'Enviar instruções →'}
              </button>
            </form>
          </>
        ) : (
          /* Tela de confirmação */
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-6"
              style={{ background: '#dcfce7', border: '2px solid #86efac' }}>
              ✉️
            </div>
            <h2 className="text-2xl font-extrabold mb-2"
              style={{ color: '#052e16', letterSpacing: '-0.02em' }}>
              Verifique seu e-mail
            </h2>
            <p className="text-sm mb-8" style={{ color: '#4a6355', lineHeight: 1.7 }}>
              Se este e-mail estiver cadastrado, você receberá as instruções em breve.
              O link expira em <strong>1 hora</strong>.
            </p>
            <div className="rounded-xl p-4 mb-6 text-sm"
              style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#14532d' }}>
              Não recebeu? Verifique a caixa de spam ou{' '}
              <button onClick={() => setEnviado(false)}
                className="font-semibold underline" style={{ color: '#16a34a' }}>
                tente novamente
              </button>.
            </div>
          </div>
        )}

        <p className="text-center text-sm mt-8" style={{ color: '#4a6355' }}>
          <Link href="/login" className="font-semibold" style={{ color: '#16a34a' }}>
            ← Voltar para o login
          </Link>
        </p>

      </div>
    </div>
  )
}