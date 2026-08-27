import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ROLES } from '@/lib/constants'

export async function getUser() {
  const supabase = await createClient()

  // getClaims() verifies the session locally (no Auth-server round-trip) when the
  // project uses asymmetric JWT signing keys, unlike getUser() which always calls out.
  const { data: claimsData, error: authError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims

  if (authError || !claims) {
    return { user: null, profile: null }
  }

  const user = { id: claims.sub, email: claims.email, user_metadata: claims.user_metadata }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError) {
    return { user, profile: null }
  }

  return { user, profile }
}

export async function requireAuth() {
  const { user, profile } = await getUser()
  if (!user) {
    redirect('/login')
  }
  return { user, profile }
}

export async function requireAdmin() {
  const { user, profile } = await requireAuth()
  if (!profile || profile.role !== ROLES.ADMIN) {
    redirect('/login')
  }
  return { user, profile }
}

export async function requireCliente() {
  const { user, profile } = await requireAuth()
  if (!profile || profile.role !== ROLES.CLIENTE) {
    redirect('/login')
  }
  return { user, profile }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
