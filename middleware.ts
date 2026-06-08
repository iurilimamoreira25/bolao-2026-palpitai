import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/palpites', '/ranking', '/meus-palpites', '/regras']
  const paywalledRoutes = ['/palpites', '/ranking', '/meus-palpites']
  const adminRoutes = ['/admin']
  const authRoutes = ['/login', '/cadastro']

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isPaywalled = paywalledRoutes.some((r) => pathname.startsWith(r))
  const isAdmin = adminRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  if ((isProtected || isAdmin) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Paywall: só entra quem tem profiles.paid = true — campo que SOMENTE o
  // webhook da AbacatePay (via confirm_pix_payment) ou um admin alteram.
  // Checagem feita aqui, no servidor, lendo direto do banco — o front não
  // tem como fingir que pagou.
  if (isPaywalled && user) {
    const { data: profile } = await supabase.from('profiles').select('paid').eq('id', user.id).single()
    if (!profile?.paid) {
      const url = request.nextUrl.clone()
      url.pathname = '/pagamento'
      return NextResponse.redirect(url)
    }
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/palpites'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
