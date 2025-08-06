import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const {userId} = await params

    // Get user's articles count
    const totalArticles = await prisma.article.count({
      where: {
        userId: userId,
      },
    })

    return NextResponse.json({
      totalArticles,
    })
  } catch (error) {
    console.error("Error fetching user articles:", error)
    return NextResponse.json({ error: "Failed to fetch user articles" }, { status: 500 })
  }
}
