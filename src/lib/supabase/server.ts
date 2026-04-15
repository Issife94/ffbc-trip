import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

type SupabaseCookie = {
  name: string
  value: string
  options?: Record<string, unknown>
}

type SupabaseCookieAdapter = {
  getAll: () => SupabaseCookie[]
  setAll: (cookiesToSet: SupabaseCookie[]) => void
}

export async function createClient(cookieAdapter?: SupabaseCookieAdapter) {
  let resolvedCookieAdapter: SupabaseCookieAdapter

  if (cookieAdapter) {
    resolvedCookieAdapter = cookieAdapter
  } else {
    const cookieStore = await cookies()
    resolvedCookieAdapter = {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: SupabaseCookie[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {}
      },
    }
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: resolvedCookieAdapter,
    }
  )
}
