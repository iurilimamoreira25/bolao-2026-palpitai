'use client'
import { useState } from 'react'
import { Share2, Copy, Check, Megaphone } from 'lucide-react'

const SITE_URL   = 'https://palpitai-six.vercel.app'
const SHARE_TEXT = '🏆 Tô participando do Palpitaí, o bolão da Copa 2026! Bora apostar nos jogos e ver quem entende mais de futebol. Entra aí:'
const FULL_MESSAGE = `${SHARE_TEXT} ${SITE_URL}`

export default function InviteCard() {
  const [copied, setCopied] = useState(false)

  async function handleShare() {
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'Palpitaí — Bolão da Copa 2026', text: SHARE_TEXT, url: SITE_URL })
      } catch {
        // usuário cancelou o compartilhamento — não faz nada
      }
      return
    }
    // Sem suporte ao Web Share (geralmente desktop): abre o WhatsApp Web com a mensagem pronta
    window.open(`https://wa.me/?text=${encodeURIComponent(FULL_MESSAGE)}`, '_blank', 'noopener,noreferrer')
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(FULL_MESSAGE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copie o link do convite:', FULL_MESSAGE)
    }
  }

  return (
    <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 ring-1 ring-brand-lime/40">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-10 h-10 rounded-2xl bg-brand-lime/20 flex items-center justify-center flex-shrink-0">
          <Megaphone size={18} className="text-[#5a6e00]" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-text-primary">Bolão é mais divertido com a galera 👀</p>
          <p className="text-xs text-text-muted">Chama a turma pra apostar e disputar o ranking com você!</p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleCopy}
          className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-sm whitespace-nowrap"
        >
          {copied ? <Check size={15} className="text-brand-lime-dark" /> : <Copy size={15} />}
          {copied ? 'Link copiado!' : 'Copiar link'}
        </button>
        <button
          onClick={handleShare}
          className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap"
        >
          <Share2 size={15} />
          Convidar amigos
        </button>
      </div>
    </div>
  )
}
