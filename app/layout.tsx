import type { Metadata } from 'next'
import './globals.css'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? 'Palpitaí'

export const metadata: Metadata = {
  title: { default: siteName, template: `%s | ${siteName}` },
  description: 'Dê seus palpites, acompanhe o ranking e dispute o prêmio com seus amigos na Copa do Mundo 2026!',
  metadataBase: new URL('https://palpitai.vercel.app'),
  openGraph: {
    title: siteName,
    description: 'Bolão da Copa do Mundo 2026 entre amigos — Palpitaí',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
