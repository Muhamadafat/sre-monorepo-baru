import { type NextRequest, NextResponse } from "next/server"
import { PrismaClient, Role } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    // Get total counts
    const totalUsers = await prisma.user.count()
    const totalAdmins = await prisma.user.count({
      where: { role: Role.ADMIN },
    })
    const totalStudents = await prisma.user.count({
      where: { role: Role.USER },
    })

    // Group counts
    const totalGroupA = await prisma.user.count({
      where: { group: "A" },
    })
    const totalGroupB = await prisma.user.count({
      where: { group: "B" },
    })

    // Recent users (last 7 days)
    const recentUsers = await prisma.user.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        group: true,
        nim: true,
        avatar_url: true,
        createdAt: true,
      },
    })

    // Calculate user growth (last 30 days vs previous 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    const recentUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    })

    const previousUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo,
        },
      },
    })

    const userGrowth = previousUsersCount > 0 ? ((recentUsersCount - previousUsersCount) / previousUsersCount) * 100 : 0

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalStudents,
      totalGroupA,
      totalGroupB,
      recentUsers,
      userGrowth,
    })
  } catch (error) {
    console.error("Error fetching users data:", error)
    return NextResponse.json({ error: "Failed to fetch users data" }, { status: 500 })
  }
}
