"use client"

import { useState, useCallback, useEffect } from "react"
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  Grid,
  Avatar,
  ThemeIcon,
  Progress,
  RingProgress,
  Center,
  Box,
  Divider,
  ScrollArea,
  Alert,
  Tooltip,
  useMantineTheme,
  useMantineColorScheme,
} from "@mantine/core"
import {
  IconEdit,
  IconFileText,
  IconClock,
  IconCheck,
  IconPlus,
  IconTrash,
  IconEye,
  IconDownload,
  IconAlertCircle,
  IconSparkles,
  IconPencil,
  IconBookmark,
  IconHistory,
} from "@tabler/icons-react"
import { notifications } from "@mantine/notifications"
import { StatusIndicator, STATUS_STAGES } from "./StatusIndicator"

export interface DraftArticle {
  id: string
  title: string
  content: string
  wordCount: number
  status: 'draft' | 'generating' | 'completed' | 'error'
  createdAt: Date
  updatedAt: Date
  metadata: {
    topic?: string
    outline?: string[]
    targetLength?: number
    style?: string
    references?: string[]
  }
}

export interface DraftFeatureProps {
  /**
   * Current project/session ID
   */
  projectId?: string
  
  /**
   * Callback when draft is created
   */
  onDraftCreated?: (draft: DraftArticle) => void
  
  /**
   * Callback when draft is selected for editing
   */
  onDraftSelected?: (draft: DraftArticle) => void
  
  /**
   * Show compact view
   */
  compact?: boolean
  
  /**
   * Maximum number of drafts to display
   */
  maxDisplayed?: number
}

// Pre-configured prompts untuk draft generation
const DRAFT_TEMPLATES = [
  {
    id: 'informational',
    title: 'Artikel Informatif',
    description: 'Draft artikel dengan struktur informatif yang lengkap',
    icon: IconFileText,
    color: 'blue',
    prompt: 'Tuliskan draft artikel informatif yang komprehensif tentang topik ini dengan struktur: pendahuluan, poin-poin utama, contoh praktis, dan kesimpulan.',
    estimatedTime: 25 // seconds
  },
  {
    id: 'tutorial',
    title: 'Panduan Tutorial',
    description: 'Draft panduan step-by-step yang mudah diikuti',
    icon: IconEdit,
    color: 'green',
    prompt: 'Buatkan draft tutorial step-by-step yang detail dengan penjelasan setiap langkah, tips, dan troubleshooting umum.',
    estimatedTime: 30
  },
  {
    id: 'analysis',
    title: 'Analisis Mendalam',
    description: 'Draft artikel analitis dengan data dan insights',
    icon: IconSparkles,
    color: 'purple',
    prompt: 'Tuliskan draft analisis yang mendalam dengan data pendukung, contoh kasus, dan rekomendasi praktis.',
    estimatedTime: 35
  },
  {
    id: 'custom',
    title: 'Kustom',
    description: 'Draft dengan instruksi khusus sesuai kebutuhan',
    icon: IconPencil,
    color: 'orange',
    prompt: '',
    estimatedTime: 20
  }
]

export function DraftArticleFeature({ 
  projectId, 
  onDraftCreated, 
  onDraftSelected,
  compact = false,
  maxDisplayed = 5
}: DraftFeatureProps) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  // States
  const [drafts, setDrafts] = useState<DraftArticle[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentGeneratingDraft, setCurrentGeneratingDraft] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [customTopic, setCustomTopic] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')

  // Generate draft dengan AI
  const generateDraft = useCallback(async (template: typeof DRAFT_TEMPLATES[0], topic: string, customInstructions?: string) => {
    const draftId = `draft-${Date.now()}`
    setCurrentGeneratingDraft(draftId)
    setIsGenerating(true)
    setShowCreateModal(false)

    // Create draft placeholder
    const newDraft: DraftArticle = {
      id: draftId,
      title: `Draft: ${topic}`,
      content: '',
      wordCount: 0,
      status: 'generating',
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: {
        topic,
        targetLength: 800,
        style: template.title
      }
    }

    setDrafts(prev => [newDraft, ...prev])

    try {
      // Simulate AI generation with custom stages for draft
      const draftStages = [
        { progress: 10, stage: "📝 Menganalisis topik artikel...", duration: 2000 },
        { progress: 25, stage: "🧠 Menyusun kerangka draft...", duration: 3000 },
        { progress: 45, stage: "✍️ Menulis draft pendahuluan...", duration: 4000 },
        { progress: 65, stage: "📚 Mengembangkan konten utama...", duration: 6000 },
        { progress: 80, stage: "🔗 Menambahkan transisi dan flow...", duration: 3000 },
        { progress: 95, stage: "🎨 Memformat dan menyelesaikan draft...", duration: 2000 },
        { progress: 100, stage: "✅ Draft artikel siap!", duration: 500 },
      ]

      // Wait for generation to complete
      await new Promise(resolve => setTimeout(resolve, draftStages.reduce((sum, s) => sum + s.duration, 0)))

      // Simulate generated content
      const generatedContent = `# ${topic}\n\n## Pendahuluan\n\nDraft artikel tentang ${topic} yang telah dihasilkan oleh AI berdasarkan template ${template.title}.\n\n## Konten Utama\n\n${customInstructions || template.prompt}\n\n## Kesimpulan\n\nDraft ini siap untuk dikembangkan lebih lanjut sesuai kebutuhan.`
      
      const wordCount = generatedContent.split(' ').length

      // Update draft dengan hasil
      setDrafts(prev => prev.map(d => d.id === draftId ? {
        ...d,
        content: generatedContent,
        wordCount,
        status: 'completed' as const,
        updatedAt: new Date()
      } : d))

      notifications.show({
        title: "Draft Berhasil Dibuat!",
        message: `Draft "${topic}" telah selesai dibuat dengan ${wordCount} kata`,
        color: "green",
        icon: <IconCheck size={16} />,
      })

      onDraftCreated?.(newDraft)

    } catch (error) {
      console.error("Error generating draft:", error)
      
      setDrafts(prev => prev.map(d => d.id === draftId ? {
        ...d,
        status: 'error' as const,
        updatedAt: new Date()
      } : d))

      notifications.show({
        title: "Gagal Membuat Draft",
        message: "Terjadi kesalahan saat membuat draft. Coba lagi.",
        color: "red",
        icon: <IconAlertCircle size={16} />,
      })
    } finally {
      setIsGenerating(false)
      setCurrentGeneratingDraft(null)
    }
  }, [onDraftCreated])

  // Handle template selection
  const handleTemplateSelect = useCallback((templateId: string) => {
    setSelectedTemplate(templateId)
    if (templateId !== 'custom') {
      // Auto-start generation for pre-defined templates if topic is provided
      if (customTopic.trim()) {
        const template = DRAFT_TEMPLATES.find(t => t.id === templateId)!
        generateDraft(template, customTopic.trim())
      }
    }
  }, [customTopic, generateDraft])

  // Handle custom draft creation
  const handleCreateCustomDraft = useCallback(() => {
    if (!customTopic.trim()) {
      notifications.show({
        title: "Topik Diperlukan",
        message: "Silakan masukkan topik artikel terlebih dahulu",
        color: "orange"
      })
      return
    }

    const customTemplate = {
      ...DRAFT_TEMPLATES.find(t => t.id === 'custom')!,
      prompt: customPrompt.trim() || `Tuliskan draft artikel tentang ${customTopic} dengan struktur yang baik dan konten yang informatif.`
    }

    generateDraft(customTemplate, customTopic.trim(), customPrompt.trim())
  }, [customTopic, customPrompt, generateDraft])

  // Delete draft
  const deleteDraft = useCallback((draftId: string) => {
    setDrafts(prev => prev.filter(d => d.id !== draftId))
    notifications.show({
      title: "Draft Dihapus",
      message: "Draft telah dihapus dari daftar",
      color: "blue"
    })
  }, [])

  // View draft
  const viewDraft = useCallback((draft: DraftArticle) => {
    onDraftSelected?.(draft)
  }, [onDraftSelected])

  if (compact) {
    return (
      <Card withBorder radius="md" p="md">
        <Group justify="space-between" mb="md">
          <Group gap="sm">
            <ThemeIcon variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconEdit size={18} />
            </ThemeIcon>
            <div>
              <Text fw={600} size="sm">Draft Artikel</Text>
              <Text size="xs" c="dimmed">{drafts.length} draft tersedia</Text>
            </div>
          </Group>
          <Button
            size="xs"
            variant="light"
            leftSection={<IconPlus size={14} />}
            onClick={() => setShowCreateModal(true)}
            loading={isGenerating}
          >
            Tulis Draft
          </Button>
        </Group>

        {drafts.length > 0 && (
          <ScrollArea.Autosize maxHeight={200}>
            <Stack gap="xs">
              {drafts.slice(0, maxDisplayed).map((draft) => (
                <DraftItemCompact
                  key={draft.id}
                  draft={draft}
                  onView={() => viewDraft(draft)}
                  onDelete={() => deleteDraft(draft.id)}
                  isGenerating={draft.id === currentGeneratingDraft}
                />
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}

        <DraftCreationModal
          opened={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreateDraft={handleCreateCustomDraft}
          onTemplateSelect={handleTemplateSelect}
          customTopic={customTopic}
          setCustomTopic={setCustomTopic}
          customPrompt={customPrompt}
          setCustomPrompt={setCustomPrompt}
          selectedTemplate={selectedTemplate}
          isGenerating={isGenerating}
        />
      </Card>
    )
  }

  return (
    <Card shadow="sm" radius="lg" withBorder p="xl" style={{ minHeight: 400 }}>
      {/* Header Section */}
      <Group justify="space-between" mb="xl">
        <div>
          <Group gap="md" mb="xs">
            <Avatar
              size="lg"
              radius="xl"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              <IconEdit size={24} />
            </Avatar>
            <div>
              <Title order={3}>Draft Artikel</Title>
              <Text c="dimmed" size="sm">
                Buat draft artikel dengan bantuan AI untuk berbagai kebutuhan
              </Text>
            </div>
          </Group>
        </div>

        <Button
          size="lg"
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan' }}
          leftSection={<IconPlus size={20} />}
          onClick={() => setShowCreateModal(true)}
          loading={isGenerating}
        >
          Tuliskan Draft Artikel
        </Button>
      </Group>

      {/* Progress Section - Show when generating */}
      {isGenerating && (
        <StatusIndicator
          isLoading={true}
          type="ai"
          title="Sedang Menulis Draft Artikel"
          stages={[
            { progress: 10, stage: "📝 Menganalisis topik artikel...", duration: 2000 },
            { progress: 25, stage: "🧠 Menyusun kerangka draft...", duration: 3000 },
            { progress: 45, stage: "✍️ Menulis draft pendahuluan...", duration: 4000 },
            { progress: 65, stage: "📚 Mengembangkan konten utama...", duration: 6000 },
            { progress: 80, stage: "🔗 Menambahkan transisi dan flow...", duration: 3000 },
            { progress: 95, stage: "🎨 Memformat dan menyelesaikan draft...", duration: 2000 },
            { progress: 100, stage: "✅ Draft artikel siap!", duration: 500 },
          ]}
          showDetails={true}
        />
      )}

      <Divider my="xl" />

      {/* Drafts List */}
      <div>
        <Group justify="space-between" mb="lg">
          <Title order={4}>Draft Terkini</Title>
          {drafts.length > 0 && (
            <Badge variant="light" color="blue">
              {drafts.length} draft
            </Badge>
          )}
        </Group>

        {drafts.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="md">
              <ThemeIcon size={60} radius="xl" variant="light" color="gray">
                <IconFileText size={30} />
              </ThemeIcon>
              <div style={{ textAlign: 'center' }}>
                <Text fw={500} mb="xs">Belum Ada Draft</Text>
                <Text size="sm" c="dimmed">
                  Mulai dengan membuat draft artikel pertama Anda
                </Text>
              </div>
              <Button
                variant="light"
                leftSection={<IconPlus size={16} />}
                onClick={() => setShowCreateModal(true)}
              >
                Buat Draft Pertama
              </Button>
            </Stack>
          </Center>
        ) : (
          <Grid>
            {drafts.map((draft) => (
              <Grid.Col key={draft.id} span={{ base: 12, md: 6, lg: 4 }}>
                <DraftCard
                  draft={draft}
                  onView={() => viewDraft(draft)}
                  onDelete={() => deleteDraft(draft.id)}
                  isGenerating={draft.id === currentGeneratingDraft}
                />
              </Grid.Col>
            ))}
          </Grid>
        )}
      </div>

      {/* Draft Creation Modal */}
      <DraftCreationModal
        opened={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateDraft={handleCreateCustomDraft}
        onTemplateSelect={handleTemplateSelect}
        customTopic={customTopic}
        setCustomTopic={setCustomTopic}
        customPrompt={customPrompt}
        setCustomPrompt={setCustomPrompt}
        selectedTemplate={selectedTemplate}
        isGenerating={isGenerating}
      />
    </Card>
  )
}

// Component untuk Draft Card
function DraftCard({ 
  draft, 
  onView, 
  onDelete, 
  isGenerating 
}: { 
  draft: DraftArticle
  onView: () => void
  onDelete: () => void
  isGenerating: boolean
}) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'

  const getStatusConfig = () => {
    switch (draft.status) {
      case 'generating':
        return { color: 'blue', icon: IconClock, label: 'Sedang Ditulis' }
      case 'completed':
        return { color: 'green', icon: IconCheck, label: 'Selesai' }
      case 'error':
        return { color: 'red', icon: IconAlertCircle, label: 'Error' }
      default:
        return { color: 'gray', icon: IconFileText, label: 'Draft' }
    }
  }

  const statusConfig = getStatusConfig()

  return (
    <Card 
      withBorder 
      radius="md" 
      p="md" 
      style={{ 
        height: '100%',
        opacity: isGenerating ? 0.7 : 1,
        transition: 'opacity 0.3s ease'
      }}
    >
      <Stack gap="md" justify="space-between" h="100%">
        {/* Header */}
        <div>
          <Group justify="space-between" mb="xs">
            <Badge 
              variant="light" 
              color={statusConfig.color}
              leftSection={<statusConfig.icon size={12} />}
            >
              {statusConfig.label}
            </Badge>
            <Text size="xs" c="dimmed">
              {draft.createdAt.toLocaleDateString('id-ID')}
            </Text>
          </Group>

          <Text fw={600} mb="xs" lineClamp={2}>
            {draft.title}
          </Text>
          
          {draft.wordCount > 0 && (
            <Group gap="xs" mb="sm">
              <Text size="sm" c="dimmed">
                {draft.wordCount} kata
              </Text>
              {draft.metadata.style && (
                <>
                  <Text c="dimmed">•</Text>
                  <Text size="sm" c="dimmed">
                    {draft.metadata.style}
                  </Text>
                </>
              )}
            </Group>
          )}

          {draft.content && (
            <Text size="sm" c="dimmed" lineClamp={3}>
              {draft.content.substring(0, 150)}...
            </Text>
          )}
        </div>

        {/* Actions */}
        <Group justify="space-between">
          <Group gap="xs">
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={onView}
              disabled={draft.status === 'generating'}
            >
              <IconEye size={14} />
            </ActionIcon>
            <ActionIcon
              variant="light"
              color="red"
              size="sm"
              onClick={onDelete}
              disabled={draft.status === 'generating'}
            >
              <IconTrash size={14} />
            </ActionIcon>
          </Group>

          {draft.status === 'completed' && (
            <Button
              size="xs"
              variant="light"
              onClick={onView}
            >
              Baca
            </Button>
          )}
        </Group>
      </Stack>
    </Card>
  )
}

// Compact version of draft item
function DraftItemCompact({ 
  draft, 
  onView, 
  onDelete, 
  isGenerating 
}: { 
  draft: DraftArticle
  onView: () => void
  onDelete: () => void
  isGenerating: boolean
}) {
  return (
    <Group justify="space-between" p="xs" style={{ 
      border: '1px solid var(--mantine-color-gray-3)',
      borderRadius: 'var(--mantine-radius-sm)',
      opacity: isGenerating ? 0.7 : 1
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={500} lineClamp={1}>
          {draft.title}
        </Text>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {draft.wordCount} kata
          </Text>
          <Badge size="xs" variant="dot" color={
            draft.status === 'completed' ? 'green' : 
            draft.status === 'generating' ? 'blue' : 'red'
          }>
            {draft.status === 'generating' ? 'Menulis' : 
             draft.status === 'completed' ? 'Selesai' : 'Error'}
          </Badge>
        </Group>
      </div>
      
      <Group gap="xs">
        <ActionIcon size="sm" variant="subtle" onClick={onView} disabled={draft.status === 'generating'}>
          <IconEye size={12} />
        </ActionIcon>
        <ActionIcon size="sm" variant="subtle" color="red" onClick={onDelete} disabled={draft.status === 'generating'}>
          <IconTrash size={12} />
        </ActionIcon>
      </Group>
    </Group>
  )
}

// Draft Creation Modal
function DraftCreationModal({
  opened,
  onClose,
  onCreateDraft,
  onTemplateSelect,
  customTopic,
  setCustomTopic,
  customPrompt,
  setCustomPrompt,
  selectedTemplate,
  isGenerating
}: {
  opened: boolean
  onClose: () => void
  onCreateDraft: () => void
  onTemplateSelect: (templateId: string) => void
  customTopic: string
  setCustomTopic: (value: string) => void
  customPrompt: string
  setCustomPrompt: (value: string) => void
  selectedTemplate: string
  isGenerating: boolean
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tuliskan Draft Artikel"
      size="lg"
      centered
    >
      <Stack gap="lg">
        {/* Topic Input */}
        <TextInput
          label="Topik Artikel"
          placeholder="Contoh: Panduan Lengkap React untuk Pemula"
          value={customTopic}
          onChange={(e) => setCustomTopic(e.currentTarget.value)}
          required
        />

        {/* Template Selection */}
        <div>
          <Text fw={500} mb="sm">Pilih Template Draft:</Text>
          <Grid>
            {DRAFT_TEMPLATES.map((template) => (
              <Grid.Col key={template.id} span={6}>
                <Card
                  withBorder
                  p="md"
                  radius="md"
                  style={{ 
                    cursor: 'pointer',
                    borderColor: selectedTemplate === template.id ? 'var(--mantine-color-blue-5)' : undefined,
                    backgroundColor: selectedTemplate === template.id ? 'var(--mantine-color-blue-0)' : undefined
                  }}
                  onClick={() => onTemplateSelect(template.id)}
                >
                  <Stack gap="sm" align="center">
                    <ThemeIcon color={template.color} variant="light">
                      <template.icon size={20} />
                    </ThemeIcon>
                    <div style={{ textAlign: 'center' }}>
                      <Text fw={500} size="sm">{template.title}</Text>
                      <Text size="xs" c="dimmed">{template.description}</Text>
                      <Text size="xs" c="dimmed" mt="xs">~{template.estimatedTime}s</Text>
                    </div>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>
        </div>

        {/* Custom Instructions */}
        {selectedTemplate === 'custom' && (
          <Textarea
            label="Instruksi Khusus (Opsional)"
            placeholder="Berikan instruksi spesifik untuk draft artikel Anda..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.currentTarget.value)}
            rows={4}
          />
        )}

        {/* Actions */}
        <Group justify="flex-end" gap="sm">
          <Button variant="light" onClick={onClose}>
            Batal
          </Button>
          <Button
            onClick={onCreateDraft}
            loading={isGenerating}
            disabled={!customTopic.trim() || !selectedTemplate}
            leftSection={<IconSparkles size={16} />}
          >
            Tuliskan Draft
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

export default DraftArticleFeature