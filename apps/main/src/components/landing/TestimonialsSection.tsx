"use client"

import { Container, Title, Text, SimpleGrid, Card, Group, Avatar, Stack, Badge, Box, Rating } from "@mantine/core";
import { IconUser } from '@tabler/icons-react'

const testimonials = [
  {
    name: "Rio Nurtantyana S.Pd., M.Pd., M.Sc., Ph.D.",
    role: "Peneliti, BRIN",
    avatar: <IconUser size={16}/>,
    rating: 5,
    content:
      "Platform ini sangat membantu dan mudah digunakan bagi para peneliti dan mahasiswa dalam mencari ide riset dan menulis artikel ilmiah bersama dengan AI",
  },
  {
    name: "M. Luthfi Zahran",
    role: "Mahasiswa, Universitas Brawijaya",
    avatar: <IconUser size={16}/>,
    rating: 5,
    content:
      "Asisten penulisan AI-nya luar biasa membantu. Sangat mudah untuk menyusun kerangka penelitian dan memastikan format sitasi selalu benar. Benar-benar mengubah cara saya menulis karya ilmiah.",
  },
  {
    name: "Rangga Yovie Saputra",
    role: "Mahasiswa, Oxford",
    avatar: <IconUser size={16}/>,
    rating: 5,
    content:
      "Saya sudah menggunakan My-SRE untuk proyek penelitian kolaboratif tim. Kemampuan berbagi peta pengetahuan dan menulis draft bersama-sama benar-benar meningkatkan produktivitas kami secara signifikan.",
  },
]

export function TestimonialsSection() {
  return (
    <Box id="testimonials" py={80}>
      <Container size="xl">
        <Stack align="center" gap="xl" mb={60}>
          <Badge size="lg" variant="light" color="blue" radius="xl">
            Testimoni
          </Badge>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            Dipercaya oleh Peneliti & Mahasiswa
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Bergabunglah dengan ribuan peneliti, akademisi, dan mahasiswa yang telah mentransformasi alur kerja penelitian mereka dengan
            My-SRE.
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {testimonials.map((testimonial, index) => (
            <Card key={index} shadow="sm" padding="xl" radius="md" withBorder h="100%">
              <Stack gap="md" h="100%">
                <Rating value={testimonial.rating} readOnly size="sm" />
                <Text size="sm" style={{ flexGrow: 1 }}>
                  "{testimonial.content}"
                </Text>
                <Group gap="md">
                  {testimonial.avatar}
                  <Stack gap={0}>
                    <Text fw={600} size="sm">
                      {testimonial.name}
                    </Text>
                    <Text c="dimmed" size="xs">
                      {testimonial.role}
                    </Text>
                  </Stack>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
