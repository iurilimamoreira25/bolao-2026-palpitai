import AbacatePay from 'abacatepay-nodejs-sdk'

// Instância do SDK AbacatePay — usada em actions e webhooks.
// A chave nunca sai do servidor: lida de process.env em runtime, nunca bundlada pro client.
export function getAbacatePay() {
  if (!process.env.ABACATEPAY_API_KEY) {
    throw new Error('ABACATEPAY_API_KEY não configurada no ambiente.')
  }
  return AbacatePay(process.env.ABACATEPAY_API_KEY)
}
