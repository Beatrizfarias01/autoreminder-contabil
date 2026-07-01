'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { estaLogado } from '../lib/authService'

export default function ProtegerRota({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [verificando, setVerificando] = useState(true)

  useEffect(() => {
    if (!estaLogado()) {
      router.push('/login')
    } else {
      setVerificando(false)
    }
  }, [router])

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center"
        style={{ background: '#f0fdf4' }}>
        <div className="text-center">
          <div className="text-4xl mb-3">⏳</div>
          <p className="text-sm font-semibold" style={{ color: '#4a6355' }}>
            Verificando acesso...
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}