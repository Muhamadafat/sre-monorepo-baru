// apps/main/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerSupabaseClient } from '@sre-monorepo/lib';
import { sendXapiFromMiddleware } from '@sre-monorepo/lib';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    const { pathname } = request.nextUrl;

    //for xapi
    let sessionId = null;
    if (session){
      sessionId = `${session.user.id}_${Math.floor(session.expires_at! / 1000)}`;
    }

    if (session && sessionId){
      await sendXapiFromMiddleware({
        verb: {
          id: "http://adlnet.gov/expapi/verbs/experienced",
          display: { "en-US": "viewed"}
        },
        object: {
          id: `main${pathname}`,
          definition: {
            name: { "en-US": `Main App - ${pathname}`},
            type: "http://adlnet.gov/expapi/activities/lesson"
          }
        },
        context: {
          extensions: {
            sessionId: sessionId,
            flowStep: "main",
            currentPath: pathname,
            supabaseUserId: session.user.id,
            sessionExpiry: session.expires_at
          }
        }
      }, session, "main", request);
    }

    // Debug logging untuk development
    if (process.env.NODE_ENV === 'development') {
      console.log('=== MAIN MIDDLEWARE DEBUG ===');
      console.log('Pathname:', pathname);
      console.log('Session exists:', !!session);
      console.log('User email:', session?.user?.email);
      console.log('==============================');
    }

    // Jika pengguna sudah terautentikasi dan mencoba mengakses signin/signup
    if (session && (pathname === '/signin' || pathname === '/signup')) {

      //trak event xapi
      await sendXapiFromMiddleware({
        verb: {
          id: "http://adlnet.gov/expapi/verbs/skipped",
          display: { "en-US": "skipped" }
        },
        object: {
          id: `main${pathname}`,
          definition: {
            name: { "en-US": `Already authenticated - skipped ${pathname}` },
            type: "http://adlnet.gov/expapi/activities/interaction"
          }
        },
        context: {
          extensions: {
            sessionId: sessionId,
            flowStep: "authentication-skip",
            redirectTo: "profile/dashboard"
          }
        }
      }, session, "main", request)


      const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_PROFILE_APP_URL || 'http://profile.lvh.me:3001');
      console.log('User already authenticated, redirecting to brain app root:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    // Jika pengguna terautentikasi dan mengakses root, redirect ke brain app
    if (session && pathname === '/') {
      const redirectUrl = new URL('/dashboard', process.env.NEXT_PUBLIC_PROFILE_APP_URL || 'http://profile.lvh.me:3001');
      console.log('Authenticated user accessing root, redirecting to brain app:', redirectUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  } catch (error) {
    console.error('Main App Middleware error:', error);
    return response;
  }
}

export const config = {
  matcher: [
    '/',
    '/signin',
    '/signup',
  ],
};