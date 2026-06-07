import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Settings } from '@/types'
import { CheckCircle2, XCircle, Info, Target, TrendingUp, ThumbsUp, ThumbsDown } from 'lucide-react'

export const metadata: Metadata = { title: 'Regras' }

export default async function RegrasPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('settings').select('*').single()
  const s = settings as Settings | null

  const scoring = [
    {
      label: 'Placar exato',
      desc: 'Você acertou tanto o placar do time da casa quanto do visitante.',
      pts: s?.points_exact ?? 10,
      color: 'bg-brand-lime',
      textColor: 'text-[#5a6e00]',
      iconBg: 'bg-brand-lime/20',
      iconColor: 'text-[#5a6e00]',
      Icon: Target,
    },
    {
      label: 'Vencedor + diferença de gols',
      desc: 'Acertou quem ganhou e a diferença de gols, mas não o placar exato.',
      pts: s?.points_winner_diff ?? 7,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      Icon: TrendingUp,
    },
    {
      label: 'Apenas o vencedor / empate',
      desc: 'Acertou quem ganhou (ou que seria empate), mas errou a diferença de gols.',
      pts: s?.points_winner ?? 5,
      color: 'bg-green-100',
      textColor: 'text-green-700',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      Icon: ThumbsUp,
    },
    {
      label: 'Erro total',
      desc: 'Nenhum dos critérios acima foi atendido.',
      pts: 0,
      color: 'bg-surface-muted',
      textColor: 'text-text-muted',
      iconBg: 'bg-surface-muted',
      iconColor: 'text-text-muted',
      Icon: ThumbsDown,
    },
  ]

  return (
    <div className="flex flex-col gap-6 animate-fade-in max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold">Regras do Bolão</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Como funciona a pontuação e as regras gerais.
        </p>
      </div>

      {/* Pontuação */}
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-bold">Sistema de Pontuação</h2>
        {scoring.map((s, i) => (
          <div key={i} className="card p-4 flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center flex-shrink-0`}>
              <s.Icon size={20} className={s.iconColor} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-text-primary">{s.label}</p>
              <p className="text-text-secondary text-sm mt-0.5">{s.desc}</p>
            </div>
            <div className={`badge text-lg font-extrabold ${s.color} ${s.textColor} flex-shrink-0`}>
              {s.pts > 0 ? `+${s.pts}` : s.pts} pts
            </div>
          </div>
        ))}
      </section>

      {/* Regras gerais */}
      <section className="card p-5 flex flex-col gap-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Info size={18} />
          Regras Gerais
        </h2>
        {[
          'Os palpites devem ser feitos ANTES do início do jogo. Após o apito inicial, a edição é bloqueada automaticamente.',
          'Os resultados são inseridos pelo administrador do bolão após o fim de cada partida.',
          'A pontuação é calculada automaticamente após cada resultado ser inserido.',
          'O ranking é atualizado em tempo real conforme os resultados são lançados.',
          'Em caso de empate na pontuação final, o critério de desempate é o número de placares exatos acertados.',
          'O prêmio é pago ao vencedor ao final da Copa do Mundo 2026.',
          'Participação é gratuita. O prêmio é acordado entre os participantes.',
        ].map((rule, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-text-secondary">
            <CheckCircle2 size={15} className="text-brand-lime-dark flex-shrink-0 mt-0.5" />
            <span>{rule}</span>
          </div>
        ))}
      </section>

      {/* Desempate */}
      <section className="card p-5 border-l-4 border-brand-lime">
        <h2 className="text-base font-bold mb-2">Critério de desempate</h2>
        <div className="flex flex-col gap-1.5 text-sm text-text-secondary">
          {[
            'Maior número de placares exatos',
            'Maior número de vencedores/empates acertados',
            'Definido por sorteio entre os empatados',
          ].map((c, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="bg-brand-lime text-[#1A1A1A] text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              {c}
            </div>
          ))}
        </div>
      </section>

      {/* Dúvidas */}
      <div className="bg-surface-muted rounded-2xl p-4 text-sm text-text-secondary flex items-start gap-3">
        <XCircle size={16} className="text-text-muted flex-shrink-0 mt-0.5" />
        <p>
          Dúvidas? Fale com o administrador do bolão. As regras podem ser ajustadas pelo admin antes do início da Copa.
        </p>
      </div>
    </div>
  )
}
