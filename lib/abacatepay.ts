import AbacatePay from 'abacatepay-nodejs-sdk'

const TRANSPARENT_BASE_URL = 'https://api.abacatepay.com/v2'

export function getAbacatePay() {
  return AbacatePay(process.env.ABACATEPAY_API_KEY!)
}

export type TransparentPixStatus = 'PENDING' | 'PAID' | 'EXPIRED' | 'CANCELLED' | 'REFUNDED'

export interface TransparentPixCharge {
  id: string
  amount: number
  status: TransparentPixStatus
  brCode: string
  brCodeBase64: string
  expiresAt: string
  metadata?: Record<string, unknown>
}

interface CreateTransparentPixInput {
  amount: number
  expiresIn: number
  description: string
  externalId: string
  metadata?: Record<string, unknown>
  customer?: { name?: string; email?: string }
}

type TransparentPixResult =
  | { data: TransparentPixCharge; error: null }
  | { data: null; error: string }

/**
 * Checkout transparente Pix (v2) — usado para criar a cobrança porque permite
 * anexar externalId/metadata (ligando a cobrança ao userId do Supabase).
 * @see https://docs.abacatepay.com/pages/transparents/create
 */
export async function createTransparentPixCharge(
  input: CreateTransparentPixInput
): Promise<TransparentPixResult> {
  const res = await fetch(`${TRANSPARENT_BASE_URL}/transparents/create`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ method: 'PIX', data: input }),
  })

  const json: { data?: TransparentPixCharge; success?: boolean; error?: string } | null =
    await res.json().catch(() => null)

  if (!res.ok || !json?.success || !json.data) {
    return { data: null, error: json?.error || `Erro ao criar cobrança Pix (HTTP ${res.status})` }
  }

  return { data: json.data, error: null }
}
