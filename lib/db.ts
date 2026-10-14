import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/** Storage bucket for images and PDFs. Created by supabase/schema.sql. */
export const UPLOAD_BUCKET = 'uploads';

const globalForDb = globalThis as unknown as { __binzSupabase?: SupabaseClient };

function missingConfigMessage(): string {
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return 'Supabase is not configured. The anon key cannot access this site. Add SUPABASE_SERVICE_ROLE_KEY from Project Settings → API.';
  }
  return 'Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env file. See .env.example.';
}

/** Server-only Supabase client. Uses the service role key so admin writes and password hashes stay off the browser. */
export function getSupabase(): SupabaseClient {
  if (globalForDb.__binzSupabase) return globalForDb.__binzSupabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error(missingConfigMessage());

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  globalForDb.__binzSupabase = client;
  return client;
}

export function dbError(error: { message: string } | null, action: string): never {
  const message = error?.message ?? '';
  if (/parent_id/.test(message)) {
    throw new Error(
      'Menus need a parent column before submenus will work. In Supabase, open the SQL Editor and run supabase/submenus.sql, then reload.'
    );
  }
  throw new Error(message ? `${action}: ${message}` : action);
}
