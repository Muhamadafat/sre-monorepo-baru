import type { Session } from "@supabase/supabase-js"

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
    duration?: string // ISO 8601 duration (e.g., PT10.500S)
    completion?: boolean
    success?: boolean
    [key: string]: any
  }
  context?: {
    extensions?: { [key: string]: any }
    [key: string]: any
  }
  userId?: string // Optional: for direct linking in DB
}

export async function sendXapiStatement(
  statement: Omit<XapiStatementPayload, "actor" | "userId">,
  session: Session | null,
  currentPathname: string,
  subdomain: string,
) {
  if (!session?.user?.id) {
    console.warn("No active session found for xAPI statement. Statement not sent.")
    return
  }

  const fullStatement: XapiStatementPayload = {
    actor: {
      mbox: `mailto:${session.user.email}`,
      name: session.user.user_metadata?.name || session.user.email,
    },
    userId: session.user.id,
    context: {
      ...statement.context,
      extensions: {
        "https://example.com/extensions/subdomain": subdomain,
        "https://example.com/extensions/currentPath": currentPathname,
        ...(statement.context?.extensions || {}),
      },
    },
    ...statement,
  }

  try {
    // Use navigator.sendBeacon for reliable sending on page unload
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/xapi", JSON.stringify(fullStatement))
    } else {
      // Fallback to fetch with keepalive
      await fetch("/api/xapi", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fullStatement),
        keepalive: true, // Important for unload events
      })
    }
    console.log("xAPI statement sent:", fullStatement.verb.display["en-US"], fullStatement.object.id)
  } catch (error) {
    console.error("Failed to send xAPI statement:", error)
  }
}

// Helper to format duration to ISO 8601
export function formatDurationISO(milliseconds: number): string {
  const seconds = (milliseconds / 1000).toFixed(3)
  return `PT${seconds}S`
}
