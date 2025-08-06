"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import {
  AppShell,
  Group,
  Text,
  UnstyledButton,
  Burger,
  Image,
  Stack,
  Avatar,
  Menu,
  ActionIcon,
  Tooltip,
  Badge,
  Divider,
  Box,
} from "@mantine/core"
import {
  IconDashboard,
  IconUsers,
  IconFileText,
  IconPencil,
  IconBulb,
  IconReportAnalytics,
  IconReceipt,
  IconCoin,
  IconChevronRight,
  IconBell,
  IconLogout,
  IconSettings,
  IconUser,
  IconCurrencyDollar,
  IconClipboardList,
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"

interface User {
  id: string
  email: string
  name: string
  role: "USER" | "ADMIN"
  token_balance?: number
  avatar_url?: string
}

interface DashboardLayoutProps {
  children: React.ReactNode
  user: User
}

interface NavLinkProps {
  icon: React.ReactNode
  label: string
  href: string
  active?: boolean
  onClick?: () => void
  badge?: string | number
  badgeColor?: string
}

function NavLink({ icon, label, href, active, onClick, badge, badgeColor = "blue" }: NavLinkProps) {
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        padding: "12px 16px",
        borderRadius: "8px",
        textDecoration: "none",
        backgroundColor: active ? "var(--mantine-color-blue-0)" : "transparent",
        color: active ? "var(--mantine-color-blue-7)" : "var(--mantine-color-gray-7)",
        "&:hover": {
          backgroundColor: active ? "var(--mantine-color-blue-0)" : "var(--mantine-color-gray-0)",
        },
      }}
    >
      <Group gap="sm" style={{ flex: 1 }}>
        {icon}
        <Text size="sm" fw={active ? 600 : 400}>
          {label}
        </Text>
        {badge && (
          <Badge size="xs" color={badgeColor} variant="filled" ml="auto">
            {badge}
          </Badge>
        )}
      </Group>
      <IconChevronRight size={16} opacity={0.6} />
    </UnstyledButton>
  )
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const [opened, { toggle, close }] = useDisclosure()
  const pathname = usePathname()
  const router = useRouter()

  // Check if user is admin
  const isAdmin = () => user?.role === "ADMIN"

  // Navigation links - different for admin vs user
  const getNavLinks = () => {
    if (isAdmin()) {
      // Admin navigation (existing)
      return [
        {
          icon: <IconDashboard size={20} />,
          label: "Dashboard",
          href: "/dashboard",
        },
        {
          icon: <IconUsers size={20} />,
          label: "Pengguna",
          href: "/dashboard/users",
        },
        {
          icon: <IconFileText size={20} />,
          label: "List Artikel",
          href: "/dashboard/articles",
        },
        {
          icon: <IconClipboardList size={20} />,
          label: "Assignment",
          href: "/dashboard/assignments",
          badge: "NEW",
          badgeColor: "red",
        },
        {
          icon: <IconPencil size={20} />,
          label: "Project Writer",
          href: "/dashboard/project-writer",
        },
        {
          icon: <IconBulb size={20} />,
          label: "Project Brainstorm",
          href: "/dashboard/project-brainstorm",
        },
        {
          icon: <IconReportAnalytics size={20} />,
          label: "Learning Analytics",
          href: "/dashboard/analytics",
        },
        {
          icon: <IconReceipt size={20} />,
          label: "Billing & Tokens",
          href: "/dashboard/billing",
          badge: "NEW",
          badgeColor: "green",
        },
      ]
    } else {
      // User/Student navigation
      return [
        {
          icon: <IconDashboard size={20} />,
          label: "Dashboard",
          href: "/dashboard",
        },
        {
          icon: <IconClipboardList size={20} />,
          label: "Tugas Saya",
          href: "/dashboard/assignments",
          badge: "BARU",
          badgeColor: "blue",
        },
        {
          icon: <IconReportAnalytics size={20} />,
          label: "Analitik Saya",
          href: "/dashboard/analytics",
        },
      ]
    }
  }

  const navLinks = getNavLinks()

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/signout", {
        method: "POST",
      })
      if (res.ok) {
        console.log("Berhasil logout")
        // router.push("/signin")
        const loginUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://main.lvh.me:3000"}/signin`
        window.location.href = loginUrl
      } else {
        console.error("Tidak berhasil logout")
      }
      // const response = await fetch("/api/auth/signout", {
      //   method: "POST",
      //   headers: {
      //     accept: "application/json",
      //     "Content-Type": "application/json",
      //   },
      // })

      // if (response.ok) {
      //   // Clear user data lokal
      //   // setUserData(null)

      //   // Redirect ke main app signin
      //   const loginUrl = `${process.env.NEXT_PUBLIC_MAIN_APP_URL || "http://main.lvh.me:3000"}/signin`
      //   window.location.href = loginUrl
      // } else {
      //   console.error("Logout API failed")
      // }
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleNavClick = (href: string) => {
    router.push(href)
    close()
  }

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group gap="sm" style={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/images/logoSRE_Profile.png"
                alt="MySRE Logo"
                height={45}
                width="auto"
                fit="contain"
                fallbackSrc="/logo-mysre-fallback.png"
              />
            </Group>
          </Group>
          <Group>
            {/* Token Balance Indicator (untuk user) */}
            {!isAdmin() && user && (
              <Tooltip label="Token Balance">
                <ActionIcon variant="light" size="lg" color="green">
                  <Group gap="xs">
                    <IconCoin size={16} />
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>
                      {user.token_balance?.toLocaleString() || "0"}
                    </span>
                  </Group>
                </ActionIcon>
              </Tooltip>
            )}
            {/* Revenue Indicator (untuk admin) */}
            {isAdmin() && (
              <Tooltip label="Monthly Revenue">
                <ActionIcon variant="light" size="lg" color="green">
                  <Group gap="xs">
                    <IconCurrencyDollar size={16} />
                    <span style={{ fontSize: "12px", fontWeight: 600 }}>$2.4K</span>
                  </Group>
                </ActionIcon>
              </Tooltip>
            )}
            <Tooltip label="Notifikasi">
              <ActionIcon variant="light" size="lg">
                <IconBell size={20} />
              </ActionIcon>
            </Tooltip>
            <Menu shadow="md" width={200}>
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="sm">
                    <Avatar src={user?.avatar_url} alt={user?.name} size="sm" color="blue">
                      {user?.name?.charAt(0)}
                    </Avatar>
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {user?.name}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {user?.role === "ADMIN" ? "Administrator" : "Mahasiswa"}
                      </Text>
                    </Stack>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Akun</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />} onClick={() => router.push("/dashboard/profile")}>
                  Profil Saya
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />} onClick={() => router.push("/dashboard/settings")}>
                  Pengaturan
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={14} />} onClick={handleLogout}>
                  Keluar
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <Stack gap="xs">
          <Text size="xs" fw={700} c="gray.6" tt="uppercase" mb="sm">
            {isAdmin() ? "Menu Admin" : "Menu Siswa"}
          </Text>
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              icon={link.icon}
              label={link.label}
              href={link.href}
              active={pathname === link.href}
              onClick={() => handleNavClick(link.href)}
              badge={link.badge}
              badgeColor={link.badgeColor}
            />
          ))}
          <Divider my="md" />
          <Text size="xs" fw={700} c="gray.6" tt="uppercase" mb="sm">
            Info Sistem
          </Text>
          <Box p="sm" bg="gray.0" style={{ borderRadius: "8px" }}>
            <Text size="xs" c="gray.6" mb="xs">
              Role: {user?.role === "ADMIN" ? "Administrator" : "Siswa"}
            </Text>
            <Group gap="xs">
              <Box w={8} h={8} bg="green" style={{ borderRadius: "50%" }} />
              <Text size="xs" fw={500}>
                Online
              </Text>
            </Group>
          </Box>
        </Stack>
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  )
}
