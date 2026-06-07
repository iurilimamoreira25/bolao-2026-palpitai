import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { formatMatchDate } from '@/lib/utils'
import { createGame, deleteGame } from './actions'
import type { Game } from '@/types'
import { STAGE_LABELS } from '@/types'
import { Trash2, Plus } from 'lucide-react'

export const metadata: Metadata = { title: 'Admin · Jogos' }

const STAGES = ['group', 'round_of_16', 'quarter', 'semi', 'third', 'final'] as const

export default async function AdminJogosPage() {
  const supabase = await createClient()
  const { data: games } = await supabase.from('games').select('*').order('match_date')

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-extrabold">Gerenciar Jogos</h1>

      {/* Formulário de novo jogo */}
      <div className="card p-5">
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Plus size={18} />
          Adicionar jogo
        </h2>
        <form action={createGame} className="grid sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="label">Time da Casa</label>
            <input name="home_team" required placeholder="Ex: Brasil" className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Time Visitante</label>
            <input name="away_team" required placeholder="Ex: Argentina" className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Código bandeira (casa) <span className="text-text-muted">(ISO 3166-1 alpha-2)</span></label>
            <input name="home_flag" required placeholder="br" className="input" maxLength={3} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Código bandeira (visit.)</label>
            <input name="away_flag" required placeholder="ar" className="input" maxLength={3} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Data e hora (local do servidor UTC)</label>
            <input name="match_date" type="datetime-local" required className="input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label">Grupo (opcional)</label>
            <input name="group_name" placeholder="Ex: Grupo G" className="input" />
          </div>
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label">Fase</label>
            <select name="stage" className="input" defaultValue="group">
              {STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_LABELS[s]}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary px-6 py-2.5 w-full sm:w-auto">
              Adicionar jogo
            </button>
          </div>
        </form>
      </div>

      {/* Lista de jogos */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-surface-border">
          <h2 className="font-bold">{games?.length ?? 0} jogos cadastrados</h2>
        </div>
        {(games ?? []).length === 0 ? (
          <div className="p-10 text-center text-text-muted">Nenhum jogo ainda.</div>
        ) : (
          <div>
            {(games as Game[]).map((g) => (
              <div key={g.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-surface-border last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{g.home_team} × {g.away_team}</p>
                  <p className="text-xs text-text-muted">{formatMatchDate(g.match_date)} · {STAGE_LABELS[g.stage as keyof typeof STAGE_LABELS]}</p>
                </div>
                {g.is_finished && (
                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    {g.home_score} × {g.away_score}
                  </span>
                )}
                <form action={async () => { 'use server'; await deleteGame(g.id) }}>
                  <button type="submit" className="p-1.5 rounded-lg text-text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
