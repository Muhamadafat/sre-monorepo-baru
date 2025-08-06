"use client"

import { useEffect, useState } from "react"

interface User {
  id: string
  email: string
  name: string
}

export function usePageAnalytics(pageName: string) {
  const [user, setUser] = useState<User | null>(null)

  // Fetch user data seperti yang Anda lakukan di DashboardHeader
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      if (data && data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    if (user?.id) {
      const startTime = Date.now()

      // Track page view via API
      fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "page_view",
          userId: user.id,
          document: pageName,
          metadata: {
            page: pageName,
            timestamp: new Date().toISOString(),
          },
        }),
      }).catch((error) => console.error("Error tracking page view:", error))

      // Track time spent on page when component unmounts
      return () => {
        const timeSpent = Math.round((Date.now() - startTime) / 1000)
        fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "page_view",
            userId: user.id,
            document: pageName,
            metadata: {
              page: pageName,
              timeSpent,
              timestamp: new Date().toISOString(),
            },
          }),
        }).catch((error) => console.error("Error tracking time spent:", error))
      }
    }
  }, [user?.id, pageName])
}

export function useFeatureAnalytics() {
  const [user, setUser] = useState<User | null>(null)

  // Fetch user data
  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      if (data && data.user) {
        setUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const trackFeature = async (featureName: string, context?: any) => {
    if (user?.id) {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "feature_used",
            userId: user.id,
            document: featureName,
            metadata: {
              feature: featureName,
              context,
              timestamp: new Date().toISOString(),
            },
          }),
        })
      } catch (error) {
        console.error("Error tracking feature:", error)
      }
    }
  }

  const trackError = async (errorType: string, errorMessage: string, context?: any) => {
    if (user?.id) {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "error_occurred",
            userId: user.id,
            document: "system",
            metadata: {
              errorType,
              errorMessage: errorMessage.substring(0, 200),
              context,
              timestamp: new Date().toISOString(),
            },
          }),
        })
      } catch (error) {
        console.error("Error tracking error:", error)
      }
    }
  }

  return { trackFeature, trackError }
}
