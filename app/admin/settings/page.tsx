import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { updateSettings } from '../actions'
import type { Settings } from '@/types'

export const metadata: Metadata = { title: 'Admin · Configurações' }

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const { data: settings } = await supabase.from('settings').select('*').single()
  const s = settings as Settings | null

  const pct1    = s?.prize_pct_1    ?? 60
  const pct2    = s?.prize_pct_2    ?? 30
  const pctH    = s?.prize_pct_house ?? 10
  const somaOk  = pct1 + pct2 + pctH === 100

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-extrabold">Configurações do Bolão</h1>
        <p className="text-text-secondary text-sm mt-1">
          Ajuste as regras de entrada, pontuação e distribuição do prêmio.
        </p>
      </div>

      <div className="card p-6">
        <form action={updateSettings} className="flex flex-col gap-6">

          {/* Geral */}
          <section className="border-b border-surface-border pb-6">
            <h2 className="font-bold mb-4">Informações gerais</h2>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="label">Nome do bolão</label>
                <input name="site_name" defaultValue={s?.site_name ?? 'Palpitaí'} required className="input" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="label">Prêmio (texto livre — preenchido automaticamente pelo sistema)</label>
                <input name="prize" defaultValue={s?.prize ?? 'R$ 500,00'} required className="input" />
                <p className="text-xs text-text-muted">Este campo aparece na landing page enquanto o sistema calcula o valor real.</p>
              </div>
            </div>
          </section>

          {/* Inscrição */}
          <section className="border-b border-surface-border pb-6">
            <h2 className="font-bold mb-1">Taxa de participação</h2>
            <p className="text-xs text-text-muted mb-4">O valor líquido (entrada − taxa) entra no pool de prêmios.</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="label">Valor de entrada (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">R$</span>
                  <input name="entry_fee" type="number" min={0} step="0.01"
                    defaultValue={s?.entry_fee ?? 50}
                    required className="input pl-9 font-bold" />
                </div>
                <p className="text-xs text-text-muted">Quanto cada participante paga para entrar.</p>
              </div>
              <div className="flex flex-col gap-1">
                <label className="label">Taxa de inscrição (R$)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm font-medium">R$</span>
                  <input name="admin_fee" type="number" min={0} step="0.01"
                    defaultValue={s?.admin_fee ?? 5}
                    required className="input pl-9 font-bold" />
                </div>
                <p className="text-xs text-text-muted">Fica com a casa. Deduzida do valor de entrada.</p>
              </div>
            </div>
          </section>

          {/* Distribuição */}
          <section className="border-b border-surface-border pb-6">
            <h2 className="font-bold mb-1">Distribuição do prêmio (%)</h2>
            <p className="text-xs text-text-muted mb-4">A soma deve ser exatamente 100%.</p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: 'prize_pct_1',    label: '1º lugar',  default: pct1, color: 'bg-yellow-400' },
                { name: 'prize_pct_2',    label: '2º lugar',  default: pct2, color: 'bg-gray-300'   },
                { name: 'prize_pct_house',label: 'Casa',      default: pctH, color: 'bg-purple-400' },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="label flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${f.color}`} />
                    {f.label}
                  </label>
                  <div className="relative">
                    <input name={f.name} type="number" min={0} max={100}
                      defaultValue={f.default}
                      required className="input pr-7 text-center font-bold text-lg" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">%</span>
                  </div>
                </div>
              ))}
            </div>
            {!somaOk && (
              <p className="text-xs text-red-500 mt-2 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                Atenção: a soma atual é {pct1 + pct2 + pctH}%. Ajuste para totalizar 100%.
              </p>
            )}
            {somaOk && (
              <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                <span>✓</span> Soma = 100% — distribuição válida.
              </p>
            )}
          </section>

          {/* Pontuação */}
          <section>
            <h2 className="font-bold mb-4">Sistema de pontuação</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { name: 'points_exact',       label: 'Placar exato',        default: s?.points_exact ?? 10       },
                { name: 'points_winner_diff',  label: 'Vencedor + diferença', default: s?.points_winner_diff ?? 7 },
                { name: 'points_winner',       label: 'Apenas o vencedor',   default: s?.points_winner ?? 5       },
              ].map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                  <label className="label">{f.label}</label>
                  <div className="relative">
                    <input name={f.name} type="number" min={0} max={100}
                      defaultValue={f.default}
                      required className="input pr-10 text-center font-bold" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">pts</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <button type="submit" className="btn-primary px-6 py-2.5 w-full sm:w-auto">
            Salvar configurações
          </button>
        </form>
      </div>
    </div>
  )
}
