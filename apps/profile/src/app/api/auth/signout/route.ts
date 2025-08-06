// app/api/auth/signout/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@sre-monorepo/lib'
import { sendXapiStatementServer } from '@sre-monorepo/lib'
import { prisma } from '@sre-monorepo/lib';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();

    //tambah xapi
    const { data: {session}} = await supabase.auth.getSession()

    // Track logout event BEFORE signing out
    if (session) {
      const sessionId = `${session.user.id}_${Math.floor(session.expires_at! / 1000)}`
      const subdomain = request.headers.get('host')?.includes('profile') ? 'profile' : 'brain'
      
      // Calculate session duration jika ada session start

      const sessionDuration = await calculateSessionDuration(session.user.id, sessionId);
      
      await sendXapiStatementServer({
        verb: {
          id: "http://adlnet.gov/expapi/verbs/logged-out",
          display: { "en-US": "logged out" }
        },
        object: {
          id: `${subdomain}/logout`,
          definition: {
            name: { "en-US": `Logout from ${subdomain}` },
            type: "http://adlnet.gov/expapi/activities/interaction"
          }
        },
        result: {
          duration: sessionDuration,
          completion: true,
          success: true
        },
        context: {
          extensions: {
            sessionId: sessionId,
            flowStep: "session-end",
            logoutSource: subdomain,
            userAgent: request.headers.get('user-agent') || ''
          }
        }
      }, session, subdomain)
    }

    // Sign out dari Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Supabase signOut error:", error)
      return NextResponse.json({ error: "Failed to sign out" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Sign out error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

async function calculateSessionDuration(userId: string, currentSessionId: string): Promise<string> {
  try {
    console.log(`🕐 Finding session start for ${currentSessionId}`);
    
    // Find ANY statement with this sessionId (earliest = session start)
    const sessionStart = await prisma.xapiStatement.findFirst({
      where: {
        userId: userId,
        context: {
          path: ['extensions', 'sessionId'],
          equals: currentSessionId
        }
      },
      orderBy: {
        timestamp: 'asc' // Earliest first
      }
    });
    
    if (sessionStart) {
      const duration = Date.now() - sessionStart.timestamp.getTime();
      const durationSeconds = (duration / 1000).toFixed(1);
      
      console.log(`✅ Session started at: ${sessionStart.timestamp.toISOString()}`);
      console.log(`✅ Duration: ${durationSeconds}s`);
      
      return `PT${durationSeconds}S`;
    }
    
    console.warn(`⚠️ No session data found for ${currentSessionId}`);
    return "PT60S"; // Default 1 minute if no data
    
  } catch (error) {
    console.error("❌ Error calculating duration:", error);
    return "PT0S";
  }
}

// GET endpoint - always redirect
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Supabase signout error:', error)
    }
    
    return NextResponse.redirect(new URL('/signin', request.url))
  } catch (error) {
    console.error('Sign out error:', error)
    return NextResponse.redirect(new URL('/signin', request.url))
  }
}