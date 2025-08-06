"use client"

import { useEffect, useState } from "react"
import {
  Grid,
  Card,
  Text,
  Group,
  Avatar,
  Stack,
  Badge,
  ActionIcon,
  Title,
  SimpleGrid,
  Progress,
  RingProgress,
  Center,
  ThemeIcon,
  Box,
} from "@mantine/core"
import {
  IconUsers,
  IconTrendingUp,
  IconEye,
  IconArrowUpRight,
  IconSchool,
  IconFileText,
  IconCalendar,
  IconBrain,
  IconPencil,
  IconBulb,
} from "@tabler/icons-react"
import { usePageAnalytics } from "@/hooks/use-analytics"

// Define interfaces sesuai dengan Prisma schema
interface User {
  id: string
  name: string | null
  email: string
  role: "USER" | "ADMIN"
  group?: string | null
  nim?: string | null
  avatar_url?: string | null
  createdAt: Date
}

interface Article {
  id: string
  title: string
  userId: string | null
  createdAt: Date
  author?: User
}

interface DashboardStats {
  totalUsers: number
  totalAdmins: number
  totalStudents: number
  totalGroupA: number
  totalGroupB: number
  totalArticles: number
  adminArticles: number
  studentArticles: number
  recentUsers: User[]
  recentArticles: Article[]
  userGrowth: number
  totalBrainProjects: number
  totalDrafts: number
  avgProductivityScore: number
  highEngagementUsers: number
  activitiesLast24h: number
}

export default function DashboardPage() {
  // Auto-track page analytics
  usePageAnalytics("dashboard-home")

  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalStudents: 0,
    totalGroupA: 0,
    totalGroupB: 0,
    totalArticles: 0,
    adminArticles: 0,
    studentArticles: 0,
    recentUsers: [],
    recentArticles: [],
    userGrowth: 0,
    totalBrainProjects: 0,
    totalDrafts: 0,
    avgProductivityScore: 0,
    highEngagementUsers: 0,
    activitiesLast24h: 0,
  })

  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  // Fetch current user data
  const fetchCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      const data = await res.json()
      if (data && data.user) {
        setCurrentUser(data.user)
      }
    } catch (error) {
      console.error("Error fetching current user:", error)
    }
  }

  useEffect(() => {
    fetchCurrentUser()
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      // Fetch data via API routes instead of direct database calls
      const [usersRes, articlesRes, analyticsRes] = await Promise.all([
        fetch("/api/dashboard/users"),
        fetch("/api/dashboard/articles"),
        fetch("/api/analytics/summary"),
      ])

      const usersData = await usersRes.json()
      const articlesData = await articlesRes.json()
      const analyticsData = await analyticsRes.json()

      // Process the data
      const totalUsers = usersData.totalUsers || 0
      const totalAdmins = usersData.totalAdmins || 0
      const totalStudents = usersData.totalStudents || 0
      const totalGroupA = usersData.totalGroupA || 0
      const totalGroupB = usersData.totalGroupB || 0
      const recentUsers = usersData.recentUsers || []
      const userGrowth = usersData.userGrowth || 0

      const totalArticles = articlesData.totalArticles || 0
      const recentArticles = articlesData.recentArticles || []

      // Enhanced analytics
      let analyticsStats = {
        totalBrainProjects: 0,
        totalDrafts: 0,
        avgProductivityScore: 75,
        highEngagementUsers: 0,
        activitiesLast24h: 0,
      }

      try {
        if (analyticsData && analyticsData.length > 0) {
          const totalAnalytics = analyticsData.reduce(
            (acc: any, item: any) => {
              acc.totalBrainProjects += item.analytics.brainStats.totalProjects
              acc.totalDrafts += item.analytics.writerStats.totalDrafts
              acc.avgProductivityScore += item.analytics.overallStats.productivityScore
              if (item.analytics.overallStats.engagementLevel === "high") {
                acc.highEngagementUsers++
              }
              acc.activitiesLast24h += item.analytics.overallStats.recentActivity
              return acc
            },
            {
              totalBrainProjects: 0,
              totalDrafts: 0,
              avgProductivityScore: 0,
              highEngagementUsers: 0,
              activitiesLast24h: 0,
            },
          )

          if (analyticsData.length > 0) {
            totalAnalytics.avgProductivityScore = totalAnalytics.avgProductivityScore / analyticsData.length
          }

          analyticsStats = totalAnalytics
        }
      } catch (analyticsError) {
        console.log("Analytics not available, using mock data")
      }

      setStats({
        totalUsers,
        totalAdmins,
        totalStudents,
        totalGroupA,
        totalGroupB,
        totalArticles,
        adminArticles: 0,
        studentArticles: 0,
        recentUsers,
        recentArticles,
        userGrowth,
        ...analyticsStats,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Center h={200}>
        <Stack align="center">
          <Title order={3} c="gray.6">
            Loading Dashboard...
          </Title>
        </Stack>
      </Center>
    )
  }

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Dashboard MySRE</Title>
          <Text c="gray.6">Selamat datang, {currentUser?.name || "User"}! Berikut ringkasan platform MySRE Anda.</Text>
        </div>
        <Group>
          <Badge leftSection={<IconCalendar size={12} />} variant="light" color="blue">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </Badge>
        </Group>
      </Group>

      {/* Overview Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                Total Mahasiswa
              </Text>
              <Text fw={700} size="xl">
                {stats.totalStudents}
              </Text>
            </div>
            <ThemeIcon color="blue" variant="light" size="xl" radius="md">
              <IconUsers size={28} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt="md">
            <IconArrowUpRight size={16} style={{ display: "inline" }} />
            <span>Growth: {stats.userGrowth.toFixed(1)}%</span>
          </Text>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                Total Artikel
              </Text>
              <Text fw={700} size="xl">
                {stats.totalArticles}
              </Text>
            </div>
            <ThemeIcon color="green" variant="light" size="xl" radius="md">
              <IconFileText size={28} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt="md">
            <IconTrendingUp size={16} style={{ display: "inline" }} />
            <span>Aktif: {stats.recentArticles.length} artikel terbaru</span>
          </Text>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                Total Ide
              </Text>
              <Text fw={700} size="xl">
                {stats.totalBrainProjects}
              </Text>
            </div>
            <ThemeIcon color="violet" variant="light" size="xl" radius="md">
              <IconBrain size={28} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt="md">
            <IconBulb size={16} style={{ display: "inline" }} />
            <span>Ide brainstorming aktif</span>
          </Text>
        </Card>

        <Card withBorder shadow="sm" radius="md" p="lg">
          <Group justify="space-between">
            <div>
              <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                Total Drafts
              </Text>
              <Text fw={700} size="xl">
                {stats.totalDrafts}
              </Text>
            </div>
            <ThemeIcon color="orange" variant="light" size="xl" radius="md">
              <IconPencil size={28} />
            </ThemeIcon>
          </Group>
          <Text c="gray.6" size="xs" mt="md">
            <IconArrowUpRight size={16} style={{ display: "inline" }} />
            <span>Drafts dalam pengembangan</span>
          </Text>
        </Card>
      </SimpleGrid>

      {/* Enhanced Analytics Overview */}
      <Card
        withBorder
        shadow="sm"
        radius="md"
        p="xl"
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Group justify="space-between" align="flex-start">
          <div style={{ flex: 1 }}>
            <Title order={3} c="white" mb="md">
              Ikhtisar Analitik Pembelajaran
            </Title>
            <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg">
              <div>
                <Text size="sm" style={{ opacity: 0.9 }}>
                  Rata-rata Produktivitas
                </Text>
                <Text size="xl" fw={700}>
                  {stats.avgProductivityScore.toFixed(1)}%
                </Text>
              </div>
              <div>
                <Text size="sm" style={{ opacity: 0.9 }}>
                  Keterlibatan Tinggi
                </Text>
                <Text size="xl" fw={700}>
                  {stats.highEngagementUsers}
                </Text>
              </div>
              <div>
                <Text size="sm" style={{ opacity: 0.9 }}>
                  Draft per Siswa
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStudents > 0 ? (stats.totalDrafts / stats.totalStudents).toFixed(1) : "0"}
                </Text>
              </div>
              <div>
                <Text size="sm" style={{ opacity: 0.9 }}>
                  Tingkat Keterlibatan
                </Text>
                <Text size="xl" fw={700}>
                  {stats.totalStudents > 0 ? ((stats.highEngagementUsers / stats.totalStudents) * 100).toFixed(1) : "0"}
                  %
                </Text>
              </div>
            </SimpleGrid>
          </div>
          <RingProgress
            size={120}
            thickness={12}
            sections={[{ value: stats.avgProductivityScore, color: "white" }]}
            label={
              <Center>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700 }}>{stats.avgProductivityScore.toFixed(0)}%</div>
                  <div style={{ fontSize: "12px", opacity: 0.8 }}>Produktivitas</div>
                </div>
              </Center>
            }
          />
        </Group>
      </Card>

      {/* Enhanced Recent Activity dengan Analytics Context */}
      <Grid>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Pengguna Terbaru</Title>
              <Group>
                <Badge size="sm" variant="light" color="blue">
                  {stats.totalStudents} Students
                </Badge>
                <ActionIcon variant="subtle" color="gray">
                  <IconEye size={16} />
                </ActionIcon>
              </Group>
            </Group>
            <Stack gap="md">
              {stats.recentUsers.map((recentUser) => (
                <Group key={recentUser.id} justify="space-between">
                  <Group>
                    <Avatar src={recentUser.avatar_url} alt={recentUser.name || "User"} size="sm" color="blue">
                      {recentUser.name?.charAt(0) || "U"}
                    </Avatar>
                    <div>
                      <Text size="sm" fw={500}>
                        {recentUser.name}
                      </Text>
                      <Text size="xs" c="gray.6">
                        {recentUser.email}
                      </Text>
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge color={recentUser.role === "ADMIN" ? "red" : "blue"} variant="light" size="sm">
                      {recentUser.role === "ADMIN" ? "Admin" : "Student"}
                    </Badge>
                    {recentUser.group && (
                      <Badge color={recentUser.group === "A" ? "green" : "orange"} variant="outline" size="sm">
                        Group {recentUser.group}
                      </Badge>
                    )}
                  </Group>
                </Group>
              ))}
              {stats.recentUsers.length === 0 && (
                <Text c="gray.5" size="sm" ta="center" py="xl">
                  Belum ada pengguna baru dalam 7 hari terakhir
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 6 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between" mb="md">
              <Title order={4}>Artikel Terbaru</Title>
              <Badge size="sm" variant="light" color="green">
                {stats.totalArticles} Total
              </Badge>
            </Group>
            <Stack gap="md">
              {stats.recentArticles.map((article) => (
                <Group key={article.id} justify="space-between">
                  <div style={{ flex: 1 }}>
                    <Text size="sm" fw={500} lineClamp={1}>
                      {article.title}
                    </Text>
                    <Text size="xs" c="gray.6">
                      Oleh: {article.author?.name || "Unknown"} •{" "}
                      {new Date(article.createdAt).toLocaleDateString("id-ID")}
                    </Text>
                  </div>
                  <ActionIcon variant="subtle" color="gray" size="sm">
                    <IconEye size={14} />
                  </ActionIcon>
                </Group>
              ))}
              {stats.recentArticles.length === 0 && (
                <Text c="gray.5" size="sm" ta="center" py="xl">
                  Belum ada artikel yang dipublikasikan
                </Text>
              )}
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Group Distribution */}
      <Card withBorder shadow="sm" radius="md" p="lg">
        <Group justify="space-between" mb="lg">
          <Title order={4}>Distribusi Grup Mahasiswa</Title>
          <Group>
            <Badge leftSection={<IconSchool size={12} />} variant="light" color="blue">
              Total: {stats.totalStudents}
            </Badge>
          </Group>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Grup A
              </Text>
              <Text size="sm" c="gray.6">
                {stats.totalGroupA} mahasiswa
              </Text>
            </Group>
            <Progress
              value={stats.totalStudents > 0 ? (stats.totalGroupA / stats.totalStudents) * 100 : 0}
              color="green"
              size="lg"
              radius="xl"
            />
          </Box>
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={500}>
                Grup B
              </Text>
              <Text size="sm" c="gray.6">
                {stats.totalGroupB} mahasiswa
              </Text>
            </Group>
            <Progress
              value={stats.totalStudents > 0 ? (stats.totalGroupB / stats.totalStudents) * 100 : 0}
              color="orange"
              size="lg"
              radius="xl"
            />
          </Box>
        </SimpleGrid>
      </Card>
    </Stack>
  )
}
