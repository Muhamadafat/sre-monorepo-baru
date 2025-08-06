// packages/lib/src/supabase-server.ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createServerSupabaseClient() {
    const cookieStore = await cookies();

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            // Pastikan domain cookie konsisten
                            const cookieOptions: any = {
                                ...options,
                                domain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN || '.lvh.me',
                                path: '/',
                                httpOnly: true, 
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'lax',
                                maxAge: options?.maxAge || 60 * 60 * 24 * 7 // 7 days 
                            };

                            // Log untuk debugging
                            if (process.env.NODE_ENV === 'development') {
                                console.log(`Setting cookie ${name} with domain: ${cookieOptions.domain}`);
                            }

                            cookieStore.set({
                                name,
                                value,
                                ...cookieOptions
                            });
                        });
                    } catch (error) {
                        console.error("Error setting cookies in setAll:", error);
                    }
                },
            }
        }
    )
}