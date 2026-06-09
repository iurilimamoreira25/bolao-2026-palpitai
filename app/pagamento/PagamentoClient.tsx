'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { criarCobrancaPix, verificarPagamento } from './actions'
import type { Payment } from '@/types'
import { QrCode, Copy, Check, Loader2, RefreshCw, Clock } from 'lucide-react'

function qrSrc(brCodeBase64: string) {
  return brCodeBase64.startsWith('data:') ? brCodeBase64 : `data:image/png;base64,${brCodeBase64}`
}

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function useCountdown(expiresAt: string | null) {
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!expiresAt) {
      setRemaining(null)
      return
    }
    const target = new Date(expiresAt).getTime()
    const tick = () => setRemaining(Math.max(0, Math.floor((target - Date.now()) / 1000)))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  return remaining
}

export default function PagamentoClient({ entryFee }: { entryFee: number }) {
  const router = useRouter()
  const [payment, setPayment] = useState<Payment | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const remaining = useCountdown(payment?.expires_at ?? null)
  const expired = remaining === 0

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [])

  const startPolling = useCallback((pixId: string) => {
    stopPolling()
    pollRef.current = setInterval(async () => {
      const result = await verificarPagamento(pixId)
      if (result.error === null) {
        setPayment(result.data)
        if (result.data.status === 'PAID') {
          stopPolling()
          router.refresh()
        }
      }
    }, 5000)
  }, [router, stopPolling])

  useEffect(() => stopPolling, [stopPolling])

  async function gerarPix() {
    setLoading(true)
    setError(null)
    const result = await criarCobrancaPix()
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }
    if (!result.data) {
      setError('Erro inesperado ao gerar cobrança. Tente novamente.')
      return
    }

    setPayment(result.data)
    if (result.data.status !== 'PAID') startPolling(result.data.pix_id)
  }

  async function copiarCodigo() {
    if (!payment?.br_code) return
    await navigator.clipboard.writeText(payment.br_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Pagamento confirmado
  if (payment?.status === 'PAID') {
    return (
      <div className="card p-8 flex flex-col items-center text-center gap-3 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
          <Check size={28} className="text-green-600" />
        </div>
        <h2 className="text-lg font-extrabold text-text-primary">Pagamento confirmado!</h2>
        <p className="text-text-secondary text-sm">Sua inscrição foi liberada — atualizando a página...</p>
      </div>
    )
  }

  // QR Code ativo, aguardando pagamento
  if (payment?.br_code_base64 && !expired) {
    return (
      <div className="card p-6 flex flex-col items-center gap-5 animate-fade-in">
        <div className="flex items-center gap-2 text-sm font-semibold text-text-primary">
          <QrCode size={16} className="text-[#5a6e00]" />
          Escaneie com o app do seu banco
        </div>

        <div className="p-3 bg-white rounded-2xl ring-1 ring-surface-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrSrc(payment.br_code_base64)} alt="QR Code Pix" width={220} height={220} className="rounded-lg" />
        </div>

        {remaining !== null && (
          <p className="flex items-center gap-1.5 text-xs text-text-muted">
            <Clock size={13} />
            Expira em <span className="font-semibold text-text-primary">{formatCountdown(remaining)}</span>
          </p>
        )}

        <div className="w-full">
          <p className="text-xs text-text-muted mb-1.5">Ou copie o código Pix (copia e cola)</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={payment.br_code ?? ''}
              onFocus={(e) => e.currentTarget.select()}
              className="input flex-1 text-xs font-mono truncate"
            />
            <button onClick={copiarCodigo} className="btn-secondary px-3 py-2.5 flex items-center gap-1.5 flex-shrink-0">
              {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-text-muted">
          <Loader2 size={13} className="animate-spin" />
          Aguardando confirmação — assim que cair na conta, sua entrada é liberada automaticamente.
        </p>
      </div>
    )
  }

  // Código expirado
  if (payment && expired) {
    return (
      <div className="card p-6 flex flex-col items-center text-center gap-3 animate-fade-in">
        <p className="text-sm font-semibold text-text-primary">Esse código Pix expirou.</p>
        <p className="text-xs text-text-muted">Gere um novo código para concluir sua inscrição.</p>
        <button onClick={gerarPix} disabled={loading} className="btn-primary px-6 py-2.5 flex items-center gap-2">
          {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
          Gerar novo código Pix
        </button>
        {error && <p className="text-xs text-red-500">{error}</p>}
      </div>
    )
  }

  // Estado inicial
  return (
    <div className="card p-6 flex flex-col items-center text-center gap-3 animate-fade-in">
      <div className="w-12 h-12 rounded-2xl bg-brand-lime/20 flex items-center justify-center">
        <QrCode size={22} className="text-[#5a6e00]" />
      </div>
      <h2 className="font-bold text-text-primary">Pagar com Pix</h2>
      <p className="text-text-secondary text-sm max-w-sm">
        Gere um QR Code Pix de{' '}
        <span className="font-semibold text-text-primary">
          {entryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>{' '}
        e pague direto pelo app do seu banco. A confirmação é automática.
      </p>
      <button onClick={gerarPix} disabled={loading} className="btn-primary px-6 py-2.5 flex items-center gap-2">
        {loading ? <Loader2 size={15} className="animate-spin" /> : <QrCode size={15} />}
        {loading ? 'Gerando código...' : 'Gerar QR Code Pix'}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
