"use client"

import { Container, Title, Text, Button, Group, Stack, Badge, Image, Box, ThemeIcon } from "@mantine/core"
import { IconCheck, IconArrowRight } from "@tabler/icons-react"
import classes from "./HeroSection.module.css"
import { useRouter } from "next/navigation"

export function HeroSection() {
  const router = useRouter();

  return (
    <Box className={classes.hero}>
      <Container size="xl" py={80}>
        <Stack align="center" gap="xl">
          <Badge size="lg" variant="light" color="blue" radius="xl">
            {/* 🚀 Launching Soon - Join the Beta */}
            {/* Welcome */}
            💡 Akses Awal - Coba Sekarang!
          </Badge>

          <Title order={1} size="3.5rem" fw={900} ta="center" className={classes.title} maw={800}>
            Desain{" "}
            <Text component="span" c="blue" inherit>
              Draft
            </Text>{" "}
            Penelitian Anda dengan Tools Bertenaga AI
          </Title>

          <Text size="xl" className={classes.descriptionText} ta="center" maw={600}>
            Sederhanakan proses penelitian Anda dengan bantuan penulisan cerdas dan pemetaan pengetahuan visual. 
            Dari pembuatan draft hingga manajemen sitasi, kami siap membantu Anda.
          </Text>

          <Group gap="md">
            <Button size="lg" leftSection={<IconArrowRight size={18} />} 
            onClick={(e) => router.push('/signup')}
            >
              {/* Start Free Trial */}
              Mulai Sekarang
            </Button>
            <Button size="lg" variant="outline" onClick={(e) => router.push('/signin')}>
              {/* Watch Demo */}
              Masuk
            </Button>
          </Group>

          <Group gap="xl" mt="md">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm" className={classes.descriptionText}>
                {/* No credit card required */}
                Akses langsung
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm" className={classes.descriptionText}>
                {/* 14-day free trial */}
                Fitur lengkap
              </Text>
            </Group>
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="green">
                <IconCheck size={12} />
              </ThemeIcon>
              <Text size="sm" className={classes.descriptionText}>
                {/* Cancel anytime */}
                Penggunaan fleksibel
              </Text>
            </Group>
          </Group>

          <Box mt={60} w="100vh" maw={1000}>
            <Image
              src='/images/brainn.png'
              alt="My-SRE Dashboard"
              radius="lg"
              height={450}
              className={classes.heroImage}
            />
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}
