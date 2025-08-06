"use client"
import {
  AppShell,
  Burger,
  Button,
  Container,
  Group,
  Text,
  UnstyledButton,
  ActionIcon,
  useMantineColorScheme,
  Image,
  Box
} from "@mantine/core"
import { useDisclosure } from "@mantine/hooks"
import { IconSun, IconMoon, IconBrain } from "@tabler/icons-react"
import Link from "next/link"
import { useEffect, useState } from "react" // Import useEffect and useState
import classes from "./HeroSection.module.css"

export function Header() {
  const [opened, { toggle }] = useDisclosure(false)
  const { colorScheme, toggleColorScheme } = useMantineColorScheme()
  const [mounted, setMounted] = useState(false) // Add mounted state

  useEffect(() => {
    setMounted(true) // Set mounted to true after component mounts on client
  }, [])

  const navItems = [
    { label: "Fitur", href: "#features" },
    { label: "Cara Kerja", href: "#how-it-works" },
    { label: "Testimoni", href: "#testimonials" },
    { label: "Harga", href: "#pricing" },
    { label: "Pertanyaan Umum", href: "#faq" },
  ]

  return (
    <AppShell.Header>
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%">
          {/* Logo */}
          <Group gap="xs">
            <Box>
                <Image
                src='/images/logoSRE.png'
                alt="My-SRE Dashboard"
                height={40}
                radius="xs"
                // className={classes.heroImage}
                />
            </Box>
            {/* <IconBrain size={32} color="var(--mantine-color-blue-6)" /> */}
            {/* <Text size="xl" fw={700} c="blue">
              mySRE
            </Text> */}
          </Group>

          {/* Desktop Navigation */}
          <Group gap="xl" visibleFrom="md">
            {navItems.map((item) => (
              <UnstyledButton
                key={item.label}
                component={Link}
                href={item.href}
                c="dimmed"
                fw={500}
                style={{ textDecoration: "none" }}
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </UnstyledButton>
            ))}
          </Group>

          {/* Desktop Actions */}
          <Group gap="md" visibleFrom="md">
            <ActionIcon variant="subtle" size="lg" onClick={() => toggleColorScheme()} aria-label="Toggle color scheme">
              {mounted && (colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />)}
              {!mounted && <IconMoon size={18} />} {/* Render a default icon on server */}
            </ActionIcon>
            <Button variant="subtle" component={Link} href="/signin">
              Masuk
            </Button>
            <Button component={Link} href="/signup">
              Mulai Sekarang
            </Button>
          </Group>

          {/* Mobile Menu */}
          <Group gap="md" hiddenFrom="md">
            <ActionIcon variant="subtle" size="lg" onClick={() => toggleColorScheme()} aria-label="Toggle color scheme">
              {mounted && (colorScheme === "dark" ? <IconSun size={18} /> : <IconMoon size={18} />)}
              {!mounted && <IconMoon size={18} />} {/* Render a default icon on server */}
            </ActionIcon>
            <Burger opened={opened} onClick={toggle} size="sm" />
          </Group>
        </Group>
      </Container>
    </AppShell.Header>
  )
}
