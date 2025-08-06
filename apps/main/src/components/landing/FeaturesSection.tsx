"use client"

import { Container, Title, Text, SimpleGrid, Card, Group, ThemeIcon, Stack, Badge, Box } from "@mantine/core"
import {
  IconPencil,
  IconBrain,
  IconFileText,
  IconQuote,
  IconGraph,
  IconMessageChatbot,
  IconSearch,
  IconDownload,
  IconShare,
} from "@tabler/icons-react"

const features = [
  {
    icon: IconPencil,
    title: "Penulis Cerdas",
    description:
      "Asisten penulisan bertenaga AI yang membantu Anda membuat draft penelitian yang menarik dengan saran cerdas dan panduan struktur.",
    color: "blue",
    category: "Tulis",
  },
  {
    icon: IconQuote,
    title: "Manajemen Sitasi",
    description:
      "Sitasi artikel dari basis pengetahuan Brain Anda dengan mudah, termasuk format otomatis dan pembuatan daftar referensi.",
    color: "green",
    category: "Tulis",
  },
  {
    icon: IconFileText,
    title: "Daftar Referensi",
    description:
      "Daftar referensi yang dibuat secara otomatis dan terformat yang diperbarui secara real-time saat Anda menambah sitasi.",
    color: "orange",
    category: "Tulis",
  },
  {
    icon: IconBrain,
    title: "Peta Pengetahuan",
    description:
      "Sistem pemetaan pengetahuan visual yang mengorganisir artikel penelitian Anda menjadi jaringan grafik interaktif.",
    color: "purple",
    category: "Ide",
  },
  {
    icon: IconGraph,
    title: "Grafik Interaktif",
    description:
      "Jelajahi koneksi antar artikel melalui node dan edge, mengungkap hubungan tersembunyi dalam penelitian Anda.",
    color: "teal",
    category: "Ide",
  },
  {
    icon: IconMessageChatbot,
    title: "Asisten Chat AI",
    description: "Ajukan pertanyaan tentang koleksi penelitian Anda dan dapatkan wawasan cerdas dari basis pengetahuan.",
    color: "red",
    category: "Ide",
  },
//   {
//     icon: IconSearch,
//     title: "Pencarian Cerdas",
//     description:
//       "Temukan artikel dan koneksi yang relevan di seluruh koleksi penelitian Anda dengan kemampuan pencarian semantik.",
//     color: "indigo",
//     category: "Inti",
//   },
//   {
//     icon: IconDownload,
//     title: "Opsi Unduh",
//     description:
//       "Unduh draft dan referensi Anda dalam berbagai format termasuk PDF, Word, LaTeX, dan gaya sitasi.",
//     color: "cyan",
//     category: "Inti",
//   },
//   {
//     icon: IconShare,
//     title: "Kolaborasi",
//     description: "Bagikan draft penelitian dan grafik pengetahuan Anda dengan kolaborator untuk kerja tim yang seamless.",
//     color: "yellow",
//     category: "Inti",
//   },
]

export function FeaturesSection() {
  return (
    <Box id="features" py={80}>
      <Container size="xl">
        <Stack align="center" gap="xl" mb={60}>
          <Badge size="lg" variant="light" color="blue" radius="xl">
            Fitur
          </Badge>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            Semua yang Anda Butuhkan untuk Penelitian Unggul
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Platform komprehensif kami menggabungkan alat penulisan cerdas dengan manajemen pengetahuan visual 
            untuk merevolusi alur kerja penelitian Anda.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {features.map((feature, index) => (
            <Card key={index} shadow="sm" padding="xl" radius="md" withBorder>
              <Stack gap="md">
                <Group gap="md">
                  <ThemeIcon size="xl" variant="light" color={feature.color}>
                    <feature.icon size={24} />
                  </ThemeIcon>
                  <Badge size="sm" variant="dot" color={feature.color}>
                    {feature.category}
                  </Badge>
                </Group>
                <Title order={3} size="xl" fw={600}>
                  {feature.title}
                </Title>
                <Text c="dimmed" size="sm">
                  {feature.description}
                </Text>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}