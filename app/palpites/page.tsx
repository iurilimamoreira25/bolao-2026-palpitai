import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import GameCard from '@/components/games/GameCard'
import type { Game, Prediction } from '@/types'
import { STAGE_LABELS } from '@/types'
import { CalendarX, Wallet, ArrowRight } from 'lucide-react'

export const metadata: Metadata = { title: 'Palpites' }
export const revalidate = 60

export default async function PalpitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: games }, { data: predictions }, { data: profile }] = await Promise.all([
    supabase.from('games').select('*').order('match_date', { ascending: true }),
    supabase.from('predictions').select('*').eq('user_id', user!.id),
    supabase.from('profiles').select('paid').eq('id', user!.id).single(),
  ])

  const predMap = new Map<string, Prediction>()
  predictions?.forEach((p: Prediction) => predMap.set(p.game_id, p))

  // Agrupa por stage
  const grouped: Record<string, Game[]> = {}
  ;(games ?? []).forEach((g: Game) => {
    if (!grouped[g.stage]) grouped[g.stage] = []
    grouped[g.stage].push(g)
  })

  const stageOrder = ['group', 'round_of_16', 'quarter', 'semi', 'third', 'final']
  const totalGames     = games?.length ?? 0
  const filledPalpites = predictions?.length ?? 0

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Aviso de inscrição pendente */}
      {!profile?.paid && (
        <a
          href="/pagamento"
          className="card p-4 flex items-center gap-4 ring-1 ring-brand-lime/40 hover:ring-brand-lime transition-all group"
        >
          <div className="w-10 h-10 rounded-2xl bg-brand-lime/20 flex items-center justify-center flex-shrink-0">
            <Wallet size={18} className="text-[#5a6e00]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-primary">Falta pagar sua entrada</p>
            <p className="text-xs text-text-muted">Confirme sua inscrição via Pix para concorrer ao prêmio.</p>
          </div>
          <ArrowRight size={18} className="text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
        </a>
      )}

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

      {/* Jogos por fase */}
      {stageOrder.map((stage) => {
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
