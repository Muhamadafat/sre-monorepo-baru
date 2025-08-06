"use client"

import {
  Container,
  Flex,
  Group,
  Box,
  Text,
  ActionIcon,
  Tooltip,
  Menu,
  Avatar,
  Burger,
  ThemeIcon,
  Image,
  useMantineColorScheme,
} from "@mantine/core"
import { IconNetwork, IconSettings, IconSun, IconMoon, IconUser, IconLogout } from "@tabler/icons-react"
import { useState, useEffect } from "react"

interface DashboardHeaderProps {
  sidebarOpened: boolean
  onToggleSidebar: () => void
  mounted: boolean
}

export function DashboardHeader({ sidebarOpened, onToggleSidebar, mounted }: DashboardHeaderProps) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const dark = mounted ? colorScheme === "dark" : false

  // SOLUSI SEDERHANA: State lokal untuk user data
  const [userData, setUserData] = useState<{ name: string; email: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user data langsung di component ini
  useEffect(() => {
    if (!mounted) return

    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user/profile")
        if (response.ok) {
          const data = await response.json()
          setUserData({
            name: data.user?.name || "Unknown User",
            email: data.user?.email || "No email",
          })
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [mounted])

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      // Call logout API
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      })

      if (response.ok) {
        // Clear user data lokal
        setUserData(null)

        // Redirect ke main app signin
        const loginUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://main.lvh.me:3000"}/signin`
        window.location.href = loginUrl
      } else {
        console.error("Logout API failed")
      }
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoading(false)
    }
  }

  if (!mounted) {
    return (
      <Container fluid h="100%" px="xl">
        <Flex h="100%" justify="space-between" align="center">
          <Group gap="md">
            <Burger opened={false} onClick={() => {}} size="sm" />
            <Group gap="xs">
              <Image
                src='/images/logoSRE_Tulis.png'
                alt="My-SRE Logo"
                width={160}
                height={50}
                fit="contain"
                style={{ alignSelf: "flex-start" }}
              />
            </Group>
          </Group>
          <Group gap="sm">
            <ActionIcon variant="light" color="blue" size="lg" radius="md" disabled>
              <IconMoon size={18} />
            </ActionIcon>
          </Group>
        </Flex>
      </Container>
    )
  }

  return (
    <Container fluid h="100%" px="xl">
      <Flex h="100%" justify="space-between" align="center">
        <Group gap="md">
          <Burger opened={sidebarOpened} onClick={onToggleSidebar} size="sm" />
          <Group gap="xs">
            {/* <ThemeIcon variant="gradient" gradient={{ from: "blue", to: "cyan", deg: 45 }} size="lg" radius="md">
              <IconNetwork size={20} />
            </ThemeIcon> */}
            <Box>
              {/* <Text fw={800} size="xl" variant="gradient" gradient={{ from: "blue", to: "cyan", deg: 45 }}>
                mySRE
              </Text>
              <Text size="xs" c="dimmed">
                Knowledge Visualization Platform
              </Text> */}
              <Image
                src='/images/logoSRE_Tulis.png'
                alt="My-SRE Logo"
                width={160}
                height={50}
                fit="contain"
                style={{ alignSelf: "flex-start" }}
              />
            </Box>
          </Group>
        </Group>

        <Group gap="sm">
          <Tooltip label={dark ? "Light mode" : "Dark mode"}>
            <ActionIcon
              variant="light"
              color={dark ? "yellow" : "blue"}
              onClick={toggleColorScheme}
              size="lg"
              radius="md"
            >
              {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
            </ActionIcon>
          </Tooltip>

          <Tooltip label="Settings">
            <ActionIcon variant="light" color="gray" size="lg">
              <IconSettings size={18} />
            </ActionIcon>
          </Tooltip>

          <Menu shadow="lg" width={220} position="bottom-end" offset={10}>
            <Menu.Target>
              <ActionIcon variant="light" size="lg" radius="xl">
                <Avatar
                  size="sm"
                  radius="xl"
                  variant="gradient"
                  gradient={{ from: "blue", to: "cyan", deg: 45 }}
                  style={{ cursor: "pointer" }}
                >
                  {isLoading ? "..." : userData?.name?.charAt(0).toUpperCase() || <IconUser size={16} />}
                </Avatar>
              </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Label>
                <Group gap="xs">
                  <Avatar size="xs" color="blue">
                    {userData?.name?.charAt(0).toUpperCase() || "U"}
                  </Avatar>
                  <Text size="sm">Signed in as</Text>
                </Group>
              </Menu.Label>

              <Menu.Item>
                <Text size="sm" fw={600}>
                  {isLoading ? "Loading..." : userData?.name || "Unknown User"}
                </Text>
                <Text size="xs" c="dimmed">
                  {isLoading ? "Loading..." : userData?.email || "No email"}
                </Text>
              </Menu.Item>

              <Menu.Divider />

              <Menu.Item leftSection={<IconLogout size={16} />} color="red" onClick={handleLogout} disabled={isLoading}>
                Sign out
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>
      </Flex>
    </Container>
  )
}
