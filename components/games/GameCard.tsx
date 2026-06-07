'use client'
import Image from 'next/image'
import { useState, useTransition } from 'react'
import { formatMatchDate, isGameLocked, getFlagUrl } from '@/lib/utils'
import { savePrediction } from '@/app/palpites/actions'
import type { Game, Prediction } from '@/types'
import Badge from '@/components/ui/Badge'
import { Lock, Clock, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  game: Game
  prediction?: Prediction
}

export default function GameCard({ game, prediction }: Props) {
  const locked = isGameLocked(game)

  const [home, setHome] = useState(prediction?.home_score?.toString() ?? '')
  const [away, setAway] = useState(prediction?.away_score?.toString() ?? '')
  const [saved,  setSaved]  = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    if (home === '' || away === '') return
    startTransition(async () => {
      await savePrediction({ gameId: game.id, homeScore: Number(home), awayScore: Number(away) })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    })
  }

  const hasResult = game.is_finished && game.home_score !== null
  const pts       = prediction?.points

  return (
    <div className="card p-4 flex flex-col gap-3 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{formatMatchDate(game.match_date)}</span>
        </div>
        <div className="flex items-center gap-2">
          {game.group_name && <Badge color="gray">{game.group_name}</Badge>}
          {locked && !hasResult && (
            <Badge color="yellow">
              <Lock size={10} />
              Bloqueado
            </Badge>
          )}
          {hasResult && (
            <Badge color={pts && pts > 0 ? 'green' : 'red'}>
              {pts && pts > 0 ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
              {pts ?? 0} pts
            </Badge>
          )}
        </div>
      </div>

      {/* Teams + scores */}
      <div className="flex items-center gap-3">
        {/* Home */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <Image
            src={getFlagUrl(game.home_flag)}
            alt={game.home_team}
            width={40}
            height={30}
            className="rounded shadow-sm"
            unoptimized
          />
          <span className="text-sm font-semibold text-center leading-tight">{game.home_team}</span>
        </div>

        {/* Score inputs / result */}
        <div className="flex items-center gap-2">
          {hasResult ? (
            <div className="flex items-center gap-2">
              <div className="text-2xl font-extrabold w-10 text-center bg-surface-muted rounded-xl py-1">
                {game.home_score}
              </div>
              <span className="text-text-muted font-bold">×</span>
              <div className="text-2xl font-extrabold w-10 text-center bg-surface-muted rounded-xl py-1">
                {game.away_score}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={99}
                value={home}
                onChange={(e) => { setSaved(false); setHome(e.target.value) }}
                disabled={locked}
                className="w-12 h-11 text-center text-xl font-bold border-2 rounded-xl focus:border-brand-lime focus:outline-none disabled:bg-surface-muted disabled:text-text-muted transition-colors"
                placeholder="–"
              />
              <span className="text-text-muted font-bold text-xl">×</span>
              <input
                type="number"
                min={0}
                max={99}
                value={away}
                onChange={(e) => { setSaved(false); setAway(e.target.value) }}
                disabled={locked}
                className="w-12 h-11 text-center text-xl font-bold border-2 rounded-xl focus:border-brand-lime focus:outline-none disabled:bg-surface-muted disabled:text-text-muted transition-colors"
                placeholder="–"
              />
            </div>
          )}
        </div>

        {/* Away */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <Image
            src={getFlagUrl(game.away_flag)}
            alt={game.away_team}
            width={40}
            height={30}
            className="rounded shadow-sm"
            unoptimized
          />
          <span className="text-sm font-semibold text-center leading-tight">{game.away_team}</span>
        </div>
      </div>

      {/* Seu palpite resumido (quando bloqueado ou finalizado) */}
      {(locked || hasResult) && prediction && (
        <div className="bg-surface-muted rounded-xl px-4 py-2 flex items-center justify-center gap-2 text-sm text-text-secondary">
          <span>Seu palpite:</span>
          <span className="font-bold text-text-primary">
            {prediction.home_score} × {prediction.away_score}
          </span>
        </div>
      )}

      {/* Save button */}
      {!locked && !hasResult && (
        <button
          onClick={handleSave}
          disabled={isPending || home === '' || away === ''}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all active:scale-95 disabled:opacity-50
            ${saved
              ? 'bg-green-100 text-green-700'
              : 'bg-brand-lime text-[#1A1A1A] hover:bg-brand-lime-dark'
            }`}
        >
          {isPending ? 'Salvando…' : saved ? '✓ Palpite salvo!' : 'Salvar palpite'}
        </button>
      )}
    </div>
  )
}
