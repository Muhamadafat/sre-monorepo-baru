"use client"

import { useState, useEffect } from "react"
import { sharedSignOut, getSession } from "@sre-monorepo/lib"
import { createClient } from "@sre-monorepo/lib"

interface User {
  id: string
  email: string
  name: string
}

// TAMBAH COUNTER UNTUK DEBUG
let hookInstanceCounter = 0

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // TAMBAH INSTANCE ID
  const [instanceId] = useState(() => {
    hookInstanceCounter++
    return hookInstanceCounter
  })

  console.log(`🎯 useAuth instance #${instanceId} initialized`)

  const fetchUser = async () => {
    console.log(`🚀 [Instance #${instanceId}] fetchUser called`)
    setLoading(true)

    try {
      const session = await getSession(supabase)
      console.log(`📋 [Instance #${instanceId}] Session exists:`, !!session)

      if (session?.user) {
        console.log(`=== [Instance #${instanceId}] USER AUTH DEBUG ===`)
        console.log("User ID:", session.user.id)
        console.log("User email:", session.user.email)

        let userName = session.user.email?.split("@")[0] || "Unknown"

        try {
          console.log(`🔍 [Instance #${instanceId}] Fetching from /api/user/profile...`)

          const response = await fetch("/api/user/profile", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
          })

          console.log(`📡 [Instance #${instanceId}] Response status:`, response.status)

          if (response.ok) {
            const data = await response.json()
            console.log(`📊 [Instance #${instanceId}] API Response:`, data)

            if (data.user?.name) {
              userName = data.user.name
              console.log(`✅ [Instance #${instanceId}] Got name from API:`, userName)
            }
          }
        } catch (apiError) {
          console.log(`❌ [Instance #${instanceId}] API Error:`, apiError)
        }

        const userData: User = {
          id: session.user.id,
          email: session.user.email || "",
          name: userName,
        }

        console.log(`✅ [Instance #${instanceId}] Setting user data:`, userData)
        setUser(userData)
        console.log(`========================`)
      } else {
        console.log(`❌ [Instance #${instanceId}] No session, setting user to null`)
        setUser(null)
      }
    } catch (error) {
      console.error(`💥 [Instance #${instanceId}] Error:`, error)
      setUser(null)
    } finally {
      console.log(`🏁 [Instance #${instanceId}] Setting loading to false`)
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await sharedSignOut(supabase)
      setUser(null)

      const loginUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://main.lvh.me:3000"}/signin`
      window.location.href = loginUrl
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    console.log(`🎬 [Instance #${instanceId}] useEffect triggered`)
    fetchUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(`🔄 [Instance #${instanceId}] Auth state changed:`, event)

      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setTimeout(() => {
          fetchUser()
        }, 100)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      console.log(`🧹 [Instance #${instanceId}] Cleaning up`)
      subscription.unsubscribe()
    }
  }, [])

  // Debug state changes
  useEffect(() => {
    console.log(`📊 [Instance #${instanceId}] State update - User:`, user?.name, "Loading:", loading)
  }, [user, loading])

  return {
    user,
    loading,
    signOut,
    refreshUser: fetchUser,
    isAuthenticated: !!user,
  }
}
