'use client'
import { useMemo, useState } from 'react'
import GameCard from './GameCard'
import type { Game, Prediction } from '@/types'

interface Props {
  games: Game[]
  predictions: Prediction[]
}

export default function GroupStageBrowser({ games, predictions }: Props) {
  const predMap = useMemo(() => {
    const map = new Map<string, Prediction>()
    predictions.forEach((p) => map.set(p.game_id, p))
    return map
  }, [predictions])

  const groups = useMemo(() => {
    const map = new Map<string, Game[]>()
    games.forEach((g) => {
      const key = g.group_name ?? 'Outros'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(g)
    })
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [games])

  // Padrão: grupo do próximo jogo que ainda não começou (o que a pessoa quer ver agora)
  const defaultGroup = useMemo(() => {
    const now = Date.now()
    const next = games.find((g) => new Date(g.match_date).getTime() > now)
    return next?.group_name ?? groups[0]?.[0] ?? null
  }, [games, groups])

  const [selected, setSelected] = useState(defaultGroup)
  const active      = groups.find(([name]) => name === selected) ?? groups[0]
  const activeGames = active?.[1] ?? []

  if (groups.length === 0) return null

  return (
    <div className="flex flex-col gap-3">
      {/* Seletor de grupo — rola horizontal no mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {groups.map(([name, groupGames]) => {
          const filled     = groupGames.filter((g) => predMap.has(g.id)).length
          const isComplete = filled === groupGames.length
          const isActive   = name === active?.[0]
          return (
            <button
              key={name}
              onClick={() => setSelected(name)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors
                ${isActive
                  ? 'bg-brand-lime text-[#1A1A1A]'
                  : 'bg-surface-muted text-text-secondary hover:text-text-primary'
                }`}
            >
              {name}
              <span className={`text-xs font-medium ${isActive ? 'text-[#1A1A1A]/60' : 'text-text-muted'}`}>
                {isComplete ? '✓' : `${filled}/${groupGames.length}`}
              </span>
            </button>
          )
        })}
      </div>

      {/* Jogos do grupo selecionado */}
      <div className="grid sm:grid-cols-2 gap-3">
        {activeGames.map((game) => (
          <GameCard key={game.id} game={game} prediction={predMap.get(game.id)} />
        ))}
      </div>
    </div>
  )
}
