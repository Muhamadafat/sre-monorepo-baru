/**
 * Demo showcasing the enhanced status indicators with percentages and time estimates
 * 
 * This example demonstrates the improved user experience with:
 * 1. Real-time progress percentages
 * 2. Estimated time remaining
 * 3. Time elapsed tracking
 * 4. Stage-by-stage progress descriptions
 * 5. Smooth animations and visual feedback
 */

"use client"

import { useState } from "react"
import { Button, Stack, Group, Title, Text, Divider } from "@mantine/core"
import { StatusIndicator, STATUS_STAGES } from "@sre-monorepo/components"

export function StatusIndicatorDemo() {
  const [aiGenerating, setAiGenerating] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [fileUploading, setFileUploading] = useState(false)
  const [messagesLoading, setMessagesLoading] = useState(false)

  const simulateProcess = (setter: (val: boolean) => void, duration: number) => {
    setter(true)
    setTimeout(() => setter(false), duration)
  }

  return (
    <Stack gap="xl" p="md" style={{ maxWidth: 800, margin: "0 auto" }}>
      <div>
        <Title order={2} mb="md">Enhanced Status Indicators Demo</Title>
        <Text c="dimmed" mb="xl">
          Perjelas indikator status dengan menggunakan persentase dan perkiraan waktu tunggu untuk memberikan ekspektasi yang lebih baik kepada pengguna.
        </Text>
      </div>

      <Divider label="AI Article Generation" />
      <Group>
        <Button 
          onClick={() => simulateProcess(setAiGenerating, 11000)}
          disabled={aiGenerating}
        >
          Simulate AI Article Generation
        </Button>
      </Group>
      <StatusIndicator
        isLoading={aiGenerating}
        type="ai"
        title="Menghasilkan Artikel dengan AI"
        stages={STATUS_STAGES.AI_ARTICLE_GENERATION}
        showDetails={true}
      />

      <Divider label="Chat Response" />
      <Group>
        <Button 
          onClick={() => simulateProcess(setChatLoading, 18000)}
          disabled={chatLoading}
        >
          Simulate Chat Response
        </Button>
      </Group>
      <StatusIndicator
        isLoading={chatLoading}
        type="ai"
        title="AI Assistant"
        stages={STATUS_STAGES.CHAT_RESPONSE}
        showDetails={true}
      />

      <Divider label="File Upload" />
      <Group>
        <Button 
          onClick={() => simulateProcess(setFileUploading, 9000)}
          disabled={fileUploading}
        >
          Simulate File Upload
        </Button>
      </Group>
      <StatusIndicator
        isLoading={fileUploading}
        type="upload"
        title="Mengunggah Dokumen PDF"
        stages={STATUS_STAGES.FILE_UPLOAD}
        showDetails={true}
      />

      <Divider label="Loading Messages" />
      <Group>
        <Button 
          onClick={() => simulateProcess(setMessagesLoading, 3000)}
          disabled={messagesLoading}
        >
          Simulate Loading Messages
        </Button>
      </Group>
      <StatusIndicator
        isLoading={messagesLoading}
        type="loading"
        title="Memuat Pesan Sebelumnya"
        stages={STATUS_STAGES.LOADING_MESSAGES}
        showDetails={true}
        size="sm"
      />

      <Divider />
      
      <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px' }}>
        <Title order={4} mb="md">Fitur yang Ditingkatkan:</Title>
        <Stack gap="xs">
          <Text size="sm">✅ <strong>Persentase Progress Real-time</strong> - Menampilkan progres dalam bentuk persentase yang mudah dipahami</Text>
          <Text size="sm">✅ <strong>Estimasi Waktu Tersisa</strong> - Memberikan perkiraan waktu yang dibutuhkan untuk menyelesaikan proses</Text>
          <Text size="sm">✅ <strong>Tracking Waktu Berjalan</strong> - Menampilkan berapa lama proses sudah berlangsung</Text>
          <Text size="sm">✅ <strong>Deskripsi Stage yang Jelas</strong> - Menjelaskan tahap apa yang sedang diproses</Text>
          <Text size="sm">✅ <strong>Animasi yang Smooth</strong> - Memberikan feedback visual yang menarik dan responsif</Text>
          <Text size="sm">✅ <strong>Komponen yang Reusable</strong> - Dapat digunakan di berbagai bagian aplikasi dengan mudah</Text>
        </Stack>
      </div>
    </Stack>
  )
}

export default StatusIndicatorDemo