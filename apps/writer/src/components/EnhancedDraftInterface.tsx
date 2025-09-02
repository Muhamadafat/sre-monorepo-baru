"use client"

import { useState, useCallback } from "react"
import {
  Card,
  Text,
  Button,
  Group,
  Stack,
  TextInput,
  Grid,
  ThemeIcon,
  Badge,
  Modal,
  Select,
  Textarea,
  Alert,
  Divider,
} from "@mantine/core"
import {
  IconSparkles,
  IconBrain,
  IconTemplate,
  IconQuote,
  IconList,
  IconPlus,
  IconBulb,
  IconMagic,
  IconRocket,
} from "@tabler/icons-react"
import { StatusIndicator } from "@sre-monorepo/components"
import { notifications } from "@mantine/notifications"

interface AITemplate {
  id: string
  name: string
  description: string
  icon: any
  color: string
  prompt: string
  estimatedTime: number
}

const AI_TEMPLATES: AITemplate[] = [
  {
    id: 'auto-reference',
    name: 'Auto-Draft dari Referensi',
    description: 'Generate draft otomatis berdasarkan referensi pustaka yang tersedia',
    icon: IconBrain,
    color: 'blue',
    prompt: 'Buat draft artikel berdasarkan referensi pustaka yang ada, dengan struktur akademis yang baik',
    estimatedTime: 30
  },
  {
    id: 'structured',
    name: 'Template Terstruktur',
    description: 'Draft dengan struktur akademis lengkap (pendahuluan, metodologi, hasil, kesimpulan)',
    icon: IconTemplate,
    color: 'green',
    prompt: 'Buat draft artikel dengan struktur akademis: pendahuluan, tinjauan pustaka, metodologi, hasil, pembahasan, kesimpulan',
    estimatedTime: 35
  },
  {
    id: 'quick-outline',
    name: 'Outline Cepat',
    description: 'Generate outline dan kerangka artikel dengan cepat',
    icon: IconRocket,
    color: 'orange',
    prompt: 'Buat outline dan kerangka artikel yang komprehensif dengan poin-poin utama',
    estimatedTime: 15
  },
  {
    id: 'citation-heavy',
    name: 'Heavy Citation',
    description: 'Draft dengan banyak sitasi dan referensi akademis',
    icon: IconQuote,
    color: 'purple',
    prompt: 'Buat draft artikel dengan banyak sitasi dan referensi yang mendukung setiap argumen',
    estimatedTime: 40
  }
]

export function EnhancedDraftInterface() {
  const [topic, setTopic] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<AITemplate | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [generatedContent, setGeneratedContent] = useState("")
  const [currentStage, setCurrentStage] = useState("")
  const [progress, setProgress] = useState(0)
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [timeRemaining, setTimeRemaining] = useState(0)

  // AI Generation dengan progress tracking
  const generateWithAI = useCallback(async (template: AITemplate, userTopic: string) => {
    if (!userTopic.trim()) {
      notifications.show({
        title: "Topik Required",
        message: "Silakan masukkan topik artikel terlebih dahulu",
        color: "orange"
      })
      return
    }

    setIsGenerating(true)
    setShowTemplateModal(false)
    setCurrentStage("Memulai...")
    setProgress(0)

    const stages = [
      { progress: 10, stage: "📚 Menganalisis referensi pustaka...", duration: 3000 },
      { progress: 25, stage: "🧠 Menyusun kerangka berdasarkan template...", duration: 4000 },
      { progress: 45, stage: "✍️ Menulis draft dengan sitasi...", duration: 8000 },
      { progress: 70, stage: "📝 Mengembangkan argumen dan pembahasan...", duration: 6000 },
      { progress: 85, stage: "🔗 Menambahkan referensi dan kutipan...", duration: 4000 },
      { progress: 95, stage: "🎨 Memformat dan menyelesaikan draft...", duration: 2000 },
      { progress: 100, stage: "✅ Draft artikel siap dengan referensi!", duration: 1000 },
    ]

    try {
      const startTime = Date.now()

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i]
        setCurrentStage(stage.stage)
        setProgress(stage.progress)
        
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        const totalTime = stages.reduce((sum, s) => sum + s.duration, 0)
        const remaining = Math.max(0, Math.ceil((totalTime - (Date.now() - startTime)) / 1000))
        
        setTimeElapsed(elapsed)
        setTimeRemaining(remaining)

        await new Promise(resolve => setTimeout(resolve, stage.duration))
      }

      // Generate mock content based on template
      const mockContent = generateMockContent(template, userTopic)
      setGeneratedContent(mockContent)

      notifications.show({
        title: "Draft Berhasil Dibuat!",
        message: `Draft "${userTopic}" telah selesai dengan referensi lengkap`,
        color: "green"
      })

    } catch (error) {
      notifications.show({
        title: "Gagal Generate Draft",
        message: "Terjadi kesalahan saat membuat draft. Coba lagi.",
        color: "red"
      })
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const generateMockContent = (template: AITemplate, topic: string) => {
    const baseContent = `# ${topic}

## Abstrak

Artikel ini membahas ${topic.toLowerCase()} berdasarkan tinjauan pustaka yang komprehensif dan analisis mendalam terhadap berbagai sumber akademis yang relevan.

## Pendahuluan

${topic} merupakan topik yang sangat penting dalam konteks akademis modern. Berdasarkan penelitian dari Smith et al. (2023) dan Johnson (2022), topik ini memerlukan pendekatan yang sistematis dan berbasis evidence.

## Tinjauan Pustaka

Menurut Brown & Wilson (2023), konsep utama dalam ${topic.toLowerCase()} mencakup beberapa aspek fundamental:

1. **Aspek Teoritis**: Berdasarkan framework yang dikembangkan oleh Davis (2022)
2. **Aspek Praktis**: Implementasi yang telah diuji oleh Martinez et al. (2023)  
3. **Aspek Metodologis**: Pendekatan yang direkomendasikan oleh Chen (2023)

## Metodologi

Penelitian ini menggunakan pendekatan ${template.name.toLowerCase()} dengan mengintegrasikan berbagai sumber referensi yang telah tervalidasi.

## Pembahasan

### Sub-topik 1: Konsep Dasar
Berdasarkan analisis literature, konsep dasar ${topic.toLowerCase()} dapat dipahami melalui perspektif yang dikemukakan oleh Thompson (2023).

### Sub-topik 2: Implementasi
Implementasi praktis dari konsep ini telah didemonstrasikan dalam berbagai studi kasus (Lee et al., 2022; Garcia, 2023).

### Sub-topik 3: Tantangan dan Peluang  
Tantangan utama yang diidentifikasi mencakup aspek teknis dan metodologis (Anderson, 2023).

## Kesimpulan

${topic} merupakan area yang memerlukan penelitian lebih lanjut. Rekomendasi untuk penelitian selanjutnya mencakup eksplorasi lebih mendalam terhadap aspek-aspek yang belum terjangkau dalam studi ini.

## Referensi

1. Anderson, K. (2023). *Challenges in Modern Academic Research*. Academic Press.
2. Brown, A., & Wilson, B. (2023). Theoretical frameworks for contemporary studies. *Journal of Academic Research*, 15(3), 45-62.
3. Chen, L. (2023). Methodological approaches in systematic review. *Research Methods Quarterly*, 8(2), 123-145.
4. Davis, R. (2022). Fundamental concepts in academic writing. *Educational Review*, 12(4), 78-95.
5. Garcia, M. (2023). Case studies in practical implementation. *Applied Research Journal*, 7(1), 34-48.
6. Johnson, S. (2022). Evidence-based approaches in modern academia. *Scholarly Publications*, 9(3), 156-173.
7. Lee, J., Park, H., & Kim, S. (2022). Comparative analysis of research methodologies. *International Academic Review*, 11(2), 89-104.
8. Martinez, P., Rodriguez, C., & Santos, D. (2023). Practical applications in academic research. *Journal of Applied Studies*, 6(4), 201-218.
9. Smith, J., Taylor, M., & Brown, N. (2023). Contemporary perspectives on academic discourse. *Modern Academic Journal*, 14(1), 12-28.
10. Thompson, E. (2023). Theoretical foundations for academic inquiry. *Theoretical Studies Quarterly*, 10(2), 67-84.`

    return baseContent
  }

  const handleQuickGenerate = () => {
    if (!topic.trim()) {
      notifications.show({
        title: "Topik Required", 
        message: "Masukkan topik artikel dulu ya!",
        color: "orange"
      })
      return
    }
    
    // Use default template
    const defaultTemplate = AI_TEMPLATES[0]
    generateWithAI(defaultTemplate, topic)
  }

  return (
    <Card shadow="sm" radius="lg" withBorder p="xl">
      {/* Header */}
      <Group gap="md" mb="xl">
        <ThemeIcon size="xl" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
          <IconSparkles size={32} />
        </ThemeIcon>
        <div>
          <Text size="xl" fw={700} c="blue">Tulis Draft Artikel</Text>
          <Text c="dimmed">Buat draft artikel berdasarkan referensi dengan AI Magic! ✨</Text>
        </div>
      </Grid>

      {/* Input Section */}
      <TextInput
        size="lg"
        placeholder="Masukkan topik artikel... (contoh: Machine Learning untuk Analisis Data)"
        value={topic}
        onChange={(e) => setTopic(e.currentTarget.value)}
        mb="xl"
        styles={{
          input: {
            fontSize: '16px',
            padding: '12px 16px'
          }
        }}
      />

      {/* Tips */}
      <Alert icon={<IconBulb size={16} />} color="yellow" mb="xl">
        <Text size="sm">
          💡 <strong>Tips:</strong> Gunakan referensi dari tab "Referensi Pustaka" dan sitasi dari "Daftar Pustaka" untuk memperkuat artikel Anda.
        </Text>
      </Alert>

      {/* AI MAGIC BUTTONS - INI YANG KURANG! */}
      <Card withBorder p="md" bg="blue.0" mb="xl">
        <Text fw={600} mb="md" c="blue">🤖 AI MAGIC BUTTONS:</Text>
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Button
              fullWidth
              size="lg"
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
              leftSection={<IconRocket size={20} />}
              onClick={handleQuickGenerate}
              loading={isGenerating}
            >
              🚀 Generate dengan AI
            </Button>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Button
              fullWidth
              size="lg"
              variant="light"
              color="green"
              leftSection={<IconTemplate size={20} />}
              onClick={() => setShowTemplateModal(true)}
              disabled={isGenerating}
            >
              📝 Pilih Template AI
            </Button>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Button
              fullWidth
              size="lg"
              variant="light"
              color="purple"
              leftSection={<IconBrain size={20} />}
              onClick={() => {
                const refTemplate = AI_TEMPLATES.find(t => t.id === 'auto-reference')!
                generateWithAI(refTemplate, topic)
              }}
              disabled={isGenerating || !topic.trim()}
            >
              ✨ Auto-Draft dari Referensi
            </Button>
          </Grid.Col>
        </Grid>
      </Card>

      {/* Progress Section */}
      {isGenerating && (
        <StatusIndicator
          isLoading={true}
          progress={progress}
          stage={currentStage}
          timeElapsed={timeElapsed}
          timeRemaining={timeRemaining}
          type="ai"
          title="Sedang Membuat Draft Artikel"
          showDetails={true}
        />
      )}

      {/* Generated Content Preview */}
      {generatedContent && !isGenerating && (
        <Card withBorder p="lg" mt="xl">
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">📄 Draft yang Dihasilkan:</Text>
            <Badge color="green" variant="light">
              {generatedContent.split(' ').length} kata
            </Badge>
          </Group>
          
          <Card withBorder p="md" bg="gray.0" style={{ maxHeight: '400px', overflow: 'auto' }}>
            <Text size="sm" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
              {generatedContent}
            </Text>
          </Card>
          
          <Group mt="md" justify="flex-end">
            <Button variant="light" leftSection={<IconPlus size={16} />}>
              Gunakan Draft Ini
            </Button>
            <Button variant="outline">Edit Draft</Button>
          </Group>
        </Card>
      )}

      <Divider my="xl" />

      {/* Manual Tools - Existing ones */}
      <div>
        <Text fw={600} mb="md" c="gray">Manual Tools:</Text>
        <Group>
          <Button variant="light" leftSection={<IconPlus size={16} />}>
            + Tambah Paragraf
          </Button>
          <Button variant="light" leftSection={<IconQuote size={16} />}>
            " Sisipkan Kutipan
          </Button>
          <Button variant="light" leftSection={<IconList size={16} />}>
            - Daftar Poin
          </Button>
        </Group>
      </div>

      {/* Template Selection Modal */}
      <Modal
        opened={showTemplateModal}
        onClose={() => setShowTemplateModal(false)}
        title="Pilih Template AI untuk Draft"
        size="lg"
        centered
      >
        <Grid>
          {AI_TEMPLATES.map((template) => (
            <Grid.Col key={template.id} span={6}>
              <Card
                withBorder
                p="md"
                radius="md"
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  ':hover': { transform: 'translateY(-2px)' }
                }}
                onClick={() => {
                  setSelectedTemplate(template)
                  generateWithAI(template, topic)
                }}
              >
                <Stack align="center" gap="sm">
                  <ThemeIcon color={template.color} variant="light" size="lg">
                    <template.icon size={24} />
                  </ThemeIcon>
                  <div style={{ textAlign: 'center' }}>
                    <Text fw={600} size="sm">{template.name}</Text>
                    <Text size="xs" c="dimmed" mt="xs">
                      {template.description}
                    </Text>
                    <Badge size="xs" variant="light" mt="xs">
                      ~{template.estimatedTime}s
                    </Badge>
                  </div>
                </Stack>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Modal>
    </Card>
  )
}

export default EnhancedDraftInterface