import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { togglePaid } from '../actions'
import type { Profile, PrizeSummary } from '@/types'
import { getInitials } from '@/lib/utils'
import { CheckCircle2, XCircle, Users, DollarSign, Trophy, Home } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const metadata: Metadata = { title: 'Admin · Participantes' }

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function AdminParticipantesPage() {
  const supabase = await createClient()

  const [{ data: profiles }, { data: summary }] = await Promise.all([
    supabase.from('profiles').select('*').order('created_at', { ascending: false }),
    supabase.from('prize_summary').select('*').single(),
  ])

  const ps = summary as PrizeSummary | null
  const users = (profiles ?? []) as Profile[]

  const stats = [
    {
      label: 'Participantes pagos',
      value: ps ? `${ps.paid_count} / ${users.length}` : '—',
      sub: 'confirmados',
      icon: Users,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total arrecadado',
      value: ps ? formatBRL(ps.total_collected) : '—',
      sub: `${formatBRL(ps?.entry_fee ?? 50)} por pessoa`,
      icon: DollarSign,
      color: 'text-green-600 bg-green-50',
    },
    {
      label: 'Taxa da casa',
      value: ps ? formatBRL(ps.total_admin_fees) : '—',
      sub: `${formatBRL(ps?.admin_fee ?? 5)} por inscrito`,
      icon: Home,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      label: 'Premiação líquida',
      value: ps ? formatBRL(ps.net_prize_pool) : '—',
      sub: 'distribuído entre top 2',
      icon: Trophy,
      color: 'text-yellow-600 bg-yellow-50',
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Participantes &amp; Premiação</h1>
        <p className="text-text-secondary text-sm mt-1">
          Confirme os pagamentos e acompanhe o prêmio em tempo real.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-4">
            <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-3`}>
              <s.icon size={18} />
            </div>
            <p className="text-xl font-extrabold">{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
            <p className="text-xs text-text-muted opacity-70">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Distribuição do prêmio */}
      {ps && ps.paid_count > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-surface-border bg-[#1A1A1A]">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Trophy size={16} className="text-brand-lime" />
              Distribuição do prêmio
            </h2>
          </div>
          {[
            { pos: '1º lugar', pct: ps.prize_pct_1,     valor: ps.prize_1st,    bg: 'bg-yellow-400', label: 'Ouro' },
            { pos: '2º lugar', pct: ps.prize_pct_2,     valor: ps.prize_2nd,    bg: 'bg-gray-300',   label: 'Prata' },
            { pos: 'A casa',   pct: ps.prize_pct_house, valor: ps.prize_house + ps.total_admin_fees, bg: 'bg-purple-400', label: 'Casa' },
          ].map((r, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-surface-border last:border-0">
              <div className={`w-8 h-8 rounded-full ${r.bg} flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0`}>
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-semibold">{r.pos}</p>
                <div className="mt-1.5 h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${r.bg} opacity-80`}
                    style={{ width: `${r.pct}%` }}
                  />
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-extrabold">{formatBRL(r.valor)}</p>
                <p className="text-xs text-text-muted">{r.pct}% do pool{i === 2 ? ' + taxa' : ''}</p>
              </div>
            </div>
          ))}
          <div className="px-5 py-3 bg-surface-muted flex justify-between items-center text-sm">
            <span className="text-text-muted">Pool líquido (sem taxas)</span>
            <span className="font-bold">{formatBRL(ps.net_prize_pool)}</span>
          </div>
        </div>
      )}

      {/* Lista de participantes */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-bold">{users.length} participante{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}</h2>
          <span className="text-xs text-text-muted bg-surface-muted px-2 py-1 rounded-full">
            {users.filter((u) => u.paid).length} pago{users.filter((u) => u.paid).length !== 1 ? 's' : ''}
          </span>
        </div>

        {users.length === 0 ? (
          <div className="p-10 text-center text-text-muted">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum participante ainda.</p>
          </div>
        ) : (
          users.map((u, i) => (
            <div key={u.id} className={`flex items-center gap-3 px-5 py-3.5 ${i < users.length - 1 ? 'border-b border-surface-border' : ''}`}>
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                ${u.paid ? 'bg-brand-lime text-[#1A1A1A]' : 'bg-surface-muted text-text-muted'}`}>
                {getInitials(u.name || u.email)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{u.name || u.email}</p>
                <p className="text-xs text-text-muted truncate">{u.email}</p>
                {u.paid && u.paid_at && (
                  <p className="text-xs text-green-600 mt-0.5">
                    Pago em {format(parseISO(u.paid_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </p>
                )}
              </div>

              {/* Admin badge */}
              {u.is_admin && (
                <span className="text-xs bg-[#1A1A1A] text-brand-lime px-2 py-0.5 rounded-full font-semibold hidden sm:block">
                  Admin
                </span>
              )}

              {/* Status + toggle */}
              <form action={async () => {
                'use server'
                await togglePaid(u.id, !u.paid)
              }}>
                <button
                  type="submit"
                  className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl transition-colors
                    ${u.paid
                      ? 'bg-green-100 text-green-700 hover:bg-red-50 hover:text-red-600'
                      : 'bg-surface-muted text-text-muted hover:bg-brand-lime/20 hover:text-[#5a6e00]'
                    }`}
                >
                  {u.paid
                    ? <><CheckCircle2 size={13} /> Pago</>
                    : <><XCircle size={13} /> Pendente</>
                  }
                </button>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
