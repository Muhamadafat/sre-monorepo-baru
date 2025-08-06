import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update phone verification status
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
        updateAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error verifying phone:", error)
    return NextResponse.json({ error: "Failed to verify phone" }, { status: 500 })
  }
}
