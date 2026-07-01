import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AutoReminder Contábil',
  description: 'Sistema inteligente de lembretes fiscais',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {children}
    </div>
  )
}