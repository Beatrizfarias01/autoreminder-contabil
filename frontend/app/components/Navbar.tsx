'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Painel', icone: '📊' },
  { href: '/empresas', label: 'Empresas', icone: '🏢' },
  { href: '/lancamentos', label: 'Lançamentos', icone: '📋' },
  { href: '/calendario', label: 'Calendário', icone: '📅' },
  { href: '/perfil', label: 'Perfil', icone: '⚙️' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="w-full sticky top-0 z-50"
      style={{
        background: '#fff',
        borderBottom: '1px solid #bbf7d0',
        boxShadow: '0 2px 12px rgba(21,128,61,0.06)',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
      }}>
      <div className="max-w-4xl mx-auto px-6 flex items-center justify-between h-14">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black"
            style={{ background: '#16a34a', color: '#fff' }}>A</div>
          <span className="font-bold text-sm hidden sm:block" style={{ color: '#14532d' }}>
            AutoReminder
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {links.map((link) => {
            const ativo = pathname.startsWith(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={{
                  background: ativo ? '#dcfce7' : 'transparent',
                  color: ativo ? '#16a34a' : '#4a6355',
                }}>
                <span>{link.icone}</span>
                <span className="hidden sm:block">{link.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Logout */}
        <button
          onClick={() => {
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
          }}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
          style={{ background: '#fee2e2', color: '#dc2626' }}>
          <span>🚪</span>
          <span className="hidden sm:block">Sair</span>
        </button>

      </div>
    </nav>
  )
}