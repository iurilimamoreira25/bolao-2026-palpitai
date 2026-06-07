'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Logo from './Logo'
import type { Profile } from '@/types'
import { getInitials } from '@/lib/utils'
import { Trophy, ListChecks, BarChart2, BookOpen, Menu, X, LogOut, ShieldCheck, Wallet } from 'lucide-react'

const navItems = [
  { href: '/palpites',      label: 'Palpites',      icon: ListChecks },
  { href: '/ranking',       label: 'Ranking',        icon: BarChart2 },
  { href: '/meus-palpites', label: 'Meus Palpites',  icon: Trophy },
  { href: '/regras',        label: 'Regras',          icon: BookOpen },
]

export default function Navbar({ profile }: { profile: Profile }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const supabase  = createClient()
  const [open, setOpen] = useState(false)

  const items = profile.paid
    ? navItems
    : [...navItems, { href: '/pagamento', label: 'Pagar entrada', icon: Wallet }]

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-border">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Logo href="/palpites" height={28} />

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {items.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-brand-lime text-[#1A1A1A]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              )}
            >
              <Icon size={15} />
              {label}
            </a>
          ))}
          {profile.is_admin && (
            <a
              href="/admin"
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-colors',
                pathname.startsWith('/admin')
                  ? 'bg-brand-lime text-[#1A1A1A]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              )}
            >
              <ShieldCheck size={15} />
              Admin
            </a>
          )}
        </nav>

        {/* Avatar + hamburger */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
              <div className="w-7 h-7 rounded-full bg-brand-lime flex items-center justify-center text-xs font-bold text-[#1A1A1A]">
                {getInitials(profile.name || profile.email)}
              </div>
              {profile.name || profile.email.split('@')[0]}
            </div>
            <button
              onClick={handleSignOut}
              className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
          <button
            className="md:hidden p-1.5 rounded-lg text-text-secondary hover:bg-surface-muted"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-surface-border bg-white px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {items.map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                pathname.startsWith(href)
                  ? 'bg-brand-lime text-[#1A1A1A]'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              )}
            >
              <Icon size={16} />
              {label}
            </a>
          ))}
          {profile.is_admin && (
            <a
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-surface-muted"
            >
              <ShieldCheck size={16} />
              Admin
            </a>
          )}
          <div className="border-t border-surface-border mt-2 pt-3 flex items-center justify-between px-1">
            <span className="text-sm text-text-secondary">
              {profile.name || profile.email.split('@')[0]}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm text-red-500 font-medium"
            >
              <LogOut size={15} />
              Sair
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
