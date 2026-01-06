import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { auth } from '@/lib/auth'
import { Role } from '@prisma/client'
import { locales } from '@/i18n'

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'th',
  localePrefix: 'as-needed',
})

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public routes - skip auth check
  if (path === '/login' || path.startsWith('/api/auth') || path.startsWith('/_next') || path.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Check authentication
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user) {
    if (path !== '/login') {
      const url = new URL('/login', request.url)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  const role = session.user.role as Role

  // Redirect root path to role-based dashboard
  if (path === '/' || path === '/th' || path === '/en') {
    let redirectPath = '/admin/dashboard'
    if (role === Role.SUPERVISOR) {
      redirectPath = '/supervisor/dashboard'
    } else if (role === Role.SCHOOL) {
      redirectPath = '/school/dashboard'
    } else if (role === Role.EXECUTIVE) {
      redirectPath = '/executive/dashboard'
    }
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  // Role-based route protection
  // Admin routes
  if (path.includes('/admin') && role !== Role.ADMIN) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Supervisor routes
  if (
    path.includes('/supervisor') &&
    role !== Role.SUPERVISOR &&
    role !== Role.ADMIN
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // School routes
  if (
    path.includes('/school') &&
    role !== Role.SCHOOL &&
    role !== Role.ADMIN
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  // Executive routes
  if (
    path.includes('/executive') &&
    role !== Role.EXECUTIVE &&
    role !== Role.ADMIN
  ) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/(th|en)/:path*',
    '/admin/:path*',
    '/supervisor/:path*',
    '/school/:path*',
    '/executive/:path*',
    '/supervisions/:path*',
    '/schools/:path*',
    '/reports/:path*',
  ],
}
