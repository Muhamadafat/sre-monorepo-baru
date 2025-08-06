import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function GET(request: NextRequest) {
  try {
    // Fetch all users dengan role USER dan semua relasi yang diperlukan
    const users = await prisma.user.findMany({
      where: {
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        group: true,
        nim: true,
        createdAt: true,
        analytics: {
          orderBy: { timestamp: "desc" },
        },
        brainstormingSession: {
          include: {
            articles: {
              include: {
                nodes: true,
                edges: true,
              },
            },
            chatMessages: true,
          },
        },
        drafts: {
          include: {
            sections: {
              include: {
                annotations: true,
              },
            },
          },
        },
        annotations: true,
      },
    })

    // Process analytics untuk setiap user menggunakan relasi
    const userAnalytics = users.map((user: any) => {
      // Calculate stats menggunakan relasi
      const totalNodes = user.brainstormingSession.reduce((acc: number, session: any) => {
        return acc + session.articles.reduce((nodeAcc, article) => nodeAcc + article.nodes.length, 0)
      }, 0)

      const totalEdges = user.brainstormingSession.reduce((acc: number, session: any) => {
        return acc + session.articles.reduce((edgeAcc, article) => edgeAcc + article.edges.length, 0)
      }, 0)

      const recentActivity = user.analytics.filter((a) => {
        const dayAgo = new Date()
        dayAgo.setDate(dayAgo.getDate() - 1)
        return a.timestamp && a.timestamp > dayAgo
      }).length

      type EngagementLevel = "low" | "medium" | "high"

        const engagementLevel: EngagementLevel = recentActivity > 10
        ? "high"
        : recentActivity > 5
        ? "medium"
        : "low"

      const analytics = {
        userId: user.id,
        brainStats: {
          totalProjects: user.brainstormingSession.length,
          totalNodes,
          totalEdges,
          totalChatQueries: user.brainstormingSession.reduce((acc, session) => acc + session.chatMessages.length, 0),
          nodeClicks: user.analytics.filter((a) => a.action === "node_click").length,
          edgeClicks: user.analytics.filter((a) => a.action === "edge_click").length,
          sessionDuration: 0,
          lastActivity: user.brainstormingSession[0]?.lastActivity?.toISOString() || "",
          avgNodesPerProject: user.brainstormingSession.length > 0 ? totalNodes / user.brainstormingSession.length : 0,
          avgEdgesPerProject: user.brainstormingSession.length > 0 ? totalEdges / user.brainstormingSession.length : 0,
          mostUsedNodeTypes: [],
          relationshipPatterns: [],
        },
        writerStats: {
          totalDrafts: user.drafts.length,
          totalAnnotations:
            user.annotations.length +
            user.drafts.reduce((acc, draft) => {
              return acc + draft.sections.reduce((secAcc, section) => secAcc + section.annotations.length, 0)
            }, 0),
          totalWritingSessions: user.analytics.filter((a) => a.action === "draft_saved").length,
          aiAssistanceUsage: user.analytics.filter((a) => a.action === "ai_assistance_used").length,
          citationCount: 0,
          avgWordsPerDraft: 0,
          writingProgress: [],
          lastWritingActivity: user.drafts[0]?.createdAt?.toISOString() || new Date().toISOString(),
          mostUsedSemanticTags: [],
          annotationFrequency: [],
        },
        overallStats: {
          recentActivity,
          totalLoginSessions: 0,
          totalTimeSpent: 0,
          preferredModule: "both" as const,
          activityPattern: [],
          weeklyActivity: [],
          productivityScore: Math.min(75 + recentActivity * 2, 100),
          engagementLevel,
        },
      }

      return {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          group: user.group,
          nim: user.nim,
          createdAt: user.createdAt,
        },
        analytics,
      }
    })

    return NextResponse.json(userAnalytics)
  } catch (error) {
    console.error("Error fetching analytics summary:", error)
    return NextResponse.json({ error: "Failed to fetch analytics summary" }, { status: 500 })
  }
}
