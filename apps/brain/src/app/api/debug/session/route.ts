import { type NextRequest, NextResponse } from "next/server"
import { createServerSupabaseClient } from "@sre-monorepo/lib"
import { prisma } from "@sre-monorepo/lib"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()

    console.log("=== DEBUG SESSION API ===")

    // 1. Cek session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()
    console.log("Session exists:", !!session)
    console.log("Session error:", sessionError)

    // 2. Cek user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    console.log("User exists:", !!user)
    console.log("User error:", userError)
    console.log("User email:", user?.email)
    console.log("User metadata:", user?.user_metadata)

    // 3. Cek database
    const dbUser =
      user?.id != null
      ? await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          name: true,
          email: true,
          group: true,
          nim: true,
        },
      })
    : null;

    return NextResponse.json({
      session: !!session,
      user: !!user,
      userEmail: user?.email,
      userMetadata: user?.user_metadata,
      dbUser: dbUser,
      debug: {
        sessionError,
        userError,
      },
    })
  } catch (error: any) {
    console.error("Debug session error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
