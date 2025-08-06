"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import {
  Stack,
  Title,
  Text,
  Card,
  Group,
  Button,
  Badge,
  Grid,
  SimpleGrid,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Select,
  Avatar,
  Center,
  Loader,
  Tabs,
  Divider,
  Box,
  Progress,
  PasswordInput,
  Switch,
  NumberInput,
  RingProgress,
  Anchor,
} from "@mantine/core"
import {
  IconUser,
  IconEdit,
  IconCamera,
  IconCheck,
  IconAlertCircle,
  IconSettings,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconSchool,
  IconFileText,
  IconBook,
  IconShield,
  IconUserCheck,
  IconDeviceFloppy,
  IconBrandLinkedin,
  IconBrandGithub,
  IconWorld,
  IconId,
} from "@tabler/icons-react"
import { useDisclosure } from "@mantine/hooks"
import { notifications } from "@mantine/notifications"
import { usePageAnalytics, useFeatureAnalytics } from "@/hooks/use-analytics"

// Types sesuai dengan Prisma schema
interface UserProfile {
  id: string
  name: string | null
  email: string
  phone?: string | null
  avatar_url?: string | null
  bio?: string | null
  role: "ADMIN" | "USER"
  group?: string | null
  nim?: string | null
  university?: string | null
  faculty?: string | null
  major?: string | null
  semester?: number | null
  address?: string | null
  birthDate?: string | null
  linkedin?: string | null
  github?: string | null
  website?: string | null
  createdAt: string
  lastActive?: string | null
  isEmailVerified?: boolean | null
  isPhoneVerified?: boolean | null
  token_balance?: number | null
  settings?: {
    emailNotifications?: boolean
    pushNotifications?: boolean
    darkMode?: boolean
    language?: string
    timezone?: string
    privacy?: {
      showEmail?: boolean
      showPhone?: boolean
      showProfile?: boolean
    }
  } | null
}

interface UserStats {
  totalProjects: number
  completedProjects: number
  totalArticles: number
  totalIdeas: number
  totalDrafts: number
  totalAnnotations: number
  joinDays: number
  averageProgress: number
  recentActivities: Activity[]
  analyticsData: {
    totalBrainProjects: number
    totalWritingSessions: number
    productivityScore: number
    engagementLevel: "low" | "medium" | "high"
  }
}

interface Activity {
  id: string
  type: "project_created" | "article_published" | "idea_shared" | "project_completed"
  title: string
  description: string
  date: string
  icon: React.ReactNode
  color: string
}

export default function ProfilePage() {
  // Analytics tracking
  usePageAnalytics("profile-page")
  const { trackFeature } = useFeatureAnalytics()

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [passwordOpened, { open: openPassword, close: closePassword }] = useDisclosure(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
    university: "",
    faculty: "",
    major: "",
    semester: 1,
    address: "",
    birthDate: "",
    linkedin: "",
    github: "",
    website: "",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [settingsForm, setSettingsForm] = useState({
    emailNotifications: true,
    pushNotifications: true,
    darkMode: false,
    language: "id",
    timezone: "Asia/Jakarta",
    privacy: {
      showEmail: false,
      showPhone: false,
      showProfile: true,
    },
  })

  // Load profile first
  useEffect(() => {
    loadProfile()
  }, [])

  // Load stats after profile is loaded
  useEffect(() => {
    if (profile?.id) {
      loadStats()
    }
  }, [profile?.id])

  const loadProfile = async () => {
    setLoading(true)
    try {
      // Fetch current user data dengan timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

      const res = await fetch("/api/auth/signin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()

      if (!data || !data.user) {
        throw new Error("User not authenticated")
      }

      const userData = data.user
      setProfile(userData)

      // Populate form with existing data
      setProfileForm({
        name: userData.name || "",
        email: userData.email || "",
        phone: userData.phone || "",
        bio: userData.bio || "",
        university: userData.university || "",
        faculty: userData.faculty || "",
        major: userData.major || "",
        semester: userData.semester || 1,
        address: userData.address || "",
        birthDate: userData.birthDate || "",
        linkedin: userData.linkedin || "",
        github: userData.github || "",
        website: userData.website || "",
      })

      // Set settings form with proper defaults
      const userSettings = userData.settings || {}
      setSettingsForm({
        emailNotifications: userSettings.emailNotifications ?? true,
        pushNotifications: userSettings.pushNotifications ?? true,
        darkMode: userSettings.darkMode ?? false,
        language: userSettings.language ?? "id",
        timezone: userSettings.timezone ?? "Asia/Jakarta",
        privacy: {
          showEmail: userSettings.privacy?.showEmail ?? false,
          showPhone: userSettings.privacy?.showPhone ?? false,
          showProfile: userSettings.privacy?.showProfile ?? true,
        },
      })
    } catch (error: any) {
      console.error("Error loading profile:", error)
      let errorMessage = "Gagal memuat profil"

      if (error.name === "AbortError") {
        errorMessage = "Request timeout. Silakan coba lagi."
      } else if (error.message?.includes("not authenticated")) {
        errorMessage = "Sesi Anda telah berakhir. Silakan login kembali."
        // Redirect to login if needed
        window.location.href = "/auth/signin"
        return
      }

      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    if (!profile?.id) {
      console.log("No profile ID available for loading stats")
      return
    }

    try {
      // Set default stats first to prevent loading issues
      const joinDate = new Date(profile.createdAt)
      const now = new Date()
      const joinDays = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

      const defaultStats: UserStats = {
        totalProjects: 0,
        completedProjects: 0,
        totalArticles: 0,
        totalIdeas: 0,
        totalDrafts: 0,
        totalAnnotations: 0,
        joinDays,
        averageProgress: 0,
        recentActivities: [
          {
            id: "1",
            type: "article_published",
            title: "Artikel Baru Dipublikasi",
            description: "Machine Learning in Healthcare",
            date: new Date().toISOString(),
            icon: <IconFileText size={16} />,
            color: "blue",
          },
        ],
        analyticsData: {
          totalBrainProjects: 0,
          totalWritingSessions: 0,
          productivityScore: 75,
          engagementLevel: "medium",
        },
      }

      setStats(defaultStats)

      // Try to fetch real data with timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      try {
        const [analyticsRes, articlesRes] = await Promise.all([
          fetch(`/api/analytics/user/${profile.id}`, { signal: controller.signal }),
          fetch(`/api/dashboard/user-articles/${profile.id}`, { signal: controller.signal }),
        ])

        clearTimeout(timeoutId)

        const analyticsData = analyticsRes.ok ? await analyticsRes.json() : {}
        const articlesData = articlesRes.ok ? await articlesRes.json() : { totalArticles: 0 }

        const calculatedStats: UserStats = {
          totalProjects: analyticsData.brainStats?.totalProjects || 0,
          completedProjects: Math.floor((analyticsData.brainStats?.totalProjects || 0) * 0.7),
          totalArticles: articlesData.totalArticles || 0,
          totalIdeas: analyticsData.brainStats?.totalNodes || 0,
          totalDrafts: analyticsData.writerStats?.totalDrafts || 0,
          totalAnnotations: analyticsData.writerStats?.totalAnnotations || 0,
          joinDays,
          averageProgress: analyticsData.overallStats?.productivityScore || 75,
          recentActivities: defaultStats.recentActivities,
          analyticsData: {
            totalBrainProjects: analyticsData.brainStats?.totalProjects || 0,
            totalWritingSessions: analyticsData.writerStats?.totalWritingSessions || 0,
            productivityScore: analyticsData.overallStats?.productivityScore || 75,
            engagementLevel: analyticsData.overallStats?.engagementLevel || "medium",
          },
        }

        setStats(calculatedStats)
      } catch (fetchError: any) {
        console.log("Using default stats due to fetch error:", fetchError.message)
        // Keep default stats if fetch fails
      }
    } catch (error) {
      console.error("Error in loadStats:", error)
      // Stats already set to default above
    }
  }

  const handlePasswordChange = async () => {
    // Validasi konfirmasi password
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifications.show({
        title: "Error",
        message: "Password baru dan konfirmasi password tidak sama",
        color: "red",
      })
      return
    }

    // Validasi panjang password
    if (passwordForm.newPassword.length < 6) {
      notifications.show({
        title: "Error",
        message: "Password minimal 6 karakter",
        color: "red",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal mengubah password")
      }

      // Reset form
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      closePassword()

      // Track feature usage
      trackFeature("password_change")

      notifications.show({
        title: "Berhasil",
        message: "Password berhasil diubah",
        color: "green",
      })
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Gagal mengubah password",
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!profile?.id) return

    setSaving(true)
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          ...profileForm,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memperbarui profil")
      }

      // Update profile state dengan data terbaru dari response
      if (data.user) {
        setProfile(data.user)

        // Update form dengan data terbaru juga
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          bio: data.user.bio || "",
          university: data.user.university || "",
          faculty: data.user.faculty || "",
          major: data.user.major || "",
          semester: data.user.semester || 1,
          address: data.user.address || "",
          birthDate: data.user.birthDate || "",
          linkedin: data.user.linkedin || "",
          github: data.user.github || "",
          website: data.user.website || "",
        })
      }

      setEditMode(false)

      // Track feature usage
      trackFeature("profile_update", { fields: Object.keys(profileForm) })

      notifications.show({
        title: "Berhasil",
        message: "Profil berhasil diperbarui",
        color: "green",
      })
    } catch (error: any) {
      let errorMessage = "Gagal memperbarui profil"
      if (error.message?.includes("birthDate")) {
        errorMessage = "Format tanggal lahir tidak valid. Gunakan format YYYY-MM-DD atau kosongkan field."
      } else if (error.message?.includes("email")) {
        errorMessage = "Format email tidak valid"
      }

      notifications.show({
        title: "Error",
        message: errorMessage,
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }

  const saveSettings = async () => {
    if (!profile?.id) return

    setSaving(true)
    try {
      const res = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: profile.id,
          settings: settingsForm,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan")
      }

      // Update profile state dengan settings terbaru
      if (data.user) {
        setProfile((prev) => (prev ? { ...prev, settings: data.user.settings } : null))
      }

      // Track feature usage
      trackFeature("settings_update", { settings: Object.keys(settingsForm) })

      notifications.show({
        title: "Berhasil",
        message: "Pengaturan berhasil disimpan",
        color: "green",
      })
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Gagal menyimpan pengaturan",
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (file: File | null) => {
    if (!file || !profile?.id) return

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      notifications.show({
        title: "Error",
        message: "File harus berupa gambar (JPG, PNG, GIF)",
        color: "red",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notifications.show({
        title: "Error",
        message: "Ukuran file maksimal 5MB",
        color: "red",
      })
      return
    }

    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("avatar", file)
      formData.append("userId", profile.id)

      const res = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal upload foto profil")
      }

      // Update profile state dengan avatar URL terbaru
      if (data.user) {
        setProfile(data.user)
      }

      // Track feature usage
      trackFeature("avatar_upload")

      notifications.show({
        title: "Berhasil",
        message: "Foto profil berhasil diperbarui",
        color: "green",
      })
    } catch (error: any) {
      console.error("Avatar upload error:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Gagal upload foto profil",
        color: "red",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleVerifyEmail = async () => {
    if (!profile?.id) return

    try {
      const res = await fetch("/api/user/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: profile.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memverifikasi email")
      }

      // Update profile state dengan status verifikasi terbaru
      if (data.user) {
        setProfile(data.user)
      }

      // Track feature usage
      trackFeature("email_verification")

      notifications.show({
        title: "Email Terverifikasi",
        message: "Email Anda berhasil diverifikasi",
        color: "green",
      })
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Gagal memverifikasi email",
        color: "red",
      })
    }
  }

  const handleVerifyPhone = async () => {
    if (!profile?.id) return

    try {
      const res = await fetch("/api/user/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: profile.id }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Gagal memverifikasi nomor telepon")
      }

      // Update profile state dengan status verifikasi terbaru
      if (data.user) {
        setProfile(data.user)
      }

      // Track feature usage
      trackFeature("phone_verification")

      notifications.show({
        title: "Telepon Terverifikasi",
        message: "Nomor telepon Anda berhasil diverifikasi",
        color: "green",
      })
    } catch (error: any) {
      notifications.show({
        title: "Error",
        message: error.message || "Gagal memverifikasi nomor telepon",
        color: "red",
      })
    }
  }

  // Show loading only when profile is not loaded
  if (loading || !profile) {
    return (
      <Center h={400}>
        <Stack align="center">
          <Loader size="lg" />
          <Text c="gray.6">Memuat profil...</Text>
        </Stack>
      </Center>
    )
  }

  // Calculate profile completion percentage
  const calculateProfileCompletion = () => {
    if (!profile) {
      return {
        percentage: 0,
        filled: 0,
        total: 13,
        missing: [
          "name",
          "email",
          "phone",
          "bio",
          "university",
          "faculty",
          "major",
          "semester",
          "address",
          "birthDate",
          "linkedin",
          "github",
          "website",
        ],
      }
    }

    const requiredFields = [
      "name",
      "email",
      "phone",
      "bio",
      "university",
      "faculty",
      "major",
      "semester",
      "address",
      "birthDate",
      "linkedin",
      "github",
      "website",
    ]

    const filledFields = requiredFields.filter((field) => {
      const value = profile[field as keyof UserProfile]
      return value !== null && value !== undefined && value !== "" && value !== 0
    })

    const missingFields = requiredFields.filter((field) => {
      const value = profile[field as keyof UserProfile]
      return value === null || value === undefined || value === "" || value === 0
    })

    const percentage = Math.round((filledFields.length / requiredFields.length) * 100)

    return {
      percentage,
      filled: filledFields.length,
      total: requiredFields.length,
      missing: missingFields,
    }
  }

  const profileCompletion = calculateProfileCompletion()

  return (
    <Stack gap="xl">
      <Group justify="space-between">
        <div>
          <Title order={2}>Profil Saya</Title>
          <Text c="gray.6">Kelola informasi profil dan pengaturan akun Anda</Text>
        </div>
        <Button
          leftSection={editMode ? <IconDeviceFloppy size={16} /> : <IconEdit size={16} />}
          onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
          loading={saving}
        >
          {editMode ? "Simpan Perubahan" : "Edit Profil"}
        </Button>
      </Group>

      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "overview")}>
        <Tabs.List>
          <Tabs.Tab value="overview" leftSection={<IconUser size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="personal" leftSection={<IconEdit size={16} />}>
            Personal
          </Tabs.Tab>
          <Tabs.Tab value="academic" leftSection={<IconSchool size={16} />}>
            Akademik
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
            Pengaturan
          </Tabs.Tab>
          <Tabs.Tab value="security" leftSection={<IconShield size={16} />}>
            Keamanan
          </Tabs.Tab>
        </Tabs.List>

        {/* Overview Tab */}
        <Tabs.Panel value="overview" pt="lg">
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Card withBorder shadow="sm" radius="md" p="lg" style={{ height: "fit-content" }}>
                <Stack gap="md" align="center">
                  <div style={{ position: "relative", display: "inline-block" }}>
                    <Avatar src={profile.avatar_url} alt={profile.name || "User"} size={120} color="blue">
                      {profile.name?.charAt(0) || "U"}
                    </Avatar>
                    <ActionIcon
                      size="sm"
                      style={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "var(--mantine-color-blue-6)",
                        color: "white",
                      }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <IconCamera size={14} />
                    </ActionIcon>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleAvatarUpload(file)
                      }}
                    />
                  </div>

                  <div style={{ textAlign: "center" }}>
                    <Text fw={600} size="lg">
                      {profile.name || "User"}
                    </Text>
                    <Text size="sm" c="gray.6">
                      {profile.email}
                    </Text>
                    <Group justify="center" gap="xs" mt="xs">
                      <Badge
                        color={profile.role === "ADMIN" ? "red" : "blue"}
                        variant="light"
                        leftSection={<IconUserCheck size={12} />}
                      >
                        {profile.role === "ADMIN" ? "Administrator" : "Mahasiswa"}
                      </Badge>
                      {profile.group && (
                        <Badge color={profile.group === "A" ? "green" : "orange"} variant="light">
                          Group {profile.group}
                        </Badge>
                      )}
                    </Group>
                  </div>

                  {profile.bio && (
                    <Text size="sm" ta="center" c="gray.7">
                      {profile.bio}
                    </Text>
                  )}

                  <Group justify="center" gap="xs" mt="md">
                    {profile.linkedin && (
                      <Anchor href={profile.linkedin} target="_blank">
                        <ActionIcon variant="light" color="blue" size="lg">
                          <IconBrandLinkedin size={20} />
                        </ActionIcon>
                      </Anchor>
                    )}
                    {profile.github && (
                      <Anchor href={profile.github} target="_blank">
                        <ActionIcon variant="light" color="dark" size="lg">
                          <IconBrandGithub size={20} />
                        </ActionIcon>
                      </Anchor>
                    )}
                    {profile.website && (
                      <Anchor href={profile.website} target="_blank">
                        <ActionIcon variant="light" color="teal" size="lg">
                          <IconWorld size={20} />
                        </ActionIcon>
                      </Anchor>
                    )}
                  </Group>
                </Stack>

                <Divider my="lg" />
                <Stack gap="md">
                  <Text fw={600} size="md">
                    Informasi Profil
                  </Text>
                  {profile.university && (
                    <div>
                      <Text fw={600} size="sm" c="blue">
                        {profile.university}
                      </Text>
                      <Text size="sm" c="gray.6">
                        {profile.faculty} - {profile.major}
                      </Text>
                    </div>
                  )}
                  {profile.phone && (
                    <Group gap="xs">
                      <IconPhone size={16} style={{ color: "var(--mantine-color-gray-6)" }} />
                      <Text size="sm">{profile.phone}</Text>
                    </Group>
                  )}
                  {profile.address && (
                    <Group gap="xs">
                      <IconMapPin size={16} style={{ color: "var(--mantine-color-gray-6)" }} />
                      <Text size="sm">{profile.address}</Text>
                    </Group>
                  )}
                  {profile.birthDate && (
                    <Group gap="xs">
                      <IconCalendar size={16} style={{ color: "var(--mantine-color-gray-6)" }} />
                      <Text size="sm">
                        {new Date(profile.birthDate).toLocaleDateString("id-ID", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </Text>
                    </Group>
                  )}
                </Stack>
              </Card>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="md">
                {/* Profile Completion */}
                <Card withBorder shadow="sm" radius="md" p="lg">
                  <Group justify="space-between" mb="md">
                    <Text fw={600} size="md">
                      Kelengkapan Profil
                    </Text>
                    <Badge color={profileCompletion.percentage === 100 ? "green" : "orange"} variant="light">
                      {profileCompletion.percentage}%
                    </Badge>
                  </Group>
                  <Progress
                    value={profileCompletion.percentage}
                    color={profileCompletion.percentage === 100 ? "green" : "orange"}
                    size="lg"
                    radius="xl"
                    mb="sm"
                  />
                  <Text size="sm" c="gray.6">
                    {profileCompletion.filled} dari {profileCompletion.total} field terisi
                  </Text>

                  {profileCompletion.percentage < 100 && (
                    <Box
                      mt="md"
                      p="md"
                      bg="orange.0"
                      style={{ borderRadius: "8px", border: "1px solid var(--mantine-color-orange-2)" }}
                    >
                      <Group gap="xs" mb="xs">
                        <IconAlertCircle size={16} color="var(--mantine-color-orange-6)" />
                        <Text size="sm" fw={500} c="orange.7">
                          Field yang belum lengkap:
                        </Text>
                      </Group>
                      <Text size="sm" c="gray.7" mb="md">
                        {profileCompletion.missing
                          .map((field: string) => {
                            const fieldLabels: Record<string, string> = {
                              name: "Nama",
                              email: "Email",
                              phone: "Telepon",
                              bio: "Bio",
                              university: "Universitas",
                              faculty: "Fakultas",
                              major: "Jurusan",
                              semester: "Semester",
                              address: "Alamat",
                              birthDate: "Tanggal Lahir",
                              linkedin: "LinkedIn",
                              github: "GitHub",
                              website: "Website",
                            }
                            return fieldLabels[field] || field
                          })
                          .join(", ")}
                      </Text>
                      <Group gap="sm">
                        <Button
                          size="sm"
                          variant="light"
                          color="orange"
                          leftSection={<IconEdit size={14} />}
                          onClick={() => {
                            setEditMode(true)
                            // Smart redirect ke tab yang tepat
                            const academicFields = ["university", "faculty", "major", "semester"]
                            const personalFields = ["name", "email", "phone", "bio", "address", "birthDate"]
                            const hasAcademicMissing = profileCompletion.missing.some((field: string) =>
                              academicFields.includes(field),
                            )
                            const hasPersonalMissing = profileCompletion.missing.some((field: string) =>
                              personalFields.includes(field),
                            )

                            if (hasAcademicMissing && profile?.role === "USER") {
                              setActiveTab("academic")
                            } else if (hasPersonalMissing) {
                              setActiveTab("personal")
                            } else {
                              setActiveTab("personal")
                            }

                            // Track feature usage
                            trackFeature("profile_completion_prompt", {
                              missingFields: profileCompletion.missing,
                            })

                            setTimeout(() => {
                              window.scrollTo({ top: 300, behavior: "smooth" })
                            }, 100)
                          }}
                        >
                          Lengkapi Sekarang
                        </Button>
                      </Group>
                    </Box>
                  )}

                  {profileCompletion.percentage === 100 && (
                    <Box
                      mt="md"
                      p="md"
                      bg="green.0"
                      style={{ borderRadius: "8px", border: "1px solid var(--mantine-color-green-2)" }}
                    >
                      <Group gap="xs">
                        <IconCheck size={16} color="var(--mantine-color-green-6)" />
                        <Text size="sm" fw={500} c="green.7">
                          Profil Anda sudah lengkap!
                        </Text>
                      </Group>
                      <Text size="sm" c="gray.7" mt="xs">
                        Terima kasih telah melengkapi profil. Ini membantu meningkatkan pengalaman Anda di MySRE.
                      </Text>
                    </Box>
                  )}
                </Card>

                {/* Enhanced Statistics Card with Analytics Integration */}
                {stats && (
                  <Card withBorder shadow="sm" radius="md" p="lg">
                    <Text fw={600} size="md" mb="md">
                      Statistik Aktivitas & Analytics
                    </Text>
                    <Grid>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text fw={500}>Brain Projects</Text>
                            <Badge color="blue">{stats.analyticsData.totalBrainProjects}</Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text fw={500}>Writing Sessions</Text>
                            <Badge color="green">{stats.analyticsData.totalWritingSessions}</Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text fw={500}>Total Drafts</Text>
                            <Badge color="violet">{stats.totalDrafts}</Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text fw={500}>Total Annotations</Text>
                            <Badge color="orange">{stats.totalAnnotations}</Badge>
                          </Group>
                        </Stack>
                      </Grid.Col>
                      <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="sm">
                          <Group justify="space-between">
                            <Text fw={500}>Bergabung</Text>
                            <Badge color="gray">{stats.joinDays} hari</Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text fw={500}>Productivity Score</Text>
                            <Badge color="blue">{stats.analyticsData.productivityScore}%</Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text fw={500}>Engagement Level</Text>
                            <Badge
                              color={
                                stats.analyticsData.engagementLevel === "high"
                                  ? "green"
                                  : stats.analyticsData.engagementLevel === "medium"
                                    ? "yellow"
                                    : "red"
                              }
                            >
                              {stats.analyticsData.engagementLevel.toUpperCase()}
                            </Badge>
                          </Group>
                          <Group justify="space-between">
                            <Text fw={500}>Token Balance</Text>
                            <Badge color="green">{profile.token_balance?.toLocaleString() || "0"}</Badge>
                          </Group>
                        </Stack>
                      </Grid.Col>
                    </Grid>

                    {/* Productivity Ring Progress */}
                    <Divider my="md" />
                    <Group justify="center">
                      <RingProgress
                        size={120}
                        thickness={12}
                        sections={[{ value: stats.analyticsData.productivityScore, color: "blue" }]}
                        label={
                          <Center>
                            <div style={{ textAlign: "center" }}>
                              <div style={{ fontSize: "18px", fontWeight: 700 }}>
                                {stats.analyticsData.productivityScore}%
                              </div>
                              <div style={{ fontSize: "12px", opacity: 0.8 }}>Productivity</div>
                            </div>
                          </Center>
                        }
                      />
                    </Group>
                  </Card>
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>

        {/* Personal Information Tab */}
        <Tabs.Panel value="personal" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Informasi Personal
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="Nama Lengkap"
                  name="name"
                  value={editMode ? profileForm.name : profile.name || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconUser size={16} />}
                  placeholder="Masukkan nama lengkap"
                  required
                />
                <TextInput
                  label="Email"
                  name="email"
                  value={editMode ? profileForm.email : profile.email || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconMail size={16} />}
                  placeholder="Masukkan email"
                  required
                />
                <Group>
                  <TextInput
                    label="Nomor Telepon"
                    name="phone"
                    value={editMode ? profileForm.phone : profile.phone || ""}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, phone: e.target.value }))}
                    disabled={!editMode}
                    leftSection={<IconPhone size={16} />}
                    placeholder="Contoh: +62812345678"
                  />
                  {profile.phone && !profile.isPhoneVerified && (
                    <Button size="xs" variant="light" onClick={handleVerifyPhone} mt={24} loading={saving}>
                      Verifikasi
                    </Button>
                  )}
                </Group>
                <TextInput
                  label="Tanggal Lahir"
                  name="birthDate"
                  type="date"
                  value={editMode ? profileForm.birthDate : profile.birthDate || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, birthDate: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconCalendar size={16} />}
                  placeholder="YYYY-MM-DD"
                />
              </SimpleGrid>

              <Textarea
                label="Bio"
                placeholder="Ceritakan tentang diri Anda..."
                value={editMode ? profileForm.bio : profile.bio || ""}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                disabled={!editMode}
                minRows={3}
              />

              <TextInput
                label="Alamat"
                value={editMode ? profileForm.address : profile.address || ""}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, address: e.target.value }))}
                disabled={!editMode}
                leftSection={<IconMapPin size={16} />}
                placeholder="Alamat lengkap"
              />

              <Text fw={600} size="md" mt="lg">
                Social Media & Website
              </Text>
              <SimpleGrid cols={{ base: 1, md: 3 }} spacing="md">
                <TextInput
                  label="LinkedIn"
                  placeholder="https://linkedin.com/in/username"
                  value={editMode ? profileForm.linkedin : profile.linkedin || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, linkedin: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconBrandLinkedin size={16} />}
                />
                <TextInput
                  label="GitHub"
                  placeholder="https://github.com/username"
                  value={editMode ? profileForm.github : profile.github || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, github: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconBrandGithub size={16} />}
                />
                <TextInput
                  label="Website"
                  placeholder="https://yourwebsite.com"
                  value={editMode ? profileForm.website : profile.website || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, website: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconWorld size={16} />}
                />
              </SimpleGrid>

              {editMode && (
                <Group justify="flex-end" mt="lg">
                  <Button variant="light" onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSaveProfile} loading={saving}>
                    Simpan Perubahan
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Academic Information Tab */}
        <Tabs.Panel value="academic" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="md">
              <Text fw={600} size="lg">
                Informasi Akademik
              </Text>
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                <TextInput
                  label="NIM"
                  value={profile.nim || ""}
                  disabled
                  leftSection={<IconId size={16} />}
                  placeholder="Nomor Induk Mahasiswa"
                />
                <TextInput
                  label="Universitas"
                  name="university"
                  value={editMode ? profileForm.university : profile.university || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, university: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconSchool size={16} />}
                  placeholder="Masukkan nama universitas"
                  required={profile?.role === "USER"}
                />
                <TextInput
                  label="Fakultas"
                  name="faculty"
                  value={editMode ? profileForm.faculty : profile.faculty || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, faculty: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconSchool size={16} />}
                  placeholder="Masukkan nama fakultas"
                  required={profile?.role === "USER"}
                />
                <TextInput
                  label="Jurusan"
                  name="major"
                  value={editMode ? profileForm.major : profile.major || ""}
                  onChange={(e) => setProfileForm((prev) => ({ ...prev, major: e.target.value }))}
                  disabled={!editMode}
                  leftSection={<IconBook size={16} />}
                  placeholder="Masukkan nama jurusan"
                  required={profile?.role === "USER"}
                />
                <NumberInput
                  label="Semester"
                  name="semester"
                  value={editMode ? profileForm.semester : profile.semester || 1}
                  onChange={(value: string | number) =>
                    setProfileForm((prev) => ({ ...prev, semester: typeof value === "number" ? value : 1 }))
                  }
                  disabled={!editMode}
                  min={1}
                  max={14}
                  placeholder="Pilih semester"
                  required={profile?.role === "USER"}
                />
              </SimpleGrid>

              {editMode && (
                <Group justify="flex-end" mt="lg">
                  <Button variant="light" onClick={() => setEditMode(false)}>
                    Batal
                  </Button>
                  <Button onClick={handleSaveProfile} loading={saving}>
                    Simpan Perubahan
                  </Button>
                </Group>
              )}
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="lg">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  Pengaturan
                </Text>
                <Button onClick={saveSettings} loading={saving}>
                  Simpan Pengaturan
                </Button>
              </Group>

              <Stack gap="md">
                <Text fw={600} size="md">
                  Notifikasi
                </Text>
                <Switch
                  label="Email Notifications"
                  description="Terima notifikasi melalui email"
                  checked={Boolean(settingsForm.emailNotifications)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      emailNotifications: event?.currentTarget?.checked ?? false,
                    }))
                  }
                />
                <Switch
                  label="Push Notifications"
                  description="Terima notifikasi push dari browser"
                  checked={Boolean(settingsForm.pushNotifications)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      pushNotifications: event?.currentTarget?.checked ?? false,
                    }))
                  }
                />

                <Divider />

                <Text fw={600} size="md">
                  Tampilan
                </Text>
                <Switch
                  label="Dark Mode"
                  description="Menggunakan tema gelap"
                  checked={settingsForm.darkMode}
                  onChange={(event) => {
                    const isChecked = event?.currentTarget?.checked ?? false
                    setSettingsForm((prev) => ({
                      ...prev,
                      darkMode: isChecked,
                    }))
                  }}
                />
                <Select
                  label="Bahasa"
                  value={settingsForm.language || "id"}
                  onChange={(value) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      language: value || "id",
                    }))
                  }
                  data={[
                    { value: "id", label: "Bahasa Indonesia" },
                    { value: "en", label: "English" },
                  ]}
                />
                <Select
                  label="Zona Waktu"
                  value={settingsForm.timezone || "Asia/Jakarta"}
                  onChange={(value) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      timezone: value || "Asia/Jakarta",
                    }))
                  }
                  data={[
                    { value: "Asia/Jakarta", label: "WIB (UTC+7)" },
                    { value: "Asia/Makassar", label: "WITA (UTC+8)" },
                    { value: "Asia/Jayapura", label: "WIT (UTC+9)" },
                  ]}
                />

                <Divider />

                <Text fw={600} size="md">
                  Privasi
                </Text>
                <Switch
                  label="Tampilkan Email"
                  description="Email Anda akan terlihat oleh pengguna lain"
                  checked={Boolean(settingsForm.privacy?.showEmail)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showEmail: event?.currentTarget?.checked ?? false,
                      },
                    }))
                  }
                />
                <Switch
                  label="Tampilkan Telepon"
                  description="Nomor telepon Anda akan terlihat oleh pengguna lain"
                  checked={Boolean(settingsForm.privacy?.showPhone)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showPhone: event?.currentTarget?.checked ?? false,
                      },
                    }))
                  }
                />
                <Switch
                  label="Profil Publik"
                  description="Profil Anda akan terlihat oleh pengguna lain"
                  checked={Boolean(settingsForm.privacy?.showProfile)}
                  onChange={(event) =>
                    setSettingsForm((prev) => ({
                      ...prev,
                      privacy: {
                        ...prev.privacy,
                        showProfile: event?.currentTarget?.checked ?? false,
                      },
                    }))
                  }
                />
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>

        {/* Security Tab */}
        <Tabs.Panel value="security" pt="lg">
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Stack gap="lg">
              <Text fw={600} size="lg">
                Keamanan Akun
              </Text>

              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Password</Text>
                    <Text size="sm" c="gray.6">
                      Terakhir diubah: -
                    </Text>
                  </div>
                  <Button variant="light" onClick={openPassword}>
                    Ubah Password
                  </Button>
                </Group>

                <Divider />

                <Group justify="space-between">
                  <div>
                    <Text fw={500}>Email Verification</Text>
                    <Text size="sm" c="gray.6">
                      {profile.email}
                    </Text>
                  </div>
                  <Group gap="xs">
                    <Badge color={profile.isEmailVerified ? "green" : "red"}>
                      {profile.isEmailVerified ? "Terverifikasi" : "Belum Verifikasi"}
                    </Badge>
                    {!profile.isEmailVerified && (
                      <Button size="xs" variant="light" onClick={handleVerifyEmail} loading={saving}>
                        Verifikasi
                      </Button>
                    )}
                  </Group>
                </Group>

                {profile.phone && (
                  <Group justify="space-between">
                    <div>
                      <Text fw={500}>Phone Verification</Text>
                      <Text size="sm" c="gray.6">
                        {profile.phone}
                      </Text>
                    </div>
                    <Group gap="xs">
                      <Badge color={profile.isPhoneVerified ? "green" : "red"}>
                        {profile.isPhoneVerified ? "Terverifikasi" : "Belum Verifikasi"}
                      </Badge>
                      {!profile.isPhoneVerified && (
                        <Button size="xs" variant="light" onClick={handleVerifyPhone} loading={saving}>
                          Verifikasi
                        </Button>
                      )}
                    </Group>
                  </Group>
                )}
              </Stack>
            </Stack>
          </Card>
        </Tabs.Panel>
      </Tabs>

      {/* Password Change Modal */}
      <Modal opened={passwordOpened} onClose={closePassword} title="Ubah Password">
        <Stack gap="md">
          <PasswordInput
            label="Password Saat Ini"
            value={passwordForm.currentPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            required
          />
          <PasswordInput
            label="Password Baru"
            value={passwordForm.newPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            required
          />
          <PasswordInput
            label="Konfirmasi Password Baru"
            value={passwordForm.confirmPassword}
            onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required
          />
          <Group justify="flex-end">
            <Button variant="light" onClick={closePassword}>
              Batal
            </Button>
            <Button onClick={handlePasswordChange} loading={saving} disabled={saving}>
              Ubah Password
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
