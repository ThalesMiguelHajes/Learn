import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'
import { ROLES } from '@/lib/constants'

export async function proxy(request) {
  const { user, supabase, supabaseResponse } = await updateSession(request)
  const { pathname } = request.nextUrl

  // If user is logged in, get their role (use cookie to avoid DB call on every request)
  let role = request.cookies.get('user_role')?.value

  if (user) {
    if (!role) {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      role = profile?.role
      
      if (role) {
        supabaseResponse.cookies.set('user_role', role, {
          path: '/',
          maxAge: 60 * 5, // 5 minutes — short-lived so a role change takes effect quickly
          httpOnly: true,
        })
      }
    }
  } else {
    // If no user but cookie exists, clear it
    if (role) {
      supabaseResponse.cookies.delete('user_role')
      role = null
    }
  }

  // Protect /admin routes — require admin role
  if (pathname.startsWith('/admin')) {
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

  // Handle root path: redirect authenticated users to their dashboard, 
  // but allow unauthenticated users to see the Landing Page
  if (pathname === '/') {
    if (user && role) {
      const url = request.nextUrl.clone()
      url.pathname = role === ROLES.ADMIN ? '/admin' : '/biblioteca'
      return NextResponse.redirect(url)
    }
    // Allow pass-through for unauthenticated users to see the landing page
    return supabaseResponse
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
