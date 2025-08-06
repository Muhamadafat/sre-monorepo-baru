import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update email verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isEmailVerified: true,
        updateAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error verifying email:", error)
    return NextResponse.json({ error: "Failed to verify email" }, { status: 500 })
  }
}
