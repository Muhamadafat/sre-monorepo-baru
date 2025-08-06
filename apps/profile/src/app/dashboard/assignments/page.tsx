"use client"
import { useState, useEffect } from "react"
import {
  Container,
  Stack,
  Title,
  Text,
  Group,
  Badge,
  Button,
  SimpleGrid,
  Card,
  ThemeIcon,
  LoadingOverlay,
  Alert,
  Paper,
  TextInput,
  Textarea,
  FileInput,
  Progress,
  Tabs,
  Table,
  ScrollArea,
  ActionIcon,
  Anchor,
  Divider,
  Box,
} from "@mantine/core"
import { useForm } from "@mantine/form"
import {
  IconCalendar,
  IconClipboardList,
  IconFileText,
  IconCheck,
  IconUpload,
  IconAlertCircle,
  IconFile,
  IconDownload,
  IconEye,
  IconStar,
  IconTrendingUp,
  IconCode,
  IconSend,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { usePageAnalytics, useFeatureAnalytics } from "@/hooks/use-analytics"

// Types sesuai dengan Prisma schema
interface Assignment {
  id: string
  title: string
  description: string
  week_number: number
  assignment_code: string
  file_url: string | null
  file_name: string | null
  due_date: string | null
  is_active: boolean
  created_by: string
  createdAt: string
  updatedAt: string
  creator?: {
    id: string
    name: string
    email: string
  }
}

interface AssignmentSubmission {
  id: string
  assignment_id: string
  student_id: string
  assignment_code_input: string
  file_url: string | null
  file_name: string | null
  submission_text: string | null
  status: "pending" | "submitted" | "graded"
  grade: number | null
  feedback: string | null
  submitted_at: string
  graded_at: string | null
  createdAt: string
  updatedAt: string
  assignment?: Assignment
  student?: {
    id: string
    name: string
    email: string
    nim: string
    group: string
  }
}

interface StudentStats {
  totalAssignments: number
  submittedAssignments: number
  gradedAssignments: number
  averageGrade: number
  pendingAssignments: number
}

export default function StudentAssignmentPage() {
  // Analytics tracking
  usePageAnalytics("assignments-page")
  const { trackFeature } = useFeatureAnalytics()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("available")
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [showSubmitForm, setShowSubmitForm] = useState(false)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [stats, setStats] = useState<StudentStats>({
    totalAssignments: 0,
    submittedAssignments: 0,
    gradedAssignments: 0,
    averageGrade: 0,
    pendingAssignments: 0,
  })

  const submissionForm = useForm({
    initialValues: {
      assignment_code_input: "",
      submission_text: "",
      file: null as File | null,
    },
    validate: {
      assignment_code_input: (value: any) => {
        if (!/^[A-Z0-9]{3,4}$/.test(value)) {
          return "Code tugas harus 3-4 karakter huruf/angka kapital"
        }
        return null
      },
    },
  })

  useEffect(() => {
    loadCurrentUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadCurrentUser = async () => {
    try {
      const res = await fetch("/api/auth/signin", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error("User not authenticated")
      }

      const data = await res.json()
      if (!data || !data.user) {
        throw new Error("User not authenticated")
      }

      setUser(data.user)
    } catch (error: any) {
      console.error("Error loading current user:", error)
      notifications.show({
        title: "Error",
        message: "Sesi Anda telah berakhir. Silakan login kembali.",
        color: "red",
      })
      // Redirect to login
      window.location.href = "/auth/signin"
    }
  }

  const loadData = async () => {
  if (!user) return
  setLoading(true)
  try {
    const [assignmentsRes, submissionsRes] = await Promise.all([
      fetch("/api/assignments/active"),
      fetch(`/api/assignments/submissions/${user.id}`),
    ])

    if (!assignmentsRes.ok || !submissionsRes.ok) {
      throw new Error("Gagal memuat data assignment atau submission")
    }

    const assignmentsData = await assignmentsRes.json()
    const submissionsData = await submissionsRes.json()

    if (!assignmentsData.success || !submissionsData.success) {
      throw new Error("Gagal memuat data assignment/submission")
    }

    setAssignments(assignmentsData.assignments || [])
    setSubmissions(submissionsData.submissions || [])

    calculateStats(assignmentsData.assignments || [], submissionsData.submissions || [])
  } catch (error) {
    console.error("Error loading data:", error)
    notifications.show({
      title: "Error",
      message: "Gagal memuat data assignment",
      color: "red",
    })
  } finally {
    setLoading(false)
  }
}


  const loadActiveAssignments = async () => {
    try {
      const res = await fetch("/api/assignments/active", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Gagal memuat assignment")
      }

      setAssignments(data.assignments || [])
    } catch (error: any) {
      console.error("Error loading assignments:", error)
      notifications.show({
        title: "Error",
        message: "Gagal memuat assignment",
        color: "red",
      })
    }
  }

  const loadMySubmissions = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/assignments/submissions/${user.id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }

      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || "Gagal memuat submission")
      }

      setSubmissions(data.submissions || [])
      calculateStats(assignments, data.submissions || [])
    } catch (error: any) {
      console.error("Error loading submissions:", error)
      notifications.show({
        title: "Error",
        message: "Gagal memuat submission",
        color: "red",
      })
    }
  }

  const calculateStats = (assignments: Assignment[], submissions: AssignmentSubmission[]) => {
    const submittedCount = submissions.filter((s) => s.status !== "pending").length
    const gradedCount = submissions.filter((s) => s.status === "graded").length
    const gradedSubmissions = submissions.filter((s) => s.status === "graded" && s.grade !== null)
    const avgGrade =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions.length
        : 0

    setStats({
      totalAssignments: assignments.length,
      submittedAssignments: submittedCount,
      gradedAssignments: gradedCount,
      averageGrade: Math.round(avgGrade * 10) / 10,
      pendingAssignments: assignments.length - submittedCount,
    })
  }

  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment)
    submissionForm.setFieldValue("assignment_code_input", "")
    submissionForm.setFieldValue("submission_text", "")
    submissionForm.setFieldValue("file", null)
    setShowSubmitForm(true)
    trackFeature("assignment_submit_form_open", { assignmentId: assignment.id })
  }

  const handleSubmissionSubmit = async (values: typeof submissionForm.values) => {
    if (!selectedAssignment || !user) return

    // Validate assignment code
    if (values.assignment_code_input !== selectedAssignment.assignment_code) {
      notifications.show({
        title: "Code Salah",
        message: `Code tugas salah! Code yang benar adalah: ${selectedAssignment.assignment_code}`,
        color: "red",
      })
      return
    }

    if (!values.submission_text && !values.file) {
      notifications.show({
        title: "Konten Kosong",
        message: "Harap isi text submission atau upload file",
        color: "red",
      })
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append("assignmentId", selectedAssignment.id)
      formData.append("studentId", user.id)
      formData.append("assignmentCodeInput", values.assignment_code_input)
      formData.append("submissionText", values.submission_text || "")

      if (values.file) {
        formData.append("file", values.file)
      }

      const res = await fetch("/api/assignments/submit", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.error || "Gagal mengumpulkan assignment")
      }

      notifications.show({
        title: "Berhasil",
        message: "Assignment berhasil dikumpulkan!",
        color: "green",
      })

      setShowSubmitForm(false)
      submissionForm.reset()
      trackFeature("assignment_submitted", { assignmentId: selectedAssignment.id })
      loadData() // Refresh data
    } catch (error: any) {
      console.error("Submit error:", error)
      notifications.show({
        title: "Error",
        message: error.message || "Gagal mengumpulkan assignment",
        color: "red",
      })
    } finally {
      setSubmitting(false)
    }
  };

  const handleViewAssignment = (assignment: Assignment) => {
    trackFeature("assignment_view", { assignmentId: assignment.id })
    
    // Tentukan URL berdasarkan kelas user
    let targetUrl = ""
    
    if (user?.group === "A" || user?.class === "A") {
      targetUrl = process.env.NEXT_PUBLIC_BRAIN_APP_URL || ""
    } else if (user?.group === "B" || user?.class === "B") {
      targetUrl = process.env.NEXT_PUBLIC_WRITER_APP_URL || ""
    }
    
    if (targetUrl) {
      // Buka di tab baru
      window.open(targetUrl, "_blank")
      // window.location.href = targetUrl;
    } else {
      notifications.show({
        title: "Error",
        message: "URL aplikasi tidak tersedia untuk kelas Anda",
        color: "red",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "graded":
        return "green"
      case "submitted":
        return "blue"
      case "pending":
        return "gray"
      default:
        return "gray"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "graded":
        return "Dinilai"
      case "submitted":
        return "Dikumpulkan"
      case "pending":
        return "Belum Dikumpulkan"
      default:
        return status
    }
  }

  const getGradeColor = (grade: number) => {
    if (grade >= 85) return "green"
    if (grade >= 70) return "blue"
    if (grade >= 60) return "orange"
    return "red"
  }

  const isAssignmentSubmitted = (assignmentId: string) => {
    return submissions.some((s) => s.assignment_id === assignmentId)
  }

  const getSubmissionForAssignment = (assignmentId: string) => {
    return submissions.find((s) => s.assignment_id === assignmentId)
  }

  const completionPercentage =
    stats.totalAssignments > 0 ? (stats.submittedAssignments / stats.totalAssignments) * 100 : 0

  // Redirect admin to admin dashboard
  if (user && user.role === "ADMIN") {
    return (
      <Container size="md" mt="xl">
        <Alert icon={<IconAlertCircle size={16} />} title="Admin Access" color="blue">
          <Text mb="md">Anda login sebagai admin. Halaman ini untuk mahasiswa.</Text>
          <Button onClick={() => (window.location.href = "/dashboard/admin/assignments")}>Go to Admin Dashboard</Button>
        </Alert>
      </Container>
    )
  }

  if (loading || !user) {
    return (
      <Container size="xl" py="xl">
        <LoadingOverlay visible={true} />
        <Stack align="center" gap="md" style={{ minHeight: "400px", justifyContent: "center" }}>
          {/* <Text c="gray.6">Memuat assignments...</Text> */}
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between">
          <div>
            <Title order={2}>My Assignments</Title>
            <Text c="gray.6">Kelola dan kumpulkan tugas-tugas Anda</Text>
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

        {/* Stats Overview */}
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }}>
          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Total Assignment
                </Text>
                <Text fw={700} size="xl">
                  {stats.totalAssignments}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  Assignment tersedia
                </Text>
              </div>
              <ThemeIcon color="blue" variant="light" size="xl" radius="md">
                <IconClipboardList size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Sudah Dikumpulkan
                </Text>
                <Text fw={700} size="xl">
                  {stats.submittedAssignments}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  dari {stats.totalAssignments} tugas
                </Text>
              </div>
              <ThemeIcon color="green" variant="light" size="xl" radius="md">
                <IconCheck size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Rata-rata Nilai
                </Text>
                <Text fw={700} size="xl">
                  {stats.averageGrade.toFixed(1)}
                </Text>
                <Text c="gray.6" size="xs" mt={4}>
                  dari {stats.gradedAssignments} dinilai
                </Text>
              </div>
              <ThemeIcon color="yellow" variant="light" size="xl" radius="md">
                <IconStar size={28} />
              </ThemeIcon>
            </Group>
          </Card>

          <Card withBorder shadow="sm" radius="md" p="lg">
            <Group justify="space-between">
              <div>
                <Text c="gray.6" size="sm" fw={700} tt="uppercase">
                  Progress
                </Text>
                <Text fw={700} size="xl">
                  {completionPercentage.toFixed(0)}%
                </Text>
                <Progress value={completionPercentage || 0} size="sm" color="teal" mt={4} />
              </div>
              <ThemeIcon color="teal" variant="light" size="xl" radius="md">
                <IconTrendingUp size={28} />
              </ThemeIcon>
            </Group>
          </Card>
        </SimpleGrid>

        {/* Tabs */}
        <Tabs value={activeTab} onChange={(value) => setActiveTab(value || "available")}>
          <Tabs.List>
            <Tabs.Tab value="available" leftSection={<IconClipboardList size={16} />}>
              Assignment Tersedia ({assignments.length})
            </Tabs.Tab>
            <Tabs.Tab value="submitted" leftSection={<IconFileText size={16} />}>
              Submission Saya ({submissions.length})
            </Tabs.Tab>
          </Tabs.List>

          {/* Available Assignments Tab */}
          <Tabs.Panel value="available" pt="xl">
            <Stack gap="md">
              {assignments.map((assignment) => {
                const submission = getSubmissionForAssignment(assignment.id)
                const isSubmitted = !!submission
                return (
                  <Card key={assignment.id} withBorder shadow="sm" radius="md" p="lg">
                    <Group justify="space-between" mb="md">
                      <div style={{ flex: 1 }}>
                        <Group mb="xs">
                          <Text fw={600} size="lg">
                            {assignment.title}
                          </Text>
                          <Badge size="sm" variant="light" color="blue">
                            Minggu {assignment.week_number}
                          </Badge>
                          <Group gap="xs">
                            <IconCode size={14} />
                            <Text fw={600} size="sm" ff="monospace" c="blue">
                              {assignment.assignment_code}
                            </Text>
                          </Group>
                        </Group>
                        <Text size="sm" c="gray.7" mb="md">
                          {assignment.description}
                        </Text>
                        <Group gap="md">
                          <Text size="sm" c="gray.6">
                            <strong>Pengajar:</strong> {assignment.creator?.name}
                          </Text>
                          {assignment.due_date && (
                            <Text size="sm" c="gray.6">
                              <strong>Deadline:</strong>{" "}
                              {new Date(assignment.due_date).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </Text>
                          )}
                        </Group>
                        {assignment.file_url && (
                          <Group gap="xs" mt="sm">
                            <IconFile size={14} />
                            <Anchor size="sm" href={assignment.file_url} target="_blank">
                              {assignment.file_name || "Download File Assignment"}
                            </Anchor>
                          </Group>
                        )}
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {isSubmitted ? (
                          <Stack gap="xs" align="flex-end">
                            <Badge size="sm" color={getStatusColor(submission.status)} variant="light">
                              {getStatusLabel(submission.status)}
                            </Badge>
                            {submission.status === "graded" && submission.grade !== null && (
                              <Badge size="lg" color={getGradeColor(submission.grade)} variant="filled">
                                {submission.grade}
                              </Badge>
                            )}
                          </Stack>
                        ) : (
                          <Box display="grid" style={{ gap: '20px'}}>
                            {/* <Button
                              leftSection={<IconUpload size={16} />}
                              onClick={() => handleSubmitAssignment(assignment)}
                            >
                              Kumpulkan Tugas
                            </Button> */}
                            <Button
                              leftSection={<IconEye size={16} />}
                              color="green"
                              onClick={() => handleViewAssignment(assignment)}
                            >
                              Lihat Tugas
                            </Button>
                          </Box>
                        )}
                      </div>
                    </Group>
                  </Card>
                )
              })}

              {assignments.length === 0 && !loading && (
                <Card withBorder shadow="sm" radius="md" p="xl">
                  <Stack align="center" gap="md">
                    <IconClipboardList size={48} color="var(--mantine-color-gray-4)" />
                    <div style={{ textAlign: "center" }}>
                      <Text fw={600} size="lg" mb={4}>
                        Belum Ada Assignment
                      </Text>
                      <Text c="gray.6" size="sm">
                        Assignment baru akan muncul di sini ketika dosen memberikan tugas
                      </Text>
                    </div>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Tabs.Panel>

          {/* Submitted Assignments Tab */}
          <Tabs.Panel value="submitted" pt="xl">
            <Paper withBorder shadow="sm" radius="md">
              <ScrollArea>
                <Table striped highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Assignment</Table.Th>
                      <Table.Th>Code Input</Table.Th>
                      <Table.Th>Waktu Submit</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Nilai</Table.Th>
                      <Table.Th>Aksi</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {submissions.map((submission) => (
                      <Table.Tr key={submission.id}>
                        <Table.Td>
                          <div>
                            <Text fw={500} size="sm">
                              {submission.assignment?.title}
                            </Text>
                            <Text size="xs" c="gray.6">
                              Minggu {submission.assignment?.week_number}
                            </Text>
                          </div>
                        </Table.Td>
                        <Table.Td>
                          <Text fw={600} size="sm" ff="monospace" c="blue">
                            {submission.assignment_code_input}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {new Date(submission.submitted_at).toLocaleDateString("id-ID", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge size="sm" color={getStatusColor(submission.status)} variant="light">
                            {getStatusLabel(submission.status)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          {submission.grade !== null ? (
                            <Badge size="sm" color={getGradeColor(submission.grade)} variant="filled">
                              {submission.grade}
                            </Badge>
                          ) : (
                            <Text size="sm" c="gray.5">
                              -
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            {submission.file_url && (
                              <ActionIcon
                                variant="subtle"
                                color="blue"
                                onClick={() => window.open(submission.file_url || "", "_blank")}
                                size="sm"
                              >
                                <IconDownload size={16} />
                              </ActionIcon>
                            )}
                            {submission.feedback && (
                              <ActionIcon
                                variant="subtle"
                                color="green"
                                onClick={() => {
                                  notifications.show({
                                    title: "Feedback Dosen",
                                    message: submission.feedback,
                                    color: "blue",
                                    autoClose: 10000,
                                  })
                                }}
                                size="sm"
                              >
                                <IconEye size={16} />
                              </ActionIcon>
                            )}
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </ScrollArea>

              {submissions.length === 0 && !loading && (
                <Stack align="center" gap="md" p="xl">
                  <IconFileText size={48} color="var(--mantine-color-gray-4)" />
                  <div style={{ textAlign: "center" }}>
                    <Text fw={600} size="lg" mb={4}>
                      Belum Ada Submission
                    </Text>
                    <Text c="gray.6" size="sm">
                      Submission Anda akan muncul di sini setelah mengumpulkan tugas
                    </Text>
                  </div>
                </Stack>
              )}
            </Paper>
          </Tabs.Panel>
        </Tabs>

        {/* Submit Assignment Form */}
        {showSubmitForm && selectedAssignment && (
          <Paper withBorder shadow="sm" radius="md" p="xl">
            <form onSubmit={submissionForm.onSubmit(handleSubmissionSubmit)}>
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={3}>Kumpulkan Assignment</Title>
                  <Button variant="light" onClick={() => setShowSubmitForm(false)}>
                    Tutup
                  </Button>
                </Group>

                <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
                  <Text fw={500} size="sm" mb={4}>
                    Assignment: {selectedAssignment.title}
                  </Text>
                  <Text size="sm">
                    Masukkan <strong>assignment code</strong> yang diberikan dosen untuk memverifikasi tugas yang benar.
                  </Text>
                </Alert>

                <TextInput
                  label="Assignment Code"
                  placeholder="Masukkan code assignment (contoh: A001)"
                  required
                  leftSection={<IconCode size={16} />}
                  {...submissionForm.getInputProps("assignment_code_input")}
                />

                <Textarea
                  label="Submission Text"
                  placeholder="Ketik jawaban atau penjelasan Anda di sini..."
                  minRows={4}
                  maxRows={8}
                  autosize
                  {...submissionForm.getInputProps("submission_text")}
                />

                <Divider label="ATAU" labelPosition="center" />

                <FileInput
                  label="Upload File"
                  placeholder="Pilih file untuk dikumpulkan"
                  leftSection={<IconFile size={16} />}
                  accept=".pdf,.doc,.docx,.txt,.zip,.rar"
                  {...submissionForm.getInputProps("file")}
                />

                <Group justify="flex-end">
                  <Button variant="light" onClick={() => setShowSubmitForm(false)} disabled={submitting}>
                    Batal
                  </Button>
                  <Button type="submit" loading={submitting} leftSection={<IconSend size={16} />}>
                    Kumpulkan Tugas
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        )}
      </Stack>
    </Container>
  )
}
