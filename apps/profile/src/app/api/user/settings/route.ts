import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, settings } = body

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Update user settings
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        settings: settings,
        updateAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, user: updatedUser })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
