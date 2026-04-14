import { NextRequest, NextResponse } from 'next/server'

const LEAGUES = new Set(['nfl', 'nba', 'mls', 'wnba'])

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0].toLowerCase()

  // Not a feedmelight.com request - skip
  if (!host.includes('feedmelight.com')) return NextResponse.next()

  // Skip www and the apex domain
  if (subdomain === 'www' || subdomain === 'feedmelight') return NextResponse.next()

  const url = request.nextUrl.clone()
  const path = url.pathname

  if (LEAGUES.has(subdomain)) {
    // League subdomain: nfl.feedmelight.com/chiefs -> /pitch/chiefs
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) return NextResponse.next()
    const [teamSlug, ...rest] = segments
    url.pathname = `/pitch/${teamSlug}${rest.length ? '/' + rest.join('/') : ''}`
    return NextResponse.rewrite(url)
  } else {
    // Team subdomain: chiefs.feedmelight.com/budget -> /pitch/chiefs/budget
    url.pathname = `/pitch/${subdomain}${path === '/' ? '' : path}`
    return NextResponse.rewrite(url)
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).)'],
}
