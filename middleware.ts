import { NextRequest, NextResponse } from 'next/server'

const LEAGUES = new Set(['nfl', 'nba', 'mls', 'wnba'])

// Map team slugs to their league for redirects
const TEAM_LEAGUE: Record<string, string> = {
  chiefs: 'nfl', ravens: 'nfl', bills: 'nfl', eagles: 'nfl', lions: 'nfl',
  commanders: 'nfl', packers: 'nfl', texans: 'nfl', vikings: 'nfl',
  chargers: 'nfl', broncos: 'nfl', steelers: 'nfl', buccaneers: 'nfl',
  bears: 'nfl', bengals: 'nfl', colts: 'nfl', cowboys: 'nfl',
  dolphins: 'nfl', falcons: 'nfl', niners: 'nfl', giants: 'nfl',
  jaguars: 'nfl', jets: 'nfl', panthers: 'nfl', patriots: 'nfl',
  raiders: 'nfl', rams: 'nfl', saints: 'nfl', seahawks: 'nfl',
  cardinals: 'nfl', titans: 'nfl', browns: 'nfl',
  lakers: 'nba', celtics: 'nba', warriors: 'nba', knicks: 'nba',
  bucks: 'nba', nuggets: 'nba', heat: 'nba', suns: 'nba',
  mavericks: 'nba', cavaliers: 'nba', thunder: 'nba', timberwolves: 'nba',
  'inter-miami': 'mls', lafc: 'mls', galaxy: 'mls', sounders: 'mls',
  timbers: 'mls', atlanta: 'mls', austin: 'mls', columbus: 'mls',
}

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const subdomain = host.split('.')[0].toLowerCase()

  // Not a feedmelight.com request - skip (allows vercel.app to work)
  if (!host.includes('feedmelight.com')) return NextResponse.next()

  // Skip www and the apex domain
  if (subdomain === 'www' || subdomain === 'feedmelight') return NextResponse.next()

  const url = request.nextUrl.clone()
  const path = url.pathname

  // Redirect /pitch/* paths on subdomains to clean URLs
  if (path.startsWith('/pitch/')) {
    const rest = path.replace('/pitch/', '')
    if (LEAGUES.has(subdomain)) {
      // On league subdomain: /pitch/chiefs/budget -> /chiefs/budget
      url.pathname = `/${rest}`
      return NextResponse.redirect(url, 301)
    } else {
      // On team subdomain: /pitch/chiefs/budget -> /budget
      const teamPrefix = subdomain + '/'
      const cleanPath = rest.startsWith(teamPrefix)
        ? '/' + rest.slice(teamPrefix.length)
        : rest === subdomain ? '/' : `/${rest}`
      url.pathname = cleanPath
      return NextResponse.redirect(url, 301)
    }
  }

  if (LEAGUES.has(subdomain)) {
    // League subdomain: nfl.feedmelight.com/chiefs -> /pitch/chiefs
    const segments = path.split('/').filter(Boolean)
    if (segments.length === 0) {
      // nfl.feedmelight.com/ -> show league-specific index
      url.pathname = `/pitch/league/${subdomain}`
      return NextResponse.rewrite(url)
    }
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
  matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
}
