"use client"

import {
  Container,
  Title,
  Text,
  Timeline,
  ThemeIcon,
  Stack,
  Badge,
  Box,
  Group,
  Card,
  useMantineColorScheme,
} from "@mantine/core"
import { IconUpload, IconBrain, IconPencil, IconDownload } from "@tabler/icons-react"

const steps = [
  {
    icon: IconUpload,
    title: "Unggah Penelitian Anda",
    description:
      "Impor artikel penelitian, makalah, dan dokumen Anda ke dalam platform. AI kami akan menganalisis dan mengkategorikannya secara otomatis.",
    color: "blue",
  },
  {
    icon: IconBrain,
    title: "Bangun Peta Pengetahuan",
    description:
      "Saksikan artikel-artikel Anda diubah menjadi grafik pengetahuan interaktif yang mengungkap koneksi dan hubungan antar konsep.",
    color: "purple",
  },
  {
    icon: IconPencil,
    title: "Tulis dengan Bantuan AI",
    description:
      "Gunakan penulis cerdas kami untuk menyusun draft penelitian dengan saran AI, sitasi otomatis, dan manajemen referensi real-time.",
    color: "green",
  },
  {
    icon: IconDownload,
    title: "Unduh & Bagikan",
    description:
      "Unduh draft yang sudah selesai dalam berbagai format dan bagikan peta pengetahuan Anda dengan tim kolaborasi.",
    color: "orange",
  },
]

export function HowItWorksSection() {
  const { colorScheme } = useMantineColorScheme()
  return (
    <Box
      id="how-it-works"
      py={80}
      style={{
        backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))'
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl" mb={60}>
          <Badge size="lg" variant="light" color="blue" radius="xl">
            Cara Kerja
          </Badge>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            Dari Penelitian ke Draft dalam 4 Langkah Sederhana
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Alur kerja yang efisien membantu Anda mengubah penelitian yang tersebar menjadi draft akademik yang koheren 
            dan tersitasi dengan baik secara efisien.
          </Text>
        </Stack>

        <Timeline active={3} bulletSize={60} lineWidth={3} color="blue">
          {steps.map((step, index) => (
            <Timeline.Item
              key={index}
              bullet={
                <ThemeIcon size="xl" variant="filled" color={step.color}>
                  <step.icon size={24} />
                </ThemeIcon>
              }
            >
              <Card shadow="sm" padding="xl" radius="md" withBorder mt="md">
                <Group gap="md" mb="md">
                  <Badge size="lg" variant="light" color={step.color}>
                    Langkah {index + 1}
                  </Badge>
                </Group>
                <Title order={3} size="xl" fw={600} mb="sm">
                  {step.title}
                </Title>
                <Text c="dimmed">{step.description}</Text>
              </Card>
            </Timeline.Item>
          ))}
        </Timeline>
      </Container>
    </Box>
  )
}