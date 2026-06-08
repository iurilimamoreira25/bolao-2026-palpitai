import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import type { Settings, PrizeSummary } from '@/types'
import {
  Trophy, Zap, Users, Star, ArrowRight, CheckCircle2,
  UserPlus, Target, BarChart2, Medal, Megaphone,
} from 'lucide-react'

const EXAMPLE_COUNTS = [50, 100, 300, 500]

const formatBRL = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

const steps = [
  {
    icon: UserPlus,
    color: 'bg-blue-50 text-blue-600',
    title: 'Cadastre-se grátis',
    desc: 'Crie sua conta em segundos com email ou Google.',
  },
  {
    icon: Target,
    color: 'bg-brand-lime/20 text-[#5a6e00]',
    title: 'Dê seus palpites',
    desc: 'Escolha o placar de cada jogo antes da bola rolar.',
  },
  {
    icon: Medal,
    color: 'bg-yellow-50 text-yellow-600',
    title: 'Suba no ranking',
    desc: 'Acumule pontos e dispute o prêmio com seus amigos.',
  },
]

const scoring = [
  { label: 'Placar exato',                 pts: '10 pts', bg: 'bg-brand-lime',    text: 'text-[#5a6e00]' },
  { label: 'Vencedor + diferença de gols', pts: '7 pts',  bg: 'bg-blue-100',      text: 'text-blue-700'  },
  { label: 'Apenas o vencedor/empate',     pts: '5 pts',  bg: 'bg-green-100',     text: 'text-green-700' },
  { label: 'Errou tudo',                   pts: '0 pts',  bg: 'bg-surface-muted', text: 'text-text-muted'},
]

export default async function LandingPage() {
  const supabase = await createClient()
  const [{ data: settings }, { data: summary }] = await Promise.all([
    supabase.from('settings').select('*').single(),
    supabase.rpc('get_prize_summary').single(),
  ])

  const s  = settings as Settings | null
  const ps = summary as PrizeSummary | null

  const entryFee = s?.entry_fee  ?? 50
  const adminFee = s?.admin_fee  ?? 0
  const pct1     = s?.prize_pct_1 ?? 60
  const pct2     = s?.prize_pct_2 ?? 30
  const netPerPerson = entryFee - adminFee

  const examples = EXAMPLE_COUNTS.map((count) => {
    const pool = count * netPerPerson
    return {
      count,
      prize1: Math.round(pool * (pct1 / 100) * 100) / 100,
      prize2: Math.round(pool * (pct2 / 100) * 100) / 100,
    }
  })

  const hasLivePrize = !!ps && ps.paid_count > 0

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navbar mínima ── */}
      <header className="border-b border-surface-border sticky top-0 bg-white z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Image src="/logo.svg" alt="Palpitaí" width={130} height={42} priority />
          <div className="flex items-center gap-2">
            <Link href="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5">
              Entrar
            </Link>
            <Link href="/cadastro" className="btn-primary text-sm">
              Participar agora
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-white">
        {/* Fundo decorativo */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-brand-lime/8 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-blue-50 blur-3xl" />
          {/* Grid sutil */}
          <div className="absolute inset-0 opacity-[0.025]" style={{
            backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Texto */}
            <div>
              <div className="mb-6">
                <Image src="/logo.svg" alt="Palpitaí" width={200} height={65} priority />
              </div>
              <span className="inline-flex items-center gap-1.5 bg-brand-lime/20 text-[#5a6e00] text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                <Star size={11} fill="currentColor" />
                Copa do Mundo 2026 · EUA, Canadá &amp; México
              </span>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-4 leading-tight">
                O bolão da turma<br />
                <span className="text-brand-lime-dark">mais animado</span> da copa
              </h1>
              <p className="text-base text-text-secondary mb-8 leading-relaxed">
                Dê palpites nos jogos, suba no ranking e dispute um{' '}
                <strong className="text-text-primary">prêmio que cresce com o bolão</strong> junto dos seus amigos.
                Cadastro gratuito — só paga quem quer concorrer ao prêmio.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/cadastro" className="btn-primary text-base px-7 py-3 rounded-xl flex items-center gap-2">
                  Entrar no Bolão
                  <ArrowRight size={18} />
                </Link>
                <Link href="/ranking" className="btn-secondary text-base px-5 py-3 rounded-xl">
                  Ver ranking
                </Link>
              </div>
            </div>

            {/* Card direita — prêmio + flags */}
            <div className="flex flex-col gap-4">
              {/* Prêmio */}
              {hasLivePrize && ps ? (
                <div className="bg-[#1A1A1A] rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-brand-lime/10 rounded-xl p-3">
                      <Trophy size={32} className="text-brand-lime" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Prêmio em tempo real 🔴</p>
                      <p className="text-2xl font-extrabold text-brand-lime">
                        {formatBRL(ps.prize_1st)} <span className="text-sm text-gray-400 font-medium">no 1º</span>
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    +{formatBRL(ps.prize_2nd)} pro 2º lugar · {ps.paid_count}{' '}
                    {ps.paid_count === 1 ? 'participante pagante' : 'participantes pagantes'} até agora.
                    Atualiza ao vivo conforme mais gente entra.
                  </p>
                </div>
              ) : (
                <div className="bg-[#1A1A1A] rounded-2xl p-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="bg-brand-lime/10 rounded-xl p-3">
                      <Trophy size={32} className="text-brand-lime" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-0.5">Premiação proporcional</p>
                      <p className="text-lg font-extrabold text-brand-lime">1º leva {pct1}% · 2º leva {pct2}%</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400">
                    Sem valor fixo: o prêmio é todo o valor arrecadado nas inscrições, dividido entre os melhores palpiteiros.
                    Quanto mais gente entra, maior o prêmio — veja exemplos abaixo 👇
                  </p>
                </div>
              )}

              {/* Preview ranking falso */}
              <div className="card p-5">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Ranking ao vivo</p>
                {[
                  { pos: 1, name: 'Você pode ser o 1º', pts: '?', color: 'bg-yellow-400' },
                  { pos: 2, name: 'Quem vai ser o 2º?', pts: '?', color: 'bg-gray-300'  },
                  { pos: 3, name: 'Disputa acirrada',    pts: '?', color: 'bg-amber-600' },
                ].map((r) => (
                  <div key={r.pos} className="flex items-center gap-3 py-2 border-b border-surface-border last:border-0">
                    <div className={`w-6 h-6 rounded-full ${r.color} flex items-center justify-center text-xs font-extrabold text-white`}>
                      {r.pos}
                    </div>
                    <span className="flex-1 text-sm text-text-secondary">{r.name}</span>
                    <span className="font-bold text-text-muted text-sm">{r.pts}</span>
                  </div>
                ))}
                <Link href="/cadastro" className="mt-3 block text-center text-xs font-semibold text-brand-lime-dark hover:underline">
                  Entre e garanta sua posição →
                </Link>
              </div>

              {/* Times da copa (flags) */}
              <div className="card p-4">
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Participantes da Copa 2026</p>
                <div className="flex flex-wrap gap-1.5">
                  {['br','ar','fr','de','es','pt','gb','it','nl','hr','be','mx','us','ca','jp','kr','sn','ma','au','gh','cm','ng','eg','tn','sa','ir','qa','pl','rs','ch'].map((code) => (
                    <Image
                      key={code}
                      src={`https://flagcdn.com/w40/${code}.png`}
                      alt={code.toUpperCase()}
                      width={28}
                      height={20}
                      className="rounded-sm shadow-sm"
                      unoptimized
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Premiação proporcional ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <span className="inline-flex items-center gap-1.5 bg-brand-lime/20 text-[#5a6e00] text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
              <Trophy size={11} />
              Premiação 100% proporcional
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Quanto maior o bolão, maior o prêmio</h2>
            <p className="text-text-secondary max-w-xl mx-auto leading-relaxed">
              Não existe valor fixo: <strong className="text-text-primary">todo o valor arrecadado nas inscrições vira prêmio</strong>.{' '}
              🥇 1º lugar leva <strong className="text-text-primary">{pct1}%</strong> do total · 🥈 2º lugar leva{' '}
              <strong className="text-text-primary">{pct2}%</strong>.
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="grid grid-cols-3 gap-2 px-5 py-3 text-xs font-bold text-text-muted uppercase tracking-wider border-b border-surface-border">
              <span>Participantes pagantes</span>
              <span className="text-right">🥇 1º lugar</span>
              <span className="text-right">🥈 2º lugar</span>
            </div>
            {examples.map((ex, i) => (
              <div
                key={ex.count}
                className={`grid grid-cols-3 gap-2 px-5 py-3.5 items-center ${i < examples.length - 1 ? 'border-b border-surface-border' : ''}`}
              >
                <span className="font-semibold text-text-primary">{ex.count} pessoas</span>
                <span className="text-right font-bold text-brand-lime-dark">{formatBRL(ex.prize1)}</span>
                <span className="text-right font-bold text-text-secondary">{formatBRL(ex.prize2)}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-muted text-center mt-3 leading-relaxed">
            * Valores ilustrativos (simulação com inscrição de {formatBRL(entryFee)} por participante).
            O prêmio real depende do número total de participantes pagantes — não é uma promessa de valor fixo.
          </p>

          <div className="mt-8 bg-[#1A1A1A] rounded-2xl p-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Megaphone size={18} className="text-brand-lime" />
              <p className="text-white font-semibold">Chame mais gente e o prêmio aumenta pra todo mundo 🚀</p>
            </div>
            <p className="text-gray-400 text-sm mb-5">Cadastro é grátis — só paga quem quiser concorrer ao prêmio.</p>
            <Link href="/cadastro" className="btn-primary text-base px-7 py-3 rounded-xl inline-flex items-center gap-2">
              Quero concorrer
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Como funciona ── */}
      <section className="bg-surface-muted py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Como funciona?</h2>
            <p className="text-text-secondary">Em 3 passos você já está no jogo.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="card p-6">
                <div className={`w-12 h-12 rounded-xl ${s.color} flex items-center justify-center mb-4`}>
                  <s.icon size={24} />
                </div>
                <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Passo {i + 1}</p>
                <h3 className="font-bold text-lg mb-2">{s.title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pontuação ── */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-extrabold mb-2">Sistema de pontos</h2>
            <p className="text-text-secondary">Quanto mais preciso, mais pontos você ganha.</p>
          </div>
          <div className="card overflow-hidden">
            {scoring.map((s, i) => (
              <div key={i} className={`flex items-center justify-between px-6 py-4 ${i < scoring.length - 1 ? 'border-b border-surface-border' : ''}`}>
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={18} className={i < 3 ? 'text-green-500' : 'text-text-muted'} />
                  <span className="font-medium text-text-primary">{s.label}</span>
                </div>
                <span className={`badge font-bold text-sm ${s.bg} ${s.text}`}>{s.pts}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="bg-[#1A1A1A] py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: 'radial-gradient(circle, #C6FF00 1px, transparent 1px)',
          backgroundSize: '32px 32px'
        }} />
        <div className="relative max-w-xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Users size={20} className="text-brand-lime" />
            <span className="text-gray-400 text-sm font-medium">Junte-se à galera</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Pronto para dar seus palpites?
          </h2>
          <p className="text-gray-400 mb-8">Cadastre-se agora e não perca nenhum jogo.</p>
          <Link href="/cadastro" className="btn-primary text-base px-8 py-3 rounded-xl inline-flex items-center gap-2">
            <Zap size={18} />
            Quero participar
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-surface-border py-6 text-center text-text-muted text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Image src="/logo.svg" alt="Palpitaí" width={72} height={23} />
        </div>
        <p>
          Copa do Mundo 2026 ·{' '}
          <Link href="/regras" className="underline hover:text-text-primary">Regras</Link>
        </p>
      </footer>
    </div>
  )
}
