"use client"

import {
  Container,
  Title,
  Text,
  SimpleGrid,
  Card,
  Button,
  List,
  ThemeIcon,
  Stack,
  Badge,
  Box,
  Group,
  Tabs,
  useMantineColorScheme,
} from "@mantine/core"
import { IconCheck, IconX } from "@tabler/icons-react"
import { useState } from "react"

const plans = {
  monthly: [
    {
      name: "Tulis",
      price: "Rp 0",
      period: "/bulan",
      description: "Sempurna untuk penulisan akademik individu",
      features: [
        { text: "Tulis draft artikel unlimited", included: true },
        { text: "Lihat dan kelola artikel", included: true },
        { text: "Daftar artikel terorganisir", included: true },
        { text: "Manajemen referensi otomatis", included: true },
        { text: "Annotasi dasar", included: true },
        { text: "Export PDF & Word", included: true },
        { text: "Dukungan email", included: true },
        { text: "Visualisasi artikel", included: false },
        { text: "Chat AI dengan dokumen", included: false },
        { text: "Kolaborasi tim", included: false },
      ],
      cta: "Mulai Uji Coba Gratis",
      popular: false,
    },
    {
      name: "Tulis-Ide",
      price: "Rp 0",
      period: "/bulan",
      description: "Ideal untuk peneliti aktif dengan kebutuhan visual",
      features: [
        { text: "Semua fitur Tulis", included: true },
        { text: "Visualisasi peta artikel", included: true },
        { text: "Grafik hubungan konsep", included: true },
        { text: "Chat AI dengan koleksi artikel", included: true },
        { text: "Annotasi lanjutan dengan highlight", included: true },
        { text: "Mind mapping otomatis", included: true },
        { text: "Export dalam semua format", included: true },
        { text: "Dukungan prioritas", included: true },
        { text: "Kolaborasi tim (hingga 3 orang)", included: false },
        { text: "Integrasi custom", included: false },
      ],
      cta: "Mulai Uji Coba Gratis",
      popular: true,
    },
    {
      name: "Kolaboratif",
      price: "Rp 0",
      period: "/bulan",
      description: "Untuk tim peneliti dan institusi",
      features: [
        { text: "Semua fitur Tulis-Ide", included: true },
        { text: "Kolaborasi tim unlimited", included: true },
        { text: "Co-writing real-time", included: true },
        { text: "Berbagi workspace", included: true },
        { text: "Komentar dan review kolaboratif", included: true },
        { text: "Version control artikel", included: true },
        { text: "Manajemen hak akses", included: true },
        { text: "Dashboard admin tim", included: true },
        { text: "Backup otomatis cloud", included: true },
        { text: "Dukungan 24/7", included: true },
      ],
      cta: "Hubungi Tim Penjualan",
      popular: false,
    },
  ],
  yearly: [
    {
      name: "Tulis",
      price: "Rp 0",
      period: "/bulan",
      description: "Sempurna untuk penulisan akademik individu",
      features: [
        { text: "Tulis draft artikel unlimited", included: true },
        { text: "Lihat dan kelola artikel", included: true },
        { text: "Daftar artikel terorganisir", included: true },
        { text: "Manajemen referensi otomatis", included: true },
        { text: "Annotasi dasar", included: true },
        { text: "Export PDF & Word", included: true },
        { text: "Dukungan email", included: true },
        { text: "Visualisasi artikel", included: false },
        { text: "Chat AI dengan dokumen", included: false },
        { text: "Kolaborasi tim", included: false },
      ],
      cta: "Mulai Uji Coba Gratis",
      popular: false,
    },
    {
      name: "Tulis-Ide",
      price: "Rp 0",
      period: "/bulan",
      description: "Ideal untuk peneliti aktif dengan kebutuhan visual",
      features: [
        { text: "Semua fitur Tulis", included: true },
        { text: "Visualisasi peta artikel", included: true },
        { text: "Grafik hubungan konsep", included: true },
        { text: "Chat AI dengan koleksi artikel", included: true },
        { text: "Annotasi lanjutan dengan highlight", included: true },
        { text: "Mind mapping otomatis", included: true },
        { text: "Export dalam semua format", included: true },
        { text: "Dukungan prioritas", included: true },
        { text: "Kolaborasi tim (hingga 3 orang)", included: false },
        { text: "Integrasi custom", included: false },
      ],
      cta: "Mulai Uji Coba Gratis",
      popular: true,
    },
    {
      name: "Kolaboratif",
      price: "Rp 0",
      period: "/bulan",
      description: "Untuk tim peneliti dan institusi",
      features: [
        { text: "Semua fitur Tulis-Ide", included: true },
        { text: "Kolaborasi tim unlimited", included: true },
        { text: "Co-writing real-time", included: true },
        { text: "Berbagi workspace", included: true },
        { text: "Komentar dan review kolaboratif", included: true },
        { text: "Version control artikel", included: true },
        { text: "Manajemen hak akses", included: true },
        { text: "Dashboard admin tim", included: true },
        { text: "Backup otomatis cloud", included: true },
        { text: "Dukungan 24/7", included: true },
      ],
      cta: "Hubungi Tim Penjualan",
      popular: false,
    },
  ],
}

export function PricingSection() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const { colorScheme } = useMantineColorScheme()

  return (
    <Box
      id="pricing"
      py={80}
      style={{
        backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))'
      }}
    >
      <Container size="xl">
        <Stack align="center" gap="xl" mb={60}>
          <Badge size="lg" variant="light" color="blue" radius="xl">
            Harga
          </Badge>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            Harga Sederhana dan Transparan
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Pilih paket yang sesuai dengan kebutuhan penelitian Anda. Semua paket termasuk uji coba gratis 14 hari.
          </Text>

          <Tabs value={billingPeriod} onChange={(value) => setBillingPeriod(value as "monthly" | "yearly")}>
            <Tabs.List grow>
              <Tabs.Tab value="monthly">Bulanan</Tabs.Tab>
              <Tabs.Tab value="yearly">
                Tahunan
                <Badge size="xs" variant="filled" color="green" ml="xs">
                  Hemat 20%
                </Badge>
              </Tabs.Tab>
            </Tabs.List>
          </Tabs>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="xl">
          {plans[billingPeriod].map((plan, index) => (
            <Card
              key={index}
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              style={{
                borderColor: plan.popular ? "var(--mantine-color-blue-6)" : undefined,
                borderWidth: plan.popular ? 2 : 1,
              }}
            >
              <Stack gap="md">
                {plan.popular && (
                  <Badge size="sm" variant="filled" color="blue" style={{ alignSelf: "center" }}>
                    Paling Populer
                  </Badge>
                )}

                <Stack gap="xs" ta="center">
                  <Title order={3} size="xl" fw={600}>
                    {plan.name}
                  </Title>
                  <Group gap="xs" justify="center">
                    <Text size="2.5rem" fw={700} c="blue">
                      {plan.price}
                    </Text>
                    <Text c="dimmed">{plan.period}</Text>
                  </Group>
                  <Text size="sm" c="dimmed">
                    {plan.description}
                  </Text>
                </Stack>

                <List spacing="sm" size="sm" center>
                  {plan.features.map((feature, featureIndex) => (
                    <List.Item
                      key={featureIndex}
                      icon={
                        <ThemeIcon size="sm" variant="light" color={feature.included ? "green" : "red"}>
                          {feature.included ? <IconCheck size={12} /> : <IconX size={12} />}
                        </ThemeIcon>
                      }
                    >
                      <Text c={feature.included ? undefined : "dimmed"}>{feature.text}</Text>
                    </List.Item>
                  ))}
                </List>

                <Button variant={plan.popular ? "filled" : "outline"} size="md" fullWidth mt="auto">
                  {plan.cta}
                </Button>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}