import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Settings } from '@/types'
import { CheckCircle2, Wallet } from 'lucide-react'
import PagamentoClient from './PagamentoClient'

export const metadata: Metadata = { title: 'Pagar entrada' }

export default async function PagamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from('profiles').select('paid, paid_at, name').eq('id', user!.id).single(),
    supabase.from('settings').select('*').single(),
  ])

  const s = settings as Settings | null
  const entryFee = Number(s?.entry_fee ?? 50)
  const adminFee = Number(s?.admin_fee ?? 5)
  const netToPool = entryFee - adminFee

  if (profile?.paid) {
    return (
      <div className="flex flex-col gap-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-extrabold">Pagar entrada</h1>
          <p className="text-text-secondary text-sm mt-0.5">Sua inscrição no bolão.</p>
        </div>

        <div className="card p-8 flex flex-col items-center text-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-600" />
          </div>
          <h2 className="text-lg font-extrabold text-text-primary">Inscrição confirmada</h2>
          <p className="text-text-secondary text-sm max-w-sm">
            Seu pagamento foi recebido e você já está concorrendo ao prêmio. Boa sorte nos palpites,{' '}
            {profile.name?.split(' ')[0] || 'campeão'}!
          </p>
          <a href="/ranking" className="btn-primary px-6 py-2.5 mt-2">Ver ranking</a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-extrabold">Pagar entrada</h1>
        <p className="text-text-secondary text-sm mt-0.5">
          Garanta sua vaga no bolão e concorra ao prêmio em dinheiro.
        </p>
      </div>

      {/* Resumo da taxa */}
      <div className="card p-5 flex items-center gap-4">
        <div className="w-11 h-11 rounded-2xl bg-brand-lime/20 flex items-center justify-center flex-shrink-0">
          <Wallet size={20} className="text-[#5a6e00]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary">Valor da inscrição</p>
          <p className="text-xs text-text-muted">
            {netToPool.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} vão direto para o prêmio
            {adminFee > 0 && (
              <> · {adminFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} de taxa de inscrição</>
            )}
          </p>
        </div>
        <p className="text-2xl font-extrabold text-text-primary flex-shrink-0">
          {entryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>

      <PagamentoClient entryFee={entryFee} />
    </div>
  )
}
