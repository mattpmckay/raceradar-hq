import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          },
        },
      },
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // If the user signed up from an event page, auto-save that event to My Season
      const eventSlugMatch = next.match(/^\/events\/([^/?#]+)/)
      if (eventSlugMatch) {
        const slug = eventSlugMatch[1]
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: event } = await supabase
            .from('events')
            .select('id')
            .eq('slug', slug)
            .eq('is_published', true)
            .single()
          if (event) {
            await supabase.from('favourites').insert({
              user_id: user.id,
              entity_type: 'event',
              entity_id: event.id,
            })
            // Silently ignore duplicate (user already had it saved)
          }
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
