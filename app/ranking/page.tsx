import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { getInitials } from '@/lib/utils'
import type { RankingEntry, PrizeSummary } from '@/types'
import { BarChart2, Trophy } from 'lucide-react'

export const metadata: Metadata = { title: 'Ranking' }
export const revalidate = 30

const MEDAL_BG   = ['bg-yellow-400', 'bg-gray-300', 'bg-amber-600']
const MEDAL_RING = ['ring-yellow-300', 'ring-gray-200', 'ring-amber-400']

export default async function RankingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: rows }, { data: summary }] = await Promise.all([
    supabase.from('ranking').select('*').order('total_points', { ascending: false }),
    supabase.from('prize_summary').select('*').single(),
  ])

  const ps = summary as PrizeSummary | null

  const entries: RankingEntry[] = (rows ?? []).map((r: RankingEntry, i: number) => ({
    ...r,
    position: i + 1,
  }))

  const myEntry = entries.find((e) => e.user_id === user?.id)

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Ranking</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Atualizado automaticamente após cada resultado.
        </p>
      </div>

      {/* Premiação ao vivo */}
      {ps && ps.paid_count > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: '1º lugar', value: ps.prize_1st,  bg: 'bg-yellow-400', ring: 'ring-yellow-200' },
            { label: '2º lugar', value: ps.prize_2nd,  bg: 'bg-gray-300',   ring: 'ring-gray-100'   },
            { label: 'Participantes', value: null, count: ps.paid_count, bg: 'bg-blue-400', ring: 'ring-blue-100' },
          ].map((p, i) => (
            <div key={i} className={`card p-3 text-center ring-2 ${p.ring}`}>
              <div className={`w-7 h-7 rounded-full ${p.bg} flex items-center justify-center text-white text-xs font-extrabold mx-auto mb-2`}>
                {i + 1 <= 2 ? i + 1 : <Trophy size={12} />}
              </div>
              <p className="text-sm font-extrabold text-text-primary">
                {p.value !== null
                  ? p.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                  : `${p.count} pagos`}
              </p>
              <p className="text-xs text-text-muted">{p.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Minha posição (sticky highlight) */}
      {myEntry && (
        <div className="bg-[#1A1A1A] text-white rounded-2xl px-5 py-4 flex items-center gap-4">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold text-white flex-shrink-0
            ${myEntry.position <= 3 ? MEDAL_BG[myEntry.position - 1] : 'bg-gray-600'}`}>
            {myEntry.position}
          </div>
          <div className="w-9 h-9 rounded-full bg-brand-lime flex items-center justify-center text-sm font-bold text-[#1A1A1A] flex-shrink-0">
            {getInitials(myEntry.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">Você · {myEntry.name}</p>
            <p className="text-xs text-gray-400">
              {myEntry.exact_scores} placares exatos · {myEntry.correct_winners} vencedores
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-2xl font-extrabold text-brand-lime">{myEntry.total_points}</p>
            <p className="text-xs text-gray-400">pontos</p>
          </div>
        </div>
      )}

      {/* Tabela completa */}
      <div className="card overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[2rem_1fr_auto_auto] gap-3 px-4 py-3 text-xs text-text-muted font-semibold uppercase tracking-wider border-b border-surface-border">
          <span>#</span>
          <span>Participante</span>
          <span className="text-center hidden sm:block">Acertos</span>
          <span className="text-right">Pts</span>
        </div>

        {entries.length === 0 && (
          <div className="px-4 py-10 text-center text-text-muted">
            <BarChart2 size={36} className="mx-auto mb-3 opacity-30" />
            <p>Nenhum palpite registrado ainda.</p>
          </div>
        )}

        {entries.map((entry) => {
          const isMe  = entry.user_id === user?.id
          const isTop = entry.position <= 3

          return (
            <div
              key={entry.user_id}
              className={`grid grid-cols-[2rem_1fr_auto_auto] gap-3 items-center px-4 py-3.5 border-b border-surface-border last:border-0 transition-colors
                ${isMe ? 'bg-brand-lime/10' : 'hover:bg-surface-muted'}`}
            >
              {/* Position */}
              <div className="flex justify-center">
                {isTop ? (
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold text-white ring-2 ${MEDAL_BG[entry.position - 1]} ${MEDAL_RING[entry.position - 1]}`}>
                    {entry.position}
                  </div>
                ) : (
                  <span className="text-sm font-bold text-text-muted">{entry.position}º</span>
                )}
              </div>

              {/* Avatar + name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${isMe ? 'bg-brand-lime text-[#1A1A1A]' : 'bg-surface-muted text-text-secondary'}`}>
                  {getInitials(entry.name)}
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold truncate ${isMe ? 'text-[#5a6e00]' : 'text-text-primary'}`}>
                    {entry.name}
                    {isMe && <span className="ml-1 text-xs opacity-60">(você)</span>}
                  </p>
                  <p className="text-xs text-text-muted sm:hidden">
                    {entry.exact_scores} exatos
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:flex flex-col items-center text-xs text-text-muted">
                <span className="font-semibold text-text-primary">{entry.exact_scores}</span>
                <span>exatos</span>
              </div>

              {/* Points */}
              <div className="text-right">
                <span className={`text-lg font-extrabold ${isTop ? 'text-text-primary' : 'text-text-secondary'}`}>
                  {entry.total_points}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-center text-xs text-text-muted">
        Ranking atualiza automaticamente após cada resultado inserido pelo admin.
      </p>
    </div>
  )
}
