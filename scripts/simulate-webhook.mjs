// Simula o webhook "billing.paid" da AbacatePay batendo no endpoint local,
// já assinado com a mesma chave HMAC compartilhada que o pacote
// @abacatepay/supabase usa para validar `x-webhook-signature`.
//
// Uso:
//   node scripts/simulate-webhook.mjs <pixId>
//
// <pixId> = o `pix_id` da cobrança pendente (tabela `payments`, ou no
// console do navegador em /pagamento — é o `id` retornado pelo criarCobrancaPix).

import { createHmac } from 'node:crypto'

const ABACATEPAY_SHARED_KEY =
  't9dXRhHHo3yDEj5pVDYz0frf7q6bMKyMRmxxCPIPp3RCplBfXRxqlC6ZpiWmOqj4L63qEaeUOtrCI8P0VMUgo6iIga2ri9ogaHFs0WIIywSMg0q7RmBfybe1E5XJcfC4IW3alNqym0tXoAKkzvfEjZxV6bE0oG2zJrNNYmUCKZyV0KZ3JS8Votf9EAWWYdiDkMkpbMdPggfh1EqHlVkMiTady6jOR3hyzGEHrIz2Ret0xHKMbiqkr9HS1JhNHDX9'

const pixId = process.argv[2]
const baseUrl = process.argv[3] ?? 'http://localhost:3000'
const webhookSecret = process.env.ABACATEPAY_WEBHOOK_SECRET

if (!pixId) {
  console.error('Uso: node scripts/simulate-webhook.mjs <pixId> [baseUrl]')
  process.exit(1)
}
if (!webhookSecret) {
  console.error('Defina ABACATEPAY_WEBHOOK_SECRET no ambiente (mesmo valor do .env.local).')
  process.exit(1)
}

const payload = {
  id: `evt_${Date.now()}`,
  event: 'billing.paid',
  devMode: true,
  data: {
    payment: {
      payment: { amount: 5000, fee: 80, method: 'PIX' },
      pixQrCode: { amount: 5000, id: pixId, kind: 'PIX', status: 'PAID' },
    },
  },
}

const raw = JSON.stringify(payload)
const signature = createHmac('sha256', ABACATEPAY_SHARED_KEY).update(raw).digest('base64')

const url = `${baseUrl}/api/webhooks/abacatepay?webhookSecret=${encodeURIComponent(webhookSecret)}`

const res = await fetch(url, {
  method: 'POST',
  headers: { 'content-type': 'application/json', 'x-webhook-signature': signature },
  body: raw,
})

console.log(`POST ${url}`)
console.log(`-> ${res.status} ${res.statusText}`)
console.log(await res.text())
