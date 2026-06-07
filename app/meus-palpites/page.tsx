import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import Image from 'next/image'
import { formatMatchDate, getFlagUrl } from '@/lib/utils'
import type { Prediction, Game } from '@/types'
import { CheckCircle2, XCircle, Clock, FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Meus Palpites' }
export const revalidate = 60

type PredWithGame = Prediction & { game: Game }

function ResultBadge({ pts, finished }: { pts: number | null; finished: boolean }) {
  if (!finished) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-text-muted bg-surface-muted px-2 py-1 rounded-full">
        <Clock size={11} />
        Aguardando
      </span>
    )
  }
  if (pts === null) return null
  if (pts > 0) {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-1 rounded-full font-semibold">
        <CheckCircle2 size={11} />
        +{pts} pts
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-semibold">
      <XCircle size={11} />
      0 pts
    </span>
  )
}

export default async function MeusPalpitesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: predictions } = await supabase
    .from('predictions')
    .select('*, game:games(*)')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const preds = (predictions ?? []) as PredWithGame[]

  const totalPts    = preds.reduce((acc, p) => acc + (p.points ?? 0), 0)
  const finished    = preds.filter((p) => p.game.is_finished)
  const exactScores = finished.filter((p) => p.points === 10).length
  const winners     = finished.filter((p) => (p.points ?? 0) >= 5 && p.points !== 10).length
  const misses      = finished.filter((p) => p.points === 0).length

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Meus palpites</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Histórico de todos os seus palpites e resultados.
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pontuação total', value: totalPts, accent: true },
          { label: 'Placares exatos', value: exactScores, accent: false },
          { label: 'Vencedor certo',  value: winners,    accent: false },
          { label: 'Erros',           value: misses,     accent: false },
        ].map((s) => (
          <div key={s.label} className="card p-4 text-center shadow-card">
            <p className={`text-2xl font-extrabold ${s.accent ? 'text-brand-lime-dark' : 'text-text-primary'}`}>
              {s.value}
            </p>
            <p className="text-xs text-text-muted mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Lista */}
      {preds.length === 0 ? (
        <div className="card p-10 text-center text-text-muted">
          <FileText size={40} className="mx-auto mb-3 text-text-muted opacity-40" />
          <p className="font-semibold">Nenhum palpite ainda.</p>
          <p className="text-sm mt-1">Vá para a aba Palpites e preencha os placares!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {preds.map((p, i) => {
            const g = p.game
            return (
              <div
                key={p.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < preds.length - 1 ? 'border-b border-surface-border' : ''}`}
              >
                {/* Flags */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Image src={getFlagUrl(g.home_flag)} alt={g.home_team} width={24} height={18} unoptimized className="rounded" />
                  <span className="text-xs text-text-muted">×</span>
                  <Image src={getFlagUrl(g.away_flag)} alt={g.away_team} width={24} height={18} unoptimized className="rounded" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">
                    {g.home_team} × {g.away_team}
                  </p>
                  <p className="text-xs text-text-muted">{formatMatchDate(g.match_date)}</p>
                </div>

                {/* Palpite */}
                <div className="text-center flex-shrink-0">
                  <p className="text-xs text-text-muted mb-0.5">Palpite</p>
                  <p className="text-sm font-bold">{p.home_score} × {p.away_score}</p>
                </div>

                {/* Resultado real */}
                {g.is_finished && (
                  <div className="text-center flex-shrink-0">
                    <p className="text-xs text-text-muted mb-0.5">Resultado</p>
                    <p className="text-sm font-bold">{g.home_score} × {g.away_score}</p>
                  </div>
                )}

                {/* Badge */}
                <div className="flex-shrink-0">
                  <ResultBadge pts={p.points} finished={g.is_finished} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
