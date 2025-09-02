"use client"

import { Box, Group, Text, Progress, Badge, Loader, Card, Avatar, useMantineTheme, useMantineColorScheme } from "@mantine/core"
import { IconBrain, IconSparkles, IconClock } from "@tabler/icons-react"
import { useEffect, useState } from "react"

export interface StatusIndicatorProps {
  /**
   * Whether the process is currently running
   */
  isLoading: boolean
  
  /**
   * Progress percentage (0-100)
   */
  progress?: number
  
  /**
   * Current stage description
   */
  stage?: string
  
  /**
   * Time elapsed in seconds
   */
  timeElapsed?: number
  
  /**
   * Estimated time remaining in seconds
   */
  timeRemaining?: number
  
  /**
   * Type of process for different styling
   */
  type?: 'ai' | 'loading' | 'processing' | 'upload'
  
  /**
   * Size variant
   */
  size?: 'sm' | 'md' | 'lg'
  
  /**
   * Custom title
   */
  title?: string
  
  /**
   * Show detailed progress information
   */
  showDetails?: boolean
  
  /**
   * Maximum width of the component
   */
  maxWidth?: string | number
  
  /**
   * Custom stages for progress simulation
   */
  stages?: Array<{
    progress: number
    stage: string
    duration: number
  }>
}

export function StatusIndicator({
  isLoading,
  progress = 0,
  stage = "Memproses...",
  timeElapsed = 0,
  timeRemaining = 0,
  type = 'processing',
  size = 'md',
  title,
  showDetails = true,
  maxWidth = "85%",
  stages
}: StatusIndicatorProps) {
  const theme = useMantineTheme()
  const { colorScheme } = useMantineColorScheme()
  const isDark = colorScheme === 'dark'
  
  const [currentProgress, setCurrentProgress] = useState(progress)
  const [currentStage, setCurrentStage] = useState(stage)
  const [elapsed, setElapsed] = useState(timeElapsed)
  const [remaining, setRemaining] = useState(timeRemaining)

  // Auto-progress simulation when stages are provided
  useEffect(() => {
    if (!isLoading || !stages) return

    const startTime = Date.now()
    const totalEstimatedTime = stages.reduce((sum, s) => sum + s.duration, 0)
    let currentStageIndex = 0

    const progressInterval = setInterval(() => {
      const elapsedMs = Date.now() - startTime
      const elapsedSec = Math.floor(elapsedMs / 1000)
      setElapsed(elapsedSec)

      if (currentStageIndex < stages.length) {
        const currentStageData = stages[currentStageIndex]
        const nextStageTime = stages.slice(0, currentStageIndex + 1).reduce((sum, s) => sum + s.duration, 0)
        
        if (elapsedMs >= nextStageTime) {
          setCurrentProgress(currentStageData.progress)
          setCurrentStage(currentStageData.stage)
          currentStageIndex++
          
          const remainingSec = Math.max(0, Math.ceil((totalEstimatedTime - elapsedMs) / 1000))
          setRemaining(remainingSec)
        } else {
          // Smooth progress within current stage
          const stageStartTime = stages.slice(0, currentStageIndex).reduce((sum, s) => sum + s.duration, 0)
          const stageProgress = (elapsedMs - stageStartTime) / currentStageData.duration
          const prevProgress = currentStageIndex > 0 ? stages[currentStageIndex - 1].progress : 0
          const smoothProgress = prevProgress + (currentStageData.progress - prevProgress) * Math.min(stageProgress, 1)
          setCurrentProgress(Math.min(smoothProgress, currentStageData.progress))
        }
      }
    }, 100)

    return () => clearInterval(progressInterval)
  }, [isLoading, stages])

  // Update from props when not using auto-simulation
  useEffect(() => {
    if (!stages) {
      setCurrentProgress(progress)
      setCurrentStage(stage)
      setElapsed(timeElapsed)
      setRemaining(timeRemaining)
    }
  }, [progress, stage, timeElapsed, timeRemaining, stages])

  const getTypeConfig = () => {
    switch (type) {
      case 'ai':
        return {
          icon: IconBrain,
          title: title || "AI Assistant",
          color: theme.colors.blue[6],
          gradient: { from: "blue", to: "cyan" }
        }
      case 'loading':
        return {
          icon: IconSparkles,
          title: title || "Memuat",
          color: theme.colors.violet[6],
          gradient: { from: "violet", to: "purple" }
        }
      case 'upload':
        return {
          icon: IconClock,
          title: title || "Mengunggah",
          color: theme.colors.green[6],
          gradient: { from: "green", to: "teal" }
        }
      default:
        return {
          icon: IconSparkles,
          title: title || "Memproses",
          color: theme.colors.gray[6],
          gradient: { from: "gray", to: "dark" }
        }
    }
  }

  const config = getTypeConfig()
  const Icon = config.icon

  if (!isLoading) return null

  return (
    <Card
      shadow="sm"
      radius="xl"
      withBorder
      style={{
        alignSelf: "flex-start",
        background: isDark
          ? `linear-gradient(135deg, ${theme.colors.dark[6]} 0%, ${theme.colors.dark[7]} 100%)`
          : `linear-gradient(135deg, ${theme.colors.gray[0]} 0%, ${theme.colors.gray[1]} 100%)`,
        maxWidth,
        padding: size === 'sm' ? '12px' : size === 'lg' ? '24px' : '20px',
        border: `1px solid ${isDark ? theme.colors.dark[4] : theme.colors.gray[2]}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Progress bar at top */}
      {showDetails && (
        <Box
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: isDark ? theme.colors.dark[5] : theme.colors.gray[2],
            overflow: "hidden",
          }}
        >
          <Box
            style={{
              height: "100%",
              width: `${currentProgress}%`,
              background: `linear-gradient(90deg, ${config.color}, ${theme.colors.cyan[5]})`,
              backgroundSize: "200% 100%",
              animation: "shimmer 2s infinite",
              transition: "width 0.3s ease-out",
            }}
          />
        </Box>
      )}

      <Group mb={showDetails ? "xs" : 0} gap="sm" justify="space-between">
        <Group gap="sm">
          <Avatar
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'}
            radius="xl"
            style={{
              background: `linear-gradient(135deg, ${config.color} 0%, ${theme.colors.cyan[5]} 100%)`,
            }}
          >
            <Icon size={size === 'sm' ? 12 : size === 'lg' ? 20 : 16} color="white" />
          </Avatar>
          <Text 
            size={size === 'sm' ? 'xs' : size === 'lg' ? 'md' : 'sm'} 
            fw={600} 
            c={isDark ? theme.colors.gray[3] : theme.colors.gray[7]}
          >
            {config.title}
          </Text>
        </Group>
        
        {showDetails && (
          <Badge variant="light" color="blue" size={size === 'sm' ? 'xs' : 'sm'}>
            {Math.round(currentProgress)}%
          </Badge>
        )}
      </Group>

      {/* Status and loader */}
      <Group gap="xs" align="center" mb={showDetails ? "sm" : 0}>
        <Loader size={size === 'sm' ? 'xs' : 'sm'} color="blue" />
        <Text 
          size={size === 'sm' ? 'xs' : 'sm'} 
          c="dimmed" 
          fw={500}
          style={{ 
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            flex: 1
          }}
        >
          {currentStage}
        </Text>
        
        {/* Animated dots */}
        <Box style={{ display: "flex", gap: "2px", marginLeft: "8px" }}>
          {[0, 1, 2].map((i) => (
            <Box
              key={i}
              style={{
                width: size === 'sm' ? '3px' : '4px',
                height: size === 'sm' ? '3px' : '4px',
                borderRadius: "50%",
                backgroundColor: config.color,
                animation: `bounce 1.4s infinite ease-in-out both`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </Box>
      </Group>

      {/* Time information */}
      {showDetails && (elapsed > 0 || remaining > 0) && (
        <Group justify="space-between" gap="xs">
          {elapsed > 0 && (
            <Text size="xs" c="dimmed">
              Waktu: {elapsed}s
            </Text>
          )}
          {remaining > 0 && (
            <Text size="xs" c="dimmed">
              Tersisa: {remaining}s
            </Text>
          )}
        </Group>
      )}

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        
        @keyframes bounce {
          0%, 80%, 100% { 
            transform: scale(0);
          } 40% { 
            transform: scale(1.0);
          }
        }
      `}</style>
    </Card>
  )
}

// Pre-defined stage configurations for common use cases
export const STATUS_STAGES = {
  AI_ARTICLE_GENERATION: [
    { progress: 15, stage: "Menganalisis permintaan...", duration: 1500 },
    { progress: 35, stage: "Mencari informasi relevan...", duration: 2500 },
    { progress: 60, stage: "Menghasilkan konten...", duration: 4000 },
    { progress: 80, stage: "Menyempurnakan hasil...", duration: 2000 },
    { progress: 95, stage: "Menyelesaikan...", duration: 1000 },
    { progress: 100, stage: "Selesai!", duration: 200 },
  ],
  
  CHAT_RESPONSE: [
    { progress: 10, stage: "Memproses permintaan...", duration: 2000 },
    { progress: 25, stage: "Menganalisis konteks dokumen...", duration: 3000 },
    { progress: 45, stage: "Mencari informasi relevan...", duration: 4000 },
    { progress: 65, stage: "Menghasilkan respons...", duration: 5000 },
    { progress: 80, stage: "Menyempurnakan jawaban...", duration: 3000 },
    { progress: 95, stage: "Menyelesaikan...", duration: 1000 },
  ],
  
  FILE_UPLOAD: [
    { progress: 20, stage: "Mengunggah file...", duration: 2000 },
    { progress: 50, stage: "Memproses dokumen...", duration: 3000 },
    { progress: 80, stage: "Mengekstrak konten...", duration: 2500 },
    { progress: 95, stage: "Menyimpan...", duration: 1000 },
    { progress: 100, stage: "Berhasil!", duration: 500 },
  ],

  LOADING_MESSAGES: [
    { progress: 30, stage: "Memuat pesan...", duration: 1000 },
    { progress: 70, stage: "Menyiapkan tampilan...", duration: 1500 },
    { progress: 100, stage: "Selesai!", duration: 500 },
  ]
}

export default StatusIndicator