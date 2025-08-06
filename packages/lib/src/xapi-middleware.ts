// packages/lib/src/xapi-middleware.ts - NEW FILE
import type { Session } from "@supabase/supabase-js"
import type { NextRequest } from 'next/server'

interface XapiStatementPayload {
  actor: {
    mbox?: string
    name?: string
    [key: string]: any
  }
  verb: {
    id: string
    display: { [lang: string]: string }
    [key: string]: any
  }
  object: {
    id: string
    definition?: {
      name?: { [lang: string]: string }
      description?: { [lang: string]: string }
      type?: string
      [key: string]: any
    }
    [key: string]: any
  }
  result?: {
    duration?: string
    completion?: boolean
    success?: boolean
    [key: string]: any
  }
  context?: {
    extensions?: { [key: string]: any }
    [key: string]: any
  }
  userId?: string
  sessionId?: string
}

export async function sendXapiFromMiddleware(
  statement: Omit<XapiStatementPayload, "actor" | "userId">,
  session: Session | null,
  subdomain: string,
  request: NextRequest
) {
  if (!session?.user?.id) {
    console.warn("No active session found for xAPI statement (middleware). Statement not recorded.")
    return
  }

  const sessionId = `${session.user.id}_${Math.floor(session.expires_at! / 1000)}`;

  const fullStatement: XapiStatementPayload = {
    actor: {
      mbox: `mailto:${session.user.email}`,
      name: session.user.user_metadata?.name || session.user.email,
    },
    userId: session.user.id,
    sessionId: sessionId,
    context: {
      ...statement.context,
      extensions: {
        "https://example.com/extensions/subdomain": subdomain,
        sessionId: sessionId,
        ...(statement.context?.extensions || {}),
      },
    },
    ...statement,
  }

  try {
    // Use fetch to call internal API instead of direct Prisma
    const response = await fetch(`${request.nextUrl.origin}/api/xapi`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(fullStatement),
    })

    if (!response.ok) {
      console.error("Failed to send xAPI from middleware:", await response.text())
    } else {
      console.log("xAPI statement recorded (middleware):", fullStatement.verb.display["en-US"], fullStatement.object.id)
    }
  } catch (error) {
    console.error("Failed to send xAPI from middleware:", error)
  }
}