import { type NextRequest, NextResponse } from "next/server";
import { prisma } from '@sre-monorepo/lib';

export async function GET(request: NextRequest) {
  try {
    // Get total articles count
    const totalArticles = await prisma.article.count()

    // Recent articles with authors
    const recentArticles = await prisma.article.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })

    // Transform the data to match expected interface
    const transformedArticles = recentArticles.map((article) => ({
      id: article.id,
      title: article.title,
      userId: article.userId,
      createdAt: article.createdAt,
      author: article.user,
    }))

    return NextResponse.json({
      totalArticles,
      recentArticles: transformedArticles,
    })
  } catch (error) {
    console.error("Error fetching articles data:", error)
    return NextResponse.json({ error: "Failed to fetch articles data" }, { status: 500 })
  }
}
