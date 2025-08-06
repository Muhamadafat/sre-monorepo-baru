"use client"

import { Container, Title, Text, Button, Group, Stack, Box, ThemeIcon } from "@mantine/core"
import { IconArrowRight, IconCheck } from "@tabler/icons-react"
import classes from "./CTASection.module.css"

export function CTASection() {
  return (
    <Box className={classes.cta}>
      <Container size="xl" py={80}>
        <Stack align="center" gap="xl">
          <Title order={2} size="3rem" fw={700} ta="center" c="white">
            Siap Mengubah Proses Penelitian Anda?
          </Title>

          <Text size="xl" ta="center" c="white" opacity={0.9} maw={700}>
            Bergabunglah dengan ribuan peneliti yang telah merevolusi alur kerja mereka dengan bantuan penulisan bertenaga AI dan
            pemetaan pengetahuan visual.
          </Text>

          <Group gap="md" mt="md">
            <Button size="xl" variant="white" leftSection={<IconArrowRight size={20} />}>
              Mulai Uji Coba Gratis
            </Button>
            <Button size="xl" variant="outline" c="white" style={{ borderColor: "white" }}>
              Jadwalkan Demo
            </Button>
          </Group>

          <Group gap="xl" mt="lg">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="white" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm" c="white" opacity={0.9}>
                Uji coba gratis 14 hari
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="white" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm" c="white" opacity={0.9}>
                Tidak perlu kartu kredit
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="white" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm" c="white" opacity={0.9}>
                Batalkan kapan saja
              </Text>
            </Group>
          </Group>
        </Stack>
      </Container>
    </Box>
  )
}