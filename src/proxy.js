import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { ROLES } from '@/lib/constants'

export async function proxy(request) {
  const { user, supabase, supabaseResponse } = await updateSession(request)
  const { pathname } = request.nextUrl

  // If user is logged in, get their role
  let role = null
  if (user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    role = profile?.role
    console.log('[PROXY] User ID:', user.id, 'Role fetched:', role, 'Error:', error)
  } else {
    console.log('[PROXY] No user found in session')
  }

  // Protect /admin routes — require admin role
  if (pathname.startsWith('/admin')) {
    console.log('[PROXY] Accessing /admin - user:', user?.id, 'role:', role)
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (role !== ROLES.ADMIN) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // Protect /biblioteca routes — require cliente role
  if (pathname.startsWith('/biblioteca')) {
    if (!user) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
    if (role !== ROLES.CLIENTE) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // If already logged in, redirect away from auth pages
  if (pathname === '/login' || pathname === '/cadastro') {
    if (user && role) {
      const url = request.nextUrl.clone()
      url.pathname = role === ROLES.ADMIN ? '/admin' : '/biblioteca'
      return NextResponse.redirect(url)
    }
  }

  // Redirect root to login
  if (pathname === '/') {
    if (user && role) {
      const url = request.nextUrl.clone()
      url.pathname = role === ROLES.ADMIN ? '/admin' : '/biblioteca'
      return NextResponse.redirect(url)
    }
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/',
    '/admin/:path*',
    '/biblioteca/:path*',
    '/login',
    '/cadastro',
  ],
}
