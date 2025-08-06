import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerSupabaseClient } from "@sre-monorepo/lib"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // FIXED: Skip API routes sama seperti brain middleware
  if (
    pathname.startsWith('/api/') ||        // <-- TAMBAHKAN INI!
    pathname.startsWith("/_next/") || 
    pathname.startsWith("/static/") || 
    pathname.includes(".")
  ) {
    return NextResponse.next()
  }

  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (process.env.NODE_ENV === "development") {
      console.log("=== WRITER MIDDLEWARE DEBUG ===")
      console.log("Pathname:", pathname)
      console.log("Session exists:", !!session)
      console.log("Session user:", session?.user?.email)
      console.log("Session error:", error)
      console.log("Cookies:", request.headers.get("cookie"))
      console.log("================================")
    }

    if (!session) {
      const redirectUrl = new URL("/signin", process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://main.lvh.me:3000")
      redirectUrl.searchParams.set("redirectedFrom", request.url)
      console.log("Writer: Redirecting unauthenticated user to:", redirectUrl.toString())
      return NextResponse.redirect(redirectUrl)
    }

    const sessionId = `${session.user.id}_${Math.floor((session.expires_at || 0) / 1000)}`
    const response = NextResponse.next()
    response.headers.set("X-Authenticated", session ? "true" : "false")
    response.headers.set("X-User-Email", session?.user?.email || "")
    response.headers.set("X-Middleware", "writer-passed")
    response.headers.set("X-Session-Id", sessionId)
    response.headers.set("X-Page-Enter-Time", Date.now().toString())
    return response
  } catch (error) {
    console.error("Writer Middleware error:", error)
    const redirectUrl = new URL("/signin", process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://main.lvh.me:3000")
    return NextResponse.redirect(redirectUrl)
  }
}

export const config = {
  // FIXED: Matcher yang sama dengan brain
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}