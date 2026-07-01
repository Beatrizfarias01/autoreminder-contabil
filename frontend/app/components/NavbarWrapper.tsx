'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

const rotasSemNavbar = ['/login', '/cadastro', '/recuperar-senha']

export default function NavbarWrapper() {
  const pathname = usePathname()

  const esconder = rotasSemNavbar.some((rota) => pathname.startsWith(rota))

  if (esconder) return null

  return <Navbar />
}