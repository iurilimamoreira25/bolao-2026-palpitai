import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ShieldCheck, LayoutList, Trophy, Settings, Home, Users } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) redirect('/palpites')

  return (
    <div className="min-h-screen bg-surface-muted">
      {/* Admin bar */}
      <header className="bg-[#1A1A1A] text-white sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck size={18} className="text-brand-lime" />
            <span className="font-bold text-sm">Painel Admin</span>
            <span className="hidden sm:block">
              <Image src="/logo.svg" alt="Palpitaí" width={70} height={23} className="opacity-60" />
            </span>
          </div>
          <nav className="flex items-center gap-1">
            {[
              { href: '/admin',                label: 'Jogos',         icon: LayoutList },
              { href: '/admin/resultados',   label: 'Resultados',    icon: Trophy      },
              { href: '/admin/participantes',label: 'Participantes',  icon: Users       },
              { href: '/admin/settings',     label: 'Config',         icon: Settings    },
              { href: '/palpites',           label: 'Ver site',       icon: Home        },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Icon size={13} />
                <span className="hidden sm:block">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
