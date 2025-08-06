import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@sre-monorepo/lib"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const {userId} = await params;

    // Fetch user dengan semua relasi yang diperlukan untuk analytics
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
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

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Process brain stats menggunakan relasi
    const totalNodes = user.brainstormingSession.reduce((acc, session) => {
      return acc + session.articles.reduce((nodeAcc, article) => nodeAcc + article.nodes.length, 0)
    }, 0)

    const totalEdges = user.brainstormingSession.reduce((acc, session) => {
      return acc + session.articles.reduce((edgeAcc, article) => edgeAcc + article.edges.length, 0)
    }, 0)

    const brainStats = {
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
    }

    // Process writer stats menggunakan relasi
    const totalAnnotationsFromDrafts = user.drafts.reduce((acc, draft) => {
      return acc + draft.sections.reduce((secAcc, section) => secAcc + section.annotations.length, 0)
    }, 0)

    const writerStats = {
      totalDrafts: user.drafts.length,
      totalAnnotations: user.annotations.length + totalAnnotationsFromDrafts,
      totalWritingSessions: user.analytics.filter((a) => a.action === "draft_saved").length,
      aiAssistanceUsage: user.analytics.filter((a) => a.action === "ai_assistance_used").length,
      citationCount: user.analytics.filter((a) => a.action === "citation_added").length,
      avgWordsPerDraft: 0,
      writingProgress: [],
      lastWritingActivity: user.drafts[0]?.createdAt?.toISOString() || new Date().toISOString(),
      mostUsedSemanticTags: [],
      annotationFrequency: [],
    }

    // Process overall stats menggunakan relasi analytics
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

    const overallStats = {
      recentActivity,
      totalLoginSessions: user.analytics.filter((a) => a.action === "login").length,
      totalTimeSpent: 0,
      preferredModule: "both" as const,
      activityPattern: [],
      weeklyActivity: [],
      productivityScore: Math.min(75 + recentActivity * 2, 100),
      engagementLevel,
    }

    const learningAnalytics = {
      userId,
      brainStats,
      writerStats,
      overallStats,
    }

    return NextResponse.json(learningAnalytics)
  } catch (error) {
    console.error("Error fetching user analytics:", error)
    return NextResponse.json({ error: "Failed to fetch user analytics" }, { status: 500 })
  }
}
