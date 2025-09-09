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
  Tooltip,
  HoverCard,
} from "@mantine/core"
import {
  IconSparkles,
  IconBrain,
  IconTemplate,
  IconQuote,
  IconList,
  IconPlus,
  IconBulb,
  IconWand,
  IconRocket,
  IconEdit,
  IconX,
  IconCheck,
  IconTrash,
  IconHelp,
  IconInfoCircle,
} from "@tabler/icons-react"
import { StatusIndicator } from "@sre-monorepo/components"
import { notifications } from "@mantine/notifications"
import { modals } from "@mantine/modals"
import { useMantineTheme, useMantineColorScheme } from "@mantine/core"

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
    description: 'Generate draft otomatis berdasarkan referensi pustaka yang tersedia. Cocok untuk pemula yang ingin bantuan AI lengkap.',
    icon: IconBrain,
    color: 'blue',
    prompt: 'Buat draft artikel berdasarkan referensi pustaka yang ada, dengan struktur akademis yang baik',
    estimatedTime: 30
  },
  {
    id: 'structured',
    name: 'Template Terstruktur',
    description: 'Draft dengan struktur akademis lengkap (pendahuluan, metodologi, hasil, kesimpulan). Format paper ilmiah standar.',
    icon: IconTemplate,
    color: 'green',
    prompt: 'Buat draft artikel dengan struktur akademis: pendahuluan, tinjauan pustaka, metodologi, hasil, pembahasan, kesimpulan',
    estimatedTime: 35
  },
  {
    id: 'quick-outline',
    name: 'Outline Cepat',
    description: 'Generate outline dan kerangka artikel dengan cepat. Ideal untuk brainstorming awal dan perencanaan.',
    icon: IconRocket,
    color: 'orange',
    prompt: 'Buat outline dan kerangka artikel yang komprehensif dengan poin-poin utama',
    estimatedTime: 15
  },
  {
    id: 'citation-heavy',
    name: 'Heavy Citation',
    description: 'Draft dengan banyak sitasi dan referensi akademis. Untuk artikel review atau literature survey.',
    icon: IconQuote,
    color: 'purple',
    prompt: 'Buat draft artikel dengan banyak sitasi dan referensi yang mendukung setiap argumen',
    estimatedTime: 40
  }
]

export function EnhancedDraftInterface() {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  
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
        title: "📝 Input Diperlukan",
        message: `Sepertinya topik artikel belum diisi!\n\n💡 Tips untuk topik yang baik:\n• Gunakan 3-10 kata yang spesifik\n• Contoh: "Machine Learning untuk Analisis Data"\n• Hindari topik yang terlalu umum\n\n✍️ Silakan isi topik di kolom input di atas, lalu coba lagi!`,
        color: "orange",
        icon: <IconBulb size={16} />,
        autoClose: 6000,
        style: { whiteSpace: 'pre-line' }
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
        color: "green",
        icon: <IconCheck size={16} />
      })

    } catch (error) {
      console.error('Draft generation error:', error)
      
      // Enhanced user-friendly error handling
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network')
      const isTimeoutError = errorMessage.includes('timeout')
      
      let title = "🚫 Oops! Ada Kendala Teknis"
      let message = ""
      let troubleshootingSteps = []
      
      if (isNetworkError) {
        title = "🌐 Koneksi Internet Bermasalah"
        message = "Sepertinya ada masalah dengan koneksi internet Anda."
        troubleshootingSteps = [
          "🔄 Periksa koneksi internet Anda",
          "📶 Pastikan sinyal WiFi/data stabil", 
          "⏱️ Tunggu beberapa saat lalu coba lagi",
          "🔃 Refresh halaman jika perlu"
        ]
      } else if (isTimeoutError) {
        title = "⏰ Proses Memakan Waktu Lama"
        message = "AI sedang sibuk, mohon bersabar sebentar."
        troubleshootingSteps = [
          "⏳ Tunggu 30-60 detik lalu coba lagi",
          "📝 Coba topik yang lebih sederhana",
          "🔄 Refresh halaman untuk reset"
        ]
      } else {
        title = "⚠️ Terjadi Kesalahan Sistem"
        message = "Jangan khawatir, ini bukan salah Anda!"
        troubleshootingSteps = [
          "🔄 Coba lagi dalam beberapa saat",
          "📝 Pastikan topik tidak terlalu panjang (max 100 karakter)",
          "🌐 Periksa koneksi internet Anda",
          "🔃 Refresh halaman untuk memulai ulang",
          "💡 Gunakan topik yang lebih spesifik"
        ]
      }
      
      const troubleshootingText = troubleshootingSteps.join('\n')
      
      notifications.show({
        title,
        message: `${message}\n\n📋 Langkah Perbaikan:\n${troubleshootingText}`,
        color: "red",
        icon: <IconX size={16} />,
        autoClose: 8000, // Longer display time
        style: { whiteSpace: 'pre-line' } // Support line breaks
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
        title: "📝 Input Diperlukan",
        message: `Sepertinya topik artikel belum diisi!\n\n💡 Tips untuk topik yang baik:\n• Gunakan 3-10 kata yang spesifik\n• Contoh: "Machine Learning untuk Analisis Data"\n• Hindari topik yang terlalu umum\n\n✍️ Silakan isi topik di kolom input di atas, lalu coba lagi!`,
        color: "orange",
        icon: <IconBulb size={16} />,
        autoClose: 6000,
        style: { whiteSpace: 'pre-line' }
      })
      return
    }
    
    // Use default template
    const defaultTemplate = AI_TEMPLATES[0]
    generateWithAI(defaultTemplate, topic)
  }

  const handleClearAll = () => {
    modals.openConfirmModal({
      title: (
        <Text size="lg" fw={600} c="red">
          🗑️ Konfirmasi Bersihkan Data
        </Text>
      ),
      children: (
        <Stack gap="md">
          <Text size="sm">
            Apakah Anda yakin ingin menghapus semua data berikut?
          </Text>
          <Card withBorder p="md" bg="red.0">
            <Stack gap="xs">
              <Text size="sm" fw={500}>• Input topik artikel</Text>
              <Text size="sm" fw={500}>• Draft yang telah dibuat</Text>
              <Text size="sm" fw={500}>• Progress dan waktu</Text>
            </Stack>
          </Card>
          <Alert color="orange" icon={<IconBulb size={16} />}>
            <Text size="xs">
              Data yang dihapus tidak dapat dikembalikan. Pastikan Anda telah menyimpan draft penting.
            </Text>
          </Alert>
        </Stack>
      ),
      labels: { confirm: 'Ya, Bersihkan', cancel: 'Batal' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        setTopic("")
        setGeneratedContent("")
        setCurrentStage("")
        setProgress(0)
        setTimeElapsed(0)
        setTimeRemaining(0)
        
        notifications.show({
          title: "Berhasil dibersihkan",
          message: "Semua input dan output telah dikosongkan",
          color: "green",
          icon: <IconCheck size={16} />
        })
      }
    })
  }

  return (
    <Card 
      shadow="lg" 
      radius="xl" 
      withBorder 
      p="xl"
      style={{
        background: isDark 
          ? `linear-gradient(135deg, ${theme.colors.dark[6]} 0%, ${theme.colors.dark[7]} 100%)`
          : `linear-gradient(135deg, ${theme.colors.blue[0]} 0%, ${theme.colors.cyan[0]} 100%)`,
        borderColor: isDark ? theme.colors.dark[4] : theme.colors.blue[2]
      }}
      {/* Header */}
      <Group gap="md" mb="xl">
        <ThemeIcon 
          size="xl" 
          variant="gradient" 
          gradient={{ from: 'blue', to: 'cyan' }}
          style={{
            boxShadow: theme.shadows.md,
            border: `2px solid ${theme.colors.blue[1]}`
          }}
        >
          <IconSparkles size={32} />
        </ThemeIcon>
        <div style={{ flex: 1 }}>
          <Group gap="xs" align="center">
            <Text 
              size="xl" 
              fw={700} 
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan' }}
            >
              Tulis Draft Artikel
            </Text>
            <HoverCard width={320} shadow="md" position="bottom">
              <HoverCard.Target>
                <IconInfoCircle size={20} color={theme.colors.blue[5]} style={{ cursor: 'help' }} />
              </HoverCard.Target>
              <HoverCard.Dropdown>
                <Stack gap="xs">
                  <Text size="sm" fw={600}>💡 Tentang Fitur Draft</Text>
                  <Text size="xs">
                    • <strong>AI Magic Buttons</strong>: Generate draft otomatis dengan AI
                  </Text>
                  <Text size="xs">
                    • <strong>Template Sistem</strong>: Pilih struktur artikel sesuai kebutuhan
                  </Text>
                  <Text size="xs">
                    • <strong>Progress Tracking</strong>: Monitor proses pembuatan draft
                  </Text>
                  <Text size="xs">
                    • <strong>Preview & Edit</strong>: Lihat dan edit hasil sebelum digunakan
                  </Text>
                </Stack>
              </HoverCard.Dropdown>
            </HoverCard>
          </Group>
          <Text 
            c={isDark ? 'dimmed' : 'gray.6'}
            style={{ 
              fontStyle: 'italic',
              letterSpacing: '0.5px'
            }}
          >
            Buat draft artikel berdasarkan referensi dengan AI Magic! ✨
          </Text>
        </div>
      </Group>

      {/* Input Section */}
      <Group align="flex-end" mb="xl">
        <TextInput
          size="lg"
          placeholder="Masukkan topik artikel... (contoh: Machine Learning untuk Analisis Data)"
          value={topic}
          onChange={(e) => setTopic(e.currentTarget.value)}
          styles={{
            input: {
              fontSize: '16px',
              padding: '12px 16px',
              background: isDark 
                ? `linear-gradient(135deg, ${theme.colors.dark[5]} 0%, ${theme.colors.dark[4]} 100%)`
                : `linear-gradient(135deg, ${theme.colors.gray[0]} 0%, ${theme.colors.blue[0]} 100%)`,
              border: `2px solid ${isDark ? theme.colors.dark[3] : theme.colors.blue[2]}`,
              borderRadius: theme.radius.md,
              transition: 'all 0.3s ease',
              '&:focus': {
                borderColor: theme.colors.blue[5],
                boxShadow: `0 0 0 3px ${theme.colors.blue[1]}`,
                transform: 'translateY(-1px)'
              }
            }
          }}
          style={{ flex: 1 }}
        />
        <Button
          size="lg"
          variant="gradient"
          gradient={{ from: 'red.6', to: 'red.8' }}
          onClick={handleClearAll}
          disabled={isGenerating}
          title="Bersihkan input dan output"
          style={{
            boxShadow: theme.shadows.sm,
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: theme.shadows.md
            }
          }}
        >
          <IconTrash size={20} />
        </Button>
      </Group>

      {/* Tips */}
      <Alert icon={<IconBulb size={16} />} color="yellow" mb="xl">
        <Text size="sm">
          💡 <strong>Tips:</strong> Gunakan referensi dari tab "Referensi Pustaka" dan sitasi dari "Daftar Pustaka" untuk memperkuat artikel Anda.
        </Text>
      </Alert>

      {/* AI TOOLS SECTION - Enhanced Visibility */}
      <Card 
        withBorder 
        p="xl" 
        mb="xl"
        style={{
          background: isDark
            ? `linear-gradient(135deg, ${theme.colors.dark[4]} 0%, ${theme.colors.blue[8]} 15%, ${theme.colors.purple[8]} 30%, ${theme.colors.dark[4]} 100%)`
            : `linear-gradient(135deg, ${theme.colors.blue[0]} 0%, ${theme.colors.cyan[0]} 25%, ${theme.colors.purple[0]} 50%, ${theme.colors.blue[1]} 100%)`,
          borderColor: isDark ? theme.colors.blue[6] : theme.colors.blue[4],
          borderWidth: '3px',
          borderRadius: theme.radius.xl,
          boxShadow: isDark 
            ? `0 8px 32px ${theme.colors.blue[8]}40` 
            : `0 8px 32px ${theme.colors.blue[2]}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorative elements */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '100px',
          height: '100px',
          background: `linear-gradient(45deg, ${theme.colors.cyan[3]}20, ${theme.colors.blue[3]}20)`,
          borderRadius: '50%',
          zIndex: 0
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-30px',
          left: '-30px',
          width: '60px',
          height: '60px',
          background: `linear-gradient(45deg, ${theme.colors.purple[3]}20, ${theme.colors.blue[3]}20)`,
          borderRadius: '50%',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Group gap="md" align="center" mb="lg">
            <ThemeIcon 
              size="xl" 
              variant="gradient" 
              gradient={{ from: 'blue', to: 'purple' }}
              style={{
                boxShadow: `0 4px 16px ${theme.colors.blue[3]}`,
                border: `2px solid ${theme.colors.cyan[2]}`
              }}
            >
              <IconWand size={28} />
            </ThemeIcon>
            <div>
              <Text 
                fw={800} 
                variant="gradient"
                gradient={{ from: 'blue.6', to: 'purple.6' }}
                style={{ 
                  fontSize: '24px', 
                  letterSpacing: '1px',
                  textShadow: isDark ? `0 2px 4px ${theme.colors.dark[8]}` : 'none'
                }}
              >
                🤖 AI TOOLS
              </Text>
              <Text 
                size="sm" 
                c={isDark ? 'gray.4' : 'gray.6'}
                fw={500}
                style={{ letterSpacing: '0.5px' }}
              >
                Powered by Artificial Intelligence
              </Text>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Text 
                size="xs" 
                fw={600}
                variant="gradient"
                gradient={{ from: 'cyan', to: 'blue' }}
                style={{
                  padding: '4px 8px',
                  background: isDark ? theme.colors.dark[5] : theme.colors.blue[0],
                  borderRadius: theme.radius.sm,
                  border: `1px solid ${theme.colors.blue[3]}`
                }}
              >
                ✨ BETA
              </Text>
            </div>
          </Group>
        </div>
        
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Tooltip 
              label="🚀 Generate Cepat: Buat draft dengan template default dalam hitungan detik"
              position="bottom"
              withArrow
              multiline
              width={200}
            >
              <Button
                fullWidth
                size="lg"
                variant="gradient"
                gradient={{ from: 'blue.6', to: 'cyan.6' }}
                onClick={handleQuickGenerate}
                loading={isGenerating}
                title="Generate draft artikel dengan AI cepat"
                style={{
                  height: '60px',
                  borderRadius: theme.radius.lg,
                  boxShadow: `0 4px 15px ${theme.colors.blue[2]}`,
                  border: `2px solid ${theme.colors.blue[1]}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 25px ${theme.colors.blue[3]}`
                  }
                }}
              >
                <IconRocket size={32} />
              </Button>
            </Tooltip>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Tooltip 
              label="📋 Template Custom: Pilih struktur artikel yang sesuai (Akademis, Outline, Heavy Citation)"
              position="bottom"
              withArrow
              multiline
              width={220}
            >
              <Button
                fullWidth
                size="lg"
                variant="gradient"
                gradient={{ from: 'green.5', to: 'green.7' }}
                onClick={() => setShowTemplateModal(true)}
                disabled={isGenerating}
                title="Pilih template AI untuk draft artikel"
                style={{
                  height: '60px',
                  borderRadius: theme.radius.lg,
                  boxShadow: `0 4px 15px ${theme.colors.green[2]}`,
                  border: `2px solid ${theme.colors.green[1]}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 25px ${theme.colors.green[3]}`
                  }
                }}
              >
                <IconTemplate size={32} />
              </Button>
            </Tooltip>
          </Grid.Col>
          
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Tooltip 
              label="🧠 Auto-Reference: Generate draft otomatis berdasarkan referensi pustaka yang tersedia"
              position="bottom"
              withArrow
              multiline
              width={240}
            >
              <Button
                fullWidth
                size="lg"
                variant="gradient"
                gradient={{ from: 'purple.5', to: 'purple.7' }}
                onClick={() => {
                  const refTemplate = AI_TEMPLATES.find(t => t.id === 'auto-reference')!
                  generateWithAI(refTemplate, topic)
                }}
                disabled={isGenerating || !topic.trim()}
                title="Auto-Draft dari referensi pustaka dengan AI"
                style={{
                  height: '60px',
                  borderRadius: theme.radius.lg,
                  boxShadow: `0 4px 15px ${theme.colors.purple[2]}`,
                  border: `2px solid ${theme.colors.purple[1]}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: `0 8px 25px ${theme.colors.purple[3]}`
                  }
                }}
              >
                <IconBrain size={32} />
              </Button>
            </Tooltip>
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
            <Tooltip label="✅ Gunakan draft ini untuk menulis" withArrow>
              <Button 
                variant="light" 
                color="green"
                style={{ 
                  width: '50px', 
                  height: '40px', 
                  borderRadius: theme.radius.md 
                }}
                title="Gunakan draft ini untuk menulis"
              >
                <IconCheck size={20} />
              </Button>
            </Tooltip>
            <Tooltip label="✏️ Edit draft sebelum digunakan" withArrow>
              <Button 
                variant="outline"
                color="blue"
                style={{ 
                  width: '50px', 
                  height: '40px', 
                  borderRadius: theme.radius.md 
                }}
                title="Edit draft sebelum digunakan"
              >
                <IconEdit size={20} />
              </Button>
            </Tooltip>
          </Group>
        </Card>
      )}

      <Divider my="xl" />

      {/* Manual Tools - Enhanced dengan penjelasan */}
      <div>
        <Group gap="xs" align="center" mb="md">
          <Text fw={600} c="gray">Manual Tools</Text>
          <Tooltip label="Tools manual untuk editing artikel tanpa AI" withArrow>
            <IconInfoCircle size={16} color={theme.colors.gray[5]} style={{ cursor: 'help' }} />
          </Tooltip>
        </Group>
        <Group>
          <Tooltip label="➕ Tambah paragraf baru di posisi cursor" withArrow>
            <Button 
              variant="light" 
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: theme.radius.md 
              }}
            >
              <IconPlus size={24} />
            </Button>
          </Tooltip>
          <Tooltip label="📝 Sisipkan kutipan dari referensi pustaka" withArrow>
            <Button 
              variant="light" 
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: theme.radius.md 
              }}
            >
              <IconQuote size={24} />
            </Button>
          </Tooltip>
          <Tooltip label="📋 Buat daftar poin atau bullet points" withArrow>
            <Button 
              variant="light" 
              style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: theme.radius.md 
              }}
            >
              <IconList size={24} />
            </Button>
          </Tooltip>
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