import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_PUBLISHABLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { teamId, languageBreakdown, platformBreakdown, postCount, geolocatedCount } = body

    await supabase.from('intel_logs').insert({
      team_id: teamId,
      key_intel: JSON.stringify({
        source: 'global_chatter',
        languages: languageBreakdown,
        platforms: platformBreakdown,
        totalPosts: postCount,
        geolocated: geolocatedCount,
        summary: `${postCount} fan posts detected across ${Object.keys(languageBreakdown || {}).length} languages`
      }),
      sentiment_score: null,
      captured_at: new Date().toISOString()
    })

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
