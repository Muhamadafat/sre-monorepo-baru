"use client"

import {
  Container,
  Title,
  Text,
  Box,
  Grid,
  Stack,
  Group,
  Image,
  useMantineColorScheme,
  Card,
  Center,
  Flex,
} from "@mantine/core"

export function CollaborationSection() {
  const { colorScheme } = useMantineColorScheme()

  return (
    <Box
      id="collaboration"
      py={80}
      // style={{
      //   backgroundColor: 'light-dark(var(--mantine-color-gray-1), var(--mantine-color-dark-8))'
      // }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl" mb={60}>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            Kolaborasi Inovasi dari berbagai kalangan
          </Title>
        </Stack>

        <Grid gutter="xl">
          {/* Diprakarsai oleh */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              h="100%"
              bg={colorScheme === "dark" ? "white" : "white"}
            >
              <Stack align="center" gap="lg">
                <Title order={3} size="xl" fw={600} ta="center" c="dimmed">
                  Diprakarsai oleh:
                </Title>
                <Flex gap="md" w="100%" justify="center" align="center" wrap="wrap">
                  <Image
                    src="/images/brin.jpg"
                    alt="BRIN Logo"
                    h={120}
                    w="auto"
                    fit="contain"
                  />
                  <Image
                    src="/images/ub.png"
                    alt="Universitas Brawijaya Logo"
                    h={120}
                    w="auto"
                    fit="contain"
                  />
                </Flex>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Didanai oleh */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              h="100%"
              bg={colorScheme === "dark" ? "white" : "white"}
            >
              <Stack align="center" gap="lg">
                <Title order={3} size="xl" fw={600} ta="center" c="dimmed">
                  Didanai oleh:
                </Title>
                <Center>
                  <Image
                    src="/images/lpdp.png"
                    alt="LPDP Logo"
                    h={120}
                    w="auto"
                    fit="contain"
                  />
                </Center>
              </Stack>
            </Card>
          </Grid.Col>

          {/* Didukung oleh */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Card
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              h="100%"
              bg={colorScheme === "dark" ? "white" : "white"}
            >
              <Stack align="center" gap="lg">
                <Title order={3} size="xl" fw={600} ta="center" c="dimmed">
                  Didukung oleh:
                </Title>
                <Flex gap="md" w="100%" justify="center" align="center" wrap="wrap">
                  <Image
                    src="/images/unpas.png"
                    alt="Universitas Basundan Logo"
                    h={120}
                    w="auto"
                    fit="contain"
                  />
                  <Image
                    src="/images/telu.png"
                    alt="Telkom University Logo"
                    h={120}
                    w="auto"
                    fit="contain"
                  />
                </Flex>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>
      </Container>
    </Box>
  )
}