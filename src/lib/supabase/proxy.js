import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getClaims() verifies the JWT locally (via the project's cached JWKS) when the
  // Supabase project uses asymmetric signing keys, avoiding a network round-trip to
  // the Auth server on every request — unlike getUser(), which always calls out.
  // It transparently falls back to a network call if the project still uses a
  // symmetric secret, so this is a safe, zero-downside swap either way.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims ? { id: data.claims.sub, email: data.claims.email } : null

  return { user, supabase, supabaseResponse }
}
