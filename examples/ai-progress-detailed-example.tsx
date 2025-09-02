/**
 * REVISI: Enhanced AI Progress dengan Persentase Waktu Detail
 * 
 * Ini contoh tampilan yang lebih lengkap saat AI lagi generate artikel
 * dengan persentase yang lebih prominent dan informasi waktu yang detail
 */

"use client"

import { useState, useEffect } from "react"
import { 
  Box, 
  Progress, 
  Text, 
  Group, 
  Badge, 
  Stack, 
  Card,
  Button,
  RingProgress,
  Center,
  ThemeIcon,
  Avatar
} from "@mantine/core"
import { IconBrain, IconClock, IconSparkles, IconCheck } from "@tabler/icons-react"

interface AIProgressState {
  isLoading: boolean
  progress: number
  stage: string
  timeElapsed: number
  timeRemaining: number
}

export function EnhancedAIProgressExample() {
  const [aiState, setAIState] = useState<AIProgressState>({
    isLoading: false,
    progress: 0,
    stage: "",
    timeElapsed: 0,
    timeRemaining: 0
  })

  // Simulate AI generation with detailed progress
  const startAIGeneration = () => {
    setAIState({ isLoading: true, progress: 0, stage: "Memulai...", timeElapsed: 0, timeRemaining: 18 })
    
    const stages = [
      { progress: 15, stage: "📝 Menganalisis permintaan artikel...", duration: 2000 },
      { progress: 30, stage: "🔍 Mencari informasi dan referensi...", duration: 3000 },
      { progress: 50, stage: "🤖 Menghasilkan konten dengan AI...", duration: 5000 },
      { progress: 70, stage: "✨ Menyempurnakan struktur artikel...", duration: 4000 },
      { progress: 85, stage: "📚 Menambahkan sitasi dan referensi...", duration: 2500 },
      { progress: 95, stage: "🎨 Memformat dan menyelesaikan...", duration: 1200 },
      { progress: 100, stage: "✅ Artikel berhasil dibuat!", duration: 300 },
    ]

    const startTime = Date.now()
    let currentStageIndex = 0

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const elapsedSec = Math.floor(elapsed / 1000)
      
      if (currentStageIndex < stages.length) {
        const currentStage = stages[currentStageIndex]
        const totalTime = stages.reduce((sum, s) => sum + s.duration, 0)
        const passedTime = stages.slice(0, currentStageIndex + 1).reduce((sum, s) => sum + s.duration, 0)
        
        // Smooth progress calculation
        const stageStartTime = stages.slice(0, currentStageIndex).reduce((sum, s) => sum + s.duration, 0)
        const stageProgress = Math.min((elapsed - stageStartTime) / currentStage.duration, 1)
        const prevProgress = currentStageIndex > 0 ? stages[currentStageIndex - 1].progress : 0
        const currentProgress = prevProgress + (currentStage.progress - prevProgress) * stageProgress

        setAIState({
          isLoading: true,
          progress: Math.min(currentProgress, currentStage.progress),
          stage: currentStage.stage,
          timeElapsed: elapsedSec,
          timeRemaining: Math.max(0, Math.ceil((totalTime - elapsed) / 1000))
        })

        if (elapsed >= passedTime) {
          currentStageIndex++
        }
      } else {
        clearInterval(interval)
        setAIState(prev => ({ ...prev, isLoading: false }))
      }
    }, 100)
  }

  const resetDemo = () => {
    setAIState({ isLoading: false, progress: 0, stage: "", timeElapsed: 0, timeRemaining: 0 })
  }

  if (!aiState.isLoading && aiState.progress === 0) {
    return (
      <Card p="xl" radius="lg" withBorder style={{ maxWidth: 600, margin: "0 auto" }}>
        <Stack align="center" gap="xl">
          <ThemeIcon size={60} radius="xl" variant="gradient" gradient={{ from: "blue", to: "cyan" }}>
            <IconBrain size={30} />
          </ThemeIcon>
          <Text size="xl" fw={600} ta="center">
            Enhanced AI Progress Demo
          </Text>
          <Text c="dimmed" ta="center">
            Klik tombol di bawah untuk melihat progress AI generation dengan persentase waktu yang detail
          </Text>
          <Button 
            size="lg" 
            variant="gradient" 
            gradient={{ from: "blue", to: "cyan" }}
            onClick={startAIGeneration}
            leftSection={<IconSparkles size={20} />}
          >
            Generate Artikel dengan AI
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Card 
      shadow="lg" 
      radius="xl" 
      withBorder 
      p="xl"
      style={{ 
        maxWidth: 700, 
        margin: "0 auto",
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        border: '2px solid #3b82f6'
      }}
    >
      <Stack gap="xl">
        {/* Header dengan Avatar dan Status */}
        <Group justify="space-between" align="center">
          <Group gap="md">
            <Avatar
              size="lg"
              radius="xl"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              }}
            >
              <IconBrain size={24} color="white" />
            </Avatar>
            <div>
              <Text size="lg" fw={700} c="blue">
                AI Article Generator
              </Text>
              <Text size="sm" c="dimmed">
                Sedang membuat artikel berkualitas...
              </Text>
            </div>
          </Group>
          
          {/* Persentase Progress BESAR */}
          <RingProgress
            size={80}
            thickness={8}
            sections={[{ value: aiState.progress, color: 'blue' }]}
            label={
              <Center>
                <Text size="xl" fw={900} c="blue">
                  {Math.round(aiState.progress)}%
                </Text>
              </Center>
            }
          />
        </Group>

        {/* Stage Description */}
        <Box>
          <Text 
            size="lg" 
            fw={600}
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
            mb="md"
          >
            {aiState.stage}
          </Text>
          
          {/* Enhanced Progress Bar */}
          <Progress
            value={aiState.progress}
            size="xl"
            radius="xl"
            color="blue"
            style={{ height: "16px" }}
            striped
            animated
          />
        </Box>

        {/* Detailed Time Information */}
        <Card withBorder radius="md" p="md" bg="rgba(59, 130, 246, 0.05)">
          <Stack gap="md">
            {/* Time Stats Row */}
            <Group justify="space-between" align="center">
              <Group gap="sm">
                <ThemeIcon size="sm" color="gray" variant="light">
                  <IconClock size={14} />
                </ThemeIcon>
                <div>
                  <Text size="xs" c="dimmed" fw={500}>WAKTU BERJALAN</Text>
                  <Text size="md" fw={700} c="dark">
                    {Math.floor(aiState.timeElapsed / 60)}:{(aiState.timeElapsed % 60).toString().padStart(2, '0')}
                  </Text>
                </div>
              </Group>

              <Group gap="sm">
                <ThemeIcon size="sm" color="blue" variant="light">
                  <IconSparkles size={14} />
                </ThemeIcon>
                <div style={{ textAlign: 'right' }}>
                  <Text size="xs" c="dimmed" fw={500}>ESTIMASI TERSISA</Text>
                  <Text size="md" fw={700} c="blue">
                    {Math.floor(aiState.timeRemaining / 60)}:{(aiState.timeRemaining % 60).toString().padStart(2, '0')}
                  </Text>
                </div>
              </Group>
            </Group>

            {/* Progress Breakdown */}
            <Group justify="space-between" align="center">
              <Badge variant="light" color="gray" size="lg">
                Progress: {(aiState.progress).toFixed(1)}%
              </Badge>
              
              <Badge variant="light" color="blue" size="lg">
                {aiState.timeElapsed > 0 && aiState.timeRemaining > 0 
                  ? `${Math.round((aiState.timeElapsed / (aiState.timeElapsed + aiState.timeRemaining)) * 100)}% waktu terlewati`
                  : 'Menghitung...'
                }
              </Badge>
            </Group>

            {/* Speed Indicator */}
            {aiState.timeElapsed > 0 && (
              <Group justify="center">
                <Badge variant="gradient" gradient={{ from: 'blue', to: 'cyan' }} size="md">
                  🚀 Kecepatan: ~{Math.round(aiState.progress / Math.max(aiState.timeElapsed, 1))}% per detik
                </Badge>
              </Group>
            )}

            {/* ETA */}
            {aiState.timeRemaining > 0 && (
              <Group justify="center">
                <Text size="sm" c="blue" fw={600} ta="center">
                  📅 Estimasi Selesai: {new Date(Date.now() + aiState.timeRemaining * 1000).toLocaleTimeString('id-ID')}
                </Text>
              </Group>
            )}
          </Stack>
        </Card>

        {/* Success State */}
        {aiState.progress >= 100 && !aiState.isLoading && (
          <Card withBorder radius="md" p="lg" bg="rgba(34, 197, 94, 0.1)" style={{ border: '2px solid #22c55e' }}>
            <Group justify="center" gap="md">
              <ThemeIcon size="xl" color="green" variant="light">
                <IconCheck size={24} />
              </ThemeIcon>
              <div>
                <Text size="lg" fw={700} c="green">
                  ✅ Artikel Berhasil Dibuat!
                </Text>
                <Text size="sm" c="dimmed">
                  Total waktu: {aiState.timeElapsed} detik
                </Text>
              </div>
            </Group>
            
            <Group justify="center" mt="md">
              <Button variant="light" color="green" onClick={resetDemo}>
                Coba Lagi
              </Button>
            </Group>
          </Card>
        )}
      </Stack>
    </Card>
  )
}

export default EnhancedAIProgressExample