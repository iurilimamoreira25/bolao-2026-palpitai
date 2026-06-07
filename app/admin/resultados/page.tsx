import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { formatMatchDate } from '@/lib/utils'
import { setResult } from '../actions'
import type { Game } from '@/types'
import { CheckCircle2, Clock } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin · Resultados' }

export default async function AdminResultadosPage() {
  const supabase = await createClient()
  const { data: games } = await supabase
    .from('games')
    .select('*')
    .order('match_date', { ascending: true })

  const pending  = (games ?? []).filter((g: Game) => !g.is_finished && new Date(g.match_date) <= new Date())
  const finished = (games ?? []).filter((g: Game) => g.is_finished)
  const upcoming = (games ?? []).filter((g: Game) => !g.is_finished && new Date(g.match_date) > new Date())

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-extrabold">Inserir Resultados</h1>
        <p className="text-text-secondary text-sm mt-1">
          Jogos que já começaram e aguardam resultado.
          Após salvar, a pontuação de todos os participantes é recalculada automaticamente.
        </p>
      </div>

      {/* Aguardando resultado */}
      {pending.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            Aguardando resultado ({pending.length})
          </h2>
          <div className="flex flex-col gap-3">
            {(pending as Game[]).map((g) => (
              <div key={g.id} className="card p-4 border-l-4 border-yellow-400">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div>
                    <p className="font-bold">{g.home_team} × {g.away_team}</p>
                    <p className="text-xs text-text-muted">{formatMatchDate(g.match_date)}</p>
                  </div>
                  <Clock size={16} className="text-yellow-500" />
                </div>
                <form action={setResult} className="flex flex-wrap items-end gap-3">
                  <input type="hidden" name="game_id" value={g.id} />
                  <input type="hidden" name="is_finished" value="true" />
                  <div className="flex flex-col gap-1">
                    <label className="label text-xs">{g.home_team}</label>
                    <input
                      name="home_score"
                      type="number" min={0} max={99}
                      defaultValue={g.home_score ?? 0}
                      required
                      className="input w-20 text-center font-bold text-lg"
                    />
                  </div>
                  <span className="text-lg font-bold text-text-muted pb-2.5">×</span>
                  <div className="flex flex-col gap-1">
                    <label className="label text-xs">{g.away_team}</label>
                    <input
                      name="away_score"
                      type="number" min={0} max={99}
                      defaultValue={g.away_score ?? 0}
                      required
                      className="input w-20 text-center font-bold text-lg"
                    />
                  </div>
                  <button type="submit" className="btn-primary px-5 py-2.5">
                    Salvar resultado
                  </button>
                </form>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Próximos jogos */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            Próximos jogos ({upcoming.length})
          </h2>
          <div className="card overflow-hidden">
            {(upcoming as Game[]).map((g, i) => (
              <div key={g.id} className={`flex items-center justify-between px-4 py-3 ${i < upcoming.length - 1 ? 'border-b border-surface-border' : ''}`}>
                <div>
                  <p className="text-sm font-semibold">{g.home_team} × {g.away_team}</p>
                  <p className="text-xs text-text-muted">{formatMatchDate(g.match_date)}</p>
                </div>
                <span className="text-xs text-text-muted bg-surface-muted px-2 py-1 rounded-full">Aguardando início</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Jogos finalizados */}
      {finished.length > 0 && (
        <section>
          <h2 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-3">
            Finalizados ({finished.length})
          </h2>
          <div className="card overflow-hidden">
            {(finished as Game[]).map((g, i) => (
              <div key={g.id} className={`flex items-center justify-between px-4 py-3 ${i < finished.length - 1 ? 'border-b border-surface-border' : ''}`}>
                <div>
                  <p className="text-sm font-semibold">{g.home_team} × {g.away_team}</p>
                  <p className="text-xs text-text-muted">{formatMatchDate(g.match_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">{g.home_score} × {g.away_score}</span>
                  <CheckCircle2 size={16} className="text-green-500" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {pending.length === 0 && (
        <div className="card p-10 text-center text-text-muted">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-green-400 opacity-60" />
          <p className="font-semibold">Nenhum jogo aguardando resultado.</p>
        </div>
      )}
    </div>
  )
}
