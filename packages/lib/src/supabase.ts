// packages/lib/src/supabase.ts
import { createBrowserClient } from '@supabase/ssr';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.lvh.me',
        path: '/',
        httpOnly: false, // Browser client harus false
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      },
      auth: {
        // Pastikan refresh token di-handle dengan benar
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    }
  );