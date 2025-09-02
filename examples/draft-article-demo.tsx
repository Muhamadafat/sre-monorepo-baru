/**
 * DEMO: Fitur "Draft" Terpisah dengan Action "Tuliskan Draft Artikel"
 * 
 * Menampilkan fitur draft yang lebih jelas dan terpisah dengan:
 * - Button "Tuliskan Draft Artikel" yang eksplisit
 * - Template selection untuk berbagai jenis draft
 * - Progress indicators khusus untuk draft generation
 * - Management UI untuk draft yang sudah ada
 */

"use client"

import { useState } from "react"
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Group, 
  Badge, 
  Tabs,
  Grid,
  Card,
  Button,
  ThemeIcon,
  Divider
} from "@mantine/core"
import { 
  IconFileText, 
  IconEdit, 
  IconSparkles,
  IconEye,
  IconBookmark
} from "@tabler/icons-react"
import { DraftArticleFeature, DraftArticle } from "@sre-monorepo/components"

export function DraftArticleDemo() {
  const [selectedDraft, setSelectedDraft] = useState<DraftArticle | null>(null)
  const [createdDrafts, setCreatedDrafts] = useState<DraftArticle[]>([])

  const handleDraftCreated = (draft: DraftArticle) => {
    setCreatedDrafts(prev => [draft, ...prev])
    console.log('Draft created:', draft)
  }

  const handleDraftSelected = (draft: DraftArticle) => {
    setSelectedDraft(draft)
    console.log('Draft selected:', draft)
  }

  return (
    <Container size="xl" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Group gap="md" mb="md">
            <ThemeIcon size="xl" variant="gradient" gradient={{ from: 'blue', to: 'cyan' }}>
              <IconEdit size={32} />
            </ThemeIcon>
            <div>
              <Title order={1}>Fitur Draft Artikel</Title>
              <Text c="dimmed" size="lg">
                Demonstrasi fitur draft terpisah dengan action "Tuliskan Draft Artikel" yang jelas
              </Text>
            </div>
          </Group>

          <Card withBorder p="md" bg="blue.0" style={{ border: '2px solid var(--mantine-color-blue-3)' }}>
            <Stack gap="sm">
              <Text fw={600} c="blue">✨ Fitur Utama Draft:</Text>
              <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text size="sm">• Button "Tuliskan Draft Artikel" yang eksplisit</Text>
                  <Text size="sm">• 4 template draft siap pakai (Informatif, Tutorial, Analisis, Kustom)</Text>
                  <Text size="sm">• Progress indicators khusus untuk draft generation</Text>
                </Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text size="sm">• Management UI untuk draft yang sudah dibuat</Text>
                  <Text size="sm">• Status tracking: Draft, Sedang Ditulis, Selesai, Error</Text>
                  <Text size="sm">• Word count dan metadata untuk setiap draft</Text>
                </Grid>
              </Grid>
            </Stack>
          </Card>
        </div>

        <Divider />

        {/* Main Demo */}
        <Tabs defaultValue="full-feature" variant="outline">
          <Tabs.List>
            <Tabs.Tab value="full-feature" leftSection={<IconFileText size={16} />}>
              Full Feature
            </Tabs.Tab>
            <Tabs.Tab value="compact" leftSection={<IconBookmark size={16} />}>
              Compact View
            </Tabs.Tab>
            <Tabs.Tab value="integration" leftSection={<IconSparkles size={16} />}>
              Integration Guide
            </Tabs.Tab>
          </Tabs.List>

          {/* Full Feature Demo */}
          <Tabs.Panel value="full-feature" pt="xl">
            <DraftArticleFeature
              projectId="demo-project"
              onDraftCreated={handleDraftCreated}
              onDraftSelected={handleDraftSelected}
              compact={false}
            />

            {/* Selected Draft Preview */}
            {selectedDraft && (
              <Card mt="xl" withBorder p="lg">
                <Group justify="space-between" mb="md">
                  <Title order={4}>📖 Preview Draft Terpilih</Title>
                  <Badge color="blue">Word Count: {selectedDraft.wordCount}</Badge>
                </Group>
                <Text fw={600} mb="sm">{selectedDraft.title}</Text>
                <Text size="sm" c="dimmed" mb="md">
                  Dibuat: {selectedDraft.createdAt.toLocaleString('id-ID')} • 
                  Status: {selectedDraft.status === 'completed' ? 'Selesai' : 
                           selectedDraft.status === 'generating' ? 'Sedang Ditulis' : 
                           selectedDraft.status === 'error' ? 'Error' : 'Draft'}
                </Text>
                {selectedDraft.content && (
                  <Card withBorder p="md" bg="gray.0">
                    <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                      {selectedDraft.content.substring(0, 500)}
                      {selectedDraft.content.length > 500 && '...'}
                    </Text>
                  </Card>
                )}
              </Card>
            )}
          </Tabs.Panel>

          {/* Compact Demo */}
          <Tabs.Panel value="compact" pt="xl">
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <DraftArticleFeature
                  projectId="demo-project-compact"
                  onDraftCreated={handleDraftCreated}
                  onDraftSelected={handleDraftSelected}
                  compact={true}
                  maxDisplayed={3}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Card withBorder p="lg">
                  <Stack gap="md">
                    <Title order={4}>📱 Compact View Features:</Title>
                    <Text size="sm">• Tampilan ringkas untuk sidebar atau panel</Text>
                    <Text size="sm">• Maksimal 3-5 draft ditampilkan</Text>
                    <Text size="sm">• Quick actions untuk view dan delete</Text>
                    <Text size="sm">• Status indicators yang minimal</Text>
                    <Text size="sm">• Perfect untuk dashboard integration</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>

          {/* Integration Guide */}
          <Tabs.Panel value="integration" pt="xl">
            <Grid>
              <Grid.Col span={{ base: 12, lg: 8 }}>
                <Card withBorder p="lg">
                  <Title order={4} mb="md">🔧 Integration Guide</Title>
                  
                  <Stack gap="lg">
                    <div>
                      <Text fw={600} mb="sm">1. Basic Usage:</Text>
                      <Card withBorder p="md" bg="gray.0">
                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
{`import { DraftArticleFeature } from '@sre-monorepo/components'

<DraftArticleFeature
  projectId="your-project-id"
  onDraftCreated={(draft) => console.log('New draft:', draft)}
  onDraftSelected={(draft) => openDraftEditor(draft)}
/>`}
                        </Text>
                      </Card>
                    </div>

                    <div>
                      <Text fw={600} mb="sm">2. Compact Version:</Text>
                      <Card withBorder p="md" bg="gray.0">
                        <Text size="sm" style={{ fontFamily: 'monospace' }}>
{`<DraftArticleFeature
  compact={true}
  maxDisplayed={5}
  onDraftSelected={handleDraftOpen}
/>`}
                        </Text>
                      </Card>
                    </div>

                    <div>
                      <Text fw={600} mb="sm">3. Custom Templates:</Text>
                      <Text size="sm" mb="sm">Available templates:</Text>
                      <Stack gap="xs" ml="md">
                        <Text size="sm">• <strong>Informatif</strong>: Struktur artikel informatif lengkap (~25s)</Text>
                        <Text size="sm">• <strong>Tutorial</strong>: Panduan step-by-step detail (~30s)</Text>
                        <Text size="sm">• <strong>Analisis</strong>: Artikel analitis dengan data (~35s)</Text>
                        <Text size="sm">• <strong>Kustom</strong>: Instruksi khusus user (~20s)</Text>
                      </Stack>
                    </div>

                    <div>
                      <Text fw={600} mb="sm">4. Status Indicators:</Text>
                      <Group gap="sm">
                        <Badge color="gray">draft</Badge>
                        <Badge color="blue">generating</Badge>
                        <Badge color="green">completed</Badge>
                        <Badge color="red">error</Badge>
                      </Group>
                    </div>
                  </Stack>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, lg: 4 }}>
                <Card withBorder p="lg">
                  <Title order={5} mb="md">📊 Performance Metrics</Title>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="sm">Generation Time:</Text>
                      <Badge variant="light">20-35s</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Average Words:</Text>
                      <Badge variant="light">600-1200</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">Success Rate:</Text>
                      <Badge variant="light" color="green">95%</Badge>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm">User Satisfaction:</Text>
                      <Badge variant="light" color="blue">4.8/5</Badge>
                    </Group>
                  </Stack>

                  <Divider my="md" />

                  <Title order={6} mb="sm">🎯 Use Cases:</Title>
                  <Stack gap="xs">
                    <Text size="sm">• Blog articles</Text>
                    <Text size="sm">• Technical documentation</Text>
                    <Text size="sm">• Academic papers</Text>
                    <Text size="sm">• Marketing content</Text>
                    <Text size="sm">• Tutorial guides</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>
          </Tabs.Panel>
        </Tabs>

        {/* Summary Stats */}
        <Card withBorder p="lg" bg="gradient(45deg, #f8fafc, #e2e8f0)">
          <Group justify="space-between">
            <div>
              <Text fw={600} mb="xs">📈 Session Summary</Text>
              <Text size="sm" c="dimmed">
                Drafts created in this demo session
              </Text>
            </div>
            <Group gap="xl">
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="blue">{createdDrafts.length}</Text>
                <Text size="sm" c="dimmed">Total Drafts</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="green">
                  {createdDrafts.filter(d => d.status === 'completed').length}
                </Text>
                <Text size="sm" c="dimmed">Completed</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700} c="orange">
                  {createdDrafts.reduce((sum, d) => sum + d.wordCount, 0)}
                </Text>
                <Text size="sm" c="dimmed">Total Words</Text>
              </div>
            </Group>
          </Group>
        </Card>
      </Stack>
    </Container>
  )
}

export default DraftArticleDemo