import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import GameCard from '@/components/games/GameCard'
import GroupStageBrowser from '@/components/games/GroupStageBrowser'
import InviteCard from '@/components/ui/InviteCard'
import type { Game, Prediction } from '@/types'
import { STAGE_LABELS } from '@/types'
import { CalendarX } from 'lucide-react'

export const metadata: Metadata = { title: 'Palpites' }
export const revalidate = 60

export default async function PalpitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: games }, { data: predictions }] = await Promise.all([
    supabase.from('games').select('*').order('match_date', { ascending: true }),
    supabase.from('predictions').select('*').eq('user_id', user!.id),
  ])

  const predMap = new Map<string, Prediction>()
  predictions?.forEach((p: Prediction) => predMap.set(p.game_id, p))

  // Agrupa por stage
  const grouped: Record<string, Game[]> = {}
  ;(games ?? []).forEach((g: Game) => {
    if (!grouped[g.stage]) grouped[g.stage] = []
    grouped[g.stage].push(g)
  })

  const stageOrder    = ['group', 'round_of_16', 'quarter', 'semi', 'third', 'final']
  const knockoutOrder = stageOrder.filter((s) => s !== 'group')
  const groupStageGames = (games ?? []).filter((g: Game) => g.stage === 'group')
  const totalGames     = games?.length ?? 0
  const filledPalpites = predictions?.length ?? 0

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Convide a galera */}
      <InviteCard />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Seus palpites</h1>
          <p className="text-text-secondary text-sm mt-0.5">
            Preencha o placar de cada jogo antes de começar.
          </p>
        </div>
        <div className="bg-white border border-surface-border rounded-2xl px-4 py-2.5 text-center shadow-card">
          <p className="text-xs text-text-muted mb-0.5">Palpites preenchidos</p>
          <p className="text-xl font-extrabold">
            <span className="text-brand-lime-dark">{filledPalpites}</span>
            <span className="text-text-muted font-medium text-base"> / {totalGames}</span>
          </p>
        </div>
      </div>

      {/* Fase de grupos — navegação por grupo (A-L), 6 jogos por vez */}
      {groupStageGames.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-1">
            {STAGE_LABELS.group}
          </h2>
          <GroupStageBrowser games={groupStageGames} predictions={predictions ?? []} />
        </section>
      )}

      {/* Mata-mata */}
      {knockoutOrder.map((stage) => {
        const stageGames = grouped[stage]
        if (!stageGames?.length) return null
        return (
          <section key={stage} className="flex flex-col gap-3">
            <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider px-1">
              {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] ?? stage}
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {stageGames.map((game: Game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  prediction={predMap.get(game.id)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {totalGames === 0 && (
        <div className="card p-10 text-center text-text-muted">
          <CalendarX size={40} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="font-semibold">Nenhum jogo cadastrado ainda.</p>
          <p className="text-sm mt-1">O admin vai adicionar os jogos em breve!</p>
        </div>
      )}
    </div>
  )
}
