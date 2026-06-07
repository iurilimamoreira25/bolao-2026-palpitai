'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function CadastroPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [done,     setDone]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('A senha deve ter pelo menos 6 caracteres.'); return }
    setLoading(true)
    setError('')

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }
    setDone(true)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?redirect=/palpites` },
    })
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
        <div className="card p-8 max-w-sm w-full text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-brand-lime/20 flex items-center justify-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-brand-lime-dark" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2">Confirme seu email</h2>
          <p className="text-text-secondary text-sm mb-6">
            Enviamos um link de confirmação para <strong>{email}</strong>. Verifique sua caixa de entrada e clique no link para ativar sua conta.
          </p>
          <Link href="/login" className="btn-primary text-sm px-6 py-2.5 rounded-xl inline-block">
            Ir para o login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-muted flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex justify-center mb-2">
            <Image src="/logo.svg" alt="Palpitaí" width={160} height={52} priority />
          </Link>
          <p className="text-text-secondary text-sm mt-2">Crie sua conta e entre na disputa</p>
        </div>

        <div className="card p-6 animate-slide-up">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Seu nome"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Como você quer aparecer no ranking"
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              required
              autoComplete="email"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              hint="Mínimo 6 caracteres"
            />

            {error && (
              <p className="text-red-500 text-sm bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" loading={loading} size="lg" className="w-full mt-1">
              Criar conta grátis
            </Button>
          </form>

          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-surface-border" />
            <span className="text-xs text-text-muted">ou</span>
            <div className="flex-1 h-px bg-surface-border" />
          </div>

          <Button variant="secondary" size="lg" className="w-full" onClick={handleGoogle}>
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Cadastrar com Google
          </Button>
        </div>

        <p className="text-center text-sm text-text-secondary mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-text-primary font-semibold hover:underline">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
