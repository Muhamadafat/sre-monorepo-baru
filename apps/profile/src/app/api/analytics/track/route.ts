import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, document, metadata } = body

    // Validate required fields
    if (!action || !userId) {
      return NextResponse.json({ error: "Action and userId are required" }, { status: 400 })
    }

    // Simpan analytics data ke database menggunakan Prisma dengan relasi
    const analyticsRecord = await prisma.analytics.create({
      data: {
        action,
        userId, // Now required and has relation
        document,
        metadata,
        timestamp: new Date(),
      },
    })

    return NextResponse.json({ success: true, id: analyticsRecord.id })
  } catch (error) {
    console.error("Error saving analytics:", error)
    return NextResponse.json({ error: "Failed to save analytics" }, { status: 500 })
  }
}