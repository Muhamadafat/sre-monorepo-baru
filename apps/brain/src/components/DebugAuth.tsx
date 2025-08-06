"use client"

import { useAuth } from "../hooks/useAuth"
import { Card, Text, Button, Stack, Code, Group } from "@mantine/core"
import { useState } from "react"

export function DebugAuth() {
  const { user, loading, refreshUser } = useAuth()
  const [apiResult, setApiResult] = useState<any>(null)
  const [apiLoading, setApiLoading] = useState(false)

  const testApiCall = async () => {
    setApiLoading(true)
    try {
      console.log("🧪 Manual API test starting...")
      const response = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      })

      console.log("📡 Manual test - Response status:", response.status)
      console.log("📡 Manual test - Response headers:", Object.fromEntries(response.headers.entries()))

      if (response.ok) {
        const data = await response.json()
        console.log("📊 Manual test - Response data:", data)
        setApiResult(data)
      } else {
        const errorText = await response.text()
        console.log("❌ Manual test - Error:", errorText)
        setApiResult({ error: errorText })
      }
    } catch (error: any) {
      console.error("💥 Manual test - Fetch error:", error)
      setApiResult({ error: error.message })
    } finally {
      setApiLoading(false)
    }
  }

  const testSessionCall = async () => {
    try {
      console.log("🧪 Testing session debug API...")
      const response = await fetch("/api/debug/session")
      const data = await response.json()
      console.log("📊 Session debug result:", data)
    } catch (error) {
      console.error("💥 Session debug error:", error)
    }
  }

  return (
    <Card withBorder p="md" m="md">
      <Stack gap="sm">
        <Text fw={600} size="lg">
          🔍 Auth Debug Info
        </Text>

        <Group>
          <div>
            <Text size="sm" c="dimmed">
              Loading:
            </Text>
            <Code color={loading ? "orange" : "green"}>{loading ? "true" : "false"}</Code>
          </div>

          <div>
            <Text size="sm" c="dimmed">
              Authenticated:
            </Text>
            <Code color={user ? "green" : "red"}>{user ? "true" : "false"}</Code>
          </div>
        </Group>

        <div>
          <Text size="sm" c="dimmed">
            User Data:
          </Text>
          <Code block>{JSON.stringify(user, null, 2)}</Code>
        </div>

        {apiResult && (
          <div>
            <Text size="sm" c="dimmed">
              Last API Test Result:
            </Text>
            <Code block>{JSON.stringify(apiResult, null, 2)}</Code>
          </div>
        )}

        <Group>
          <Button onClick={refreshUser} size="xs" variant="filled">
            🔄 Refresh User
          </Button>

          <Button onClick={testApiCall} size="xs" variant="outline" loading={apiLoading}>
            🧪 Test API Call
          </Button>

          <Button onClick={testSessionCall} size="xs" variant="light">
            🔍 Test Session
          </Button>
        </Group>
      </Stack>
    </Card>
  )
}
