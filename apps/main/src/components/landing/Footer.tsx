"use client"

import { Container, Group, Text, SimpleGrid, Stack, Anchor, Divider, ActionIcon, Box , Image} from "@mantine/core"
import { IconBrandTwitter, IconBrandLinkedin, IconBrandGithub, IconBrain } from "@tabler/icons-react"
import Link from "next/link"

const footerLinks = {
  product: [
    { label: "Fitur", href: "#features" },
    { label: "Harga", href: "#pricing" },
    { label: "API", href: "/api" },
    { label: "Integrasi", href: "/integrations" },
  ],
  resources: [
    { label: "Dokumentasi", href: "/docs" },
    { label: "Tutorial", href: "/tutorials" },
    { label: "Blog", href: "/blog" },
    { label: "Panduan Penelitian", href: "/guide" },
  ],
  company: [
    { label: "Tentang Kami", href: "/about" },
    { label: "Karir", href: "/careers" },
    { label: "Kontak", href: "/contact" },
    { label: "Kit Media", href: "/press" },
  ],
  legal: [
    { label: "Kebijakan Privasi", href: "/privacy" },
    { label: "Syarat Layanan", href: "/terms" },
    { label: "Kebijakan Cookie", href: "/cookies" },
    { label: "GDPR", href: "/gdpr" },
  ],
}

export function Footer() {
  return (
    <Box component="footer" bg="var(--mantine-color-gray-9)" c="white">
      <Container size="xl" py={60}>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 5 }} spacing="xl">
          <Stack gap="md">
            <Group gap="xs">
              {/* <IconBrain size={32} color="var(--mantine-color-blue-4)" /> */}
              <Box>
                <Image
                src='/images/LogoSRE.png'
                alt="My-SRE Dashboard"
                height={40}
                radius="xs"
                // className={classes.heroImage}
                />
            </Box>
              {/* <Text size="xl" fw={700} c="blue.4">
                My-SRE
              </Text> */}
            </Group>
            <Text size="sm" c="dimmed" maw={250}>
              Memberdayakan peneliti dengan alat bertenaga AI untuk penulisan cerdas dan pemetaan pengetahuan visual.
            </Text>
            <Group gap="xs">
              <ActionIcon variant="subtle" size="lg" color="gray">
                <IconBrandTwitter size={18} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="lg" color="gray">
                <IconBrandLinkedin size={18} />
              </ActionIcon>
              <ActionIcon variant="subtle" size="lg" color="gray">
                <IconBrandGithub size={18} />
              </ActionIcon>
            </Group>
          </Stack>

          <Stack gap="md">
            <Text fw={600} size="sm">
              Produk
            </Text>
            {footerLinks.product.map((link) => (
              <Anchor
                key={link.label}
                component={Link}
                href={link.href}
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                {link.label}
              </Anchor>
            ))}
          </Stack>

          <Stack gap="md">
            <Text fw={600} size="sm">
              Sumber Daya
            </Text>
            {footerLinks.resources.map((link) => (
              <Anchor
                key={link.label}
                component={Link}
                href={link.href}
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                {link.label}
              </Anchor>
            ))}
          </Stack>

          <Stack gap="md">
            <Text fw={600} size="sm">
              Perusahaan
            </Text>
            {footerLinks.company.map((link) => (
              <Anchor
                key={link.label}
                component={Link}
                href={link.href}
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                {link.label}
              </Anchor>
            ))}
          </Stack>

          <Stack gap="md">
            <Text fw={600} size="sm">
              Hukum
            </Text>
            {footerLinks.legal.map((link) => (
              <Anchor
                key={link.label}
                component={Link}
                href={link.href}
                size="sm"
                c="dimmed"
                style={{ textDecoration: "none" }}
              >
                {link.label}
              </Anchor>
            ))}
          </Stack>
        </SimpleGrid>

        <Divider my="xl" color="gray.8" />

        <Group justify="space-between">
          <Text size="sm" c="dimmed">
            © {new Date().getFullYear()} My-SRE. Hak cipta dilindungi undang-undang.
          </Text>
          <Group gap="md">
            <Anchor href="/privacy" size="sm" c="dimmed" style={{ textDecoration: "none" }}>
              Privasi
            </Anchor>
            <Anchor href="/terms" size="sm" c="dimmed" style={{ textDecoration: "none" }}>
              Syarat
            </Anchor>
            <Anchor href="/cookies" size="sm" c="dimmed" style={{ textDecoration: "none" }}>
              Cookie
            </Anchor>
          </Group>
        </Group>
      </Container>
    </Box>
  )
}
