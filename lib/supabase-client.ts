import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './supabase'
 
export function createClient() {
  // Create a supabase client on the browser with project's credentials
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Export the supabase instance for compatibility
export const supabase = createClient()