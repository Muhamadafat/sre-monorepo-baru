"use client"

import { Container, Title, Text, Accordion, Stack, Badge, Box } from "@mantine/core"

const faqs = [
  {
    question: "Bagaimana cara kerja asisten AI untuk menulis?",
    answer:
      "Asisten AI kami menganalisis konteks penelitian Anda dan memberikan saran cerdas untuk struktur, konten, dan kutipan. Sistem ini belajar dari gaya penulisan dan domain penelitian Anda untuk memberikan bantuan yang semakin personal.",
  },
  {
    question: "Bisakah saya mengimpor perpustakaan penelitian yang sudah ada?",
    answer:
      "Tentu saja! Anda dapat mengimpor artikel penelitian dari berbagai sumber termasuk file PDF, tautan DOI, dan pengelola referensi populer seperti Zotero, Mendeley, dan EndNote. Sistem kami akan secara otomatis mengekstrak metadata dan membangun grafik pengetahuan Anda.",
  },
  {
    question: "Bagaimana cara kerja visualisasi Brain?",
    answer:
      "Brain menciptakan grafik pengetahuan interaktif di mana setiap artikel menjadi sebuah node, dan koneksi (edge) terbentuk berdasarkan konsep yang sama, kutipan, dan hubungan semantik. Anda dapat menjelajahi koneksi ini secara visual dan berdiskusi dengan AI tentang koleksi penelitian Anda.",
  },
  {
    question: "Format kutipan apa saja yang didukung?",
    answer:
      "Kami mendukung semua format kutipan utama termasuk APA, MLA, Chicago, Harvard, IEEE, dan banyak lagi. Paket Professional dan Enterprise juga memungkinkan pembuatan format kutipan khusus.",
  },
  {
    question: "Apakah data penelitian saya aman?",
    answer:
      "Tentu saja. Kami menggunakan enkripsi tingkat enterprise untuk semua data dalam transit dan saat disimpan. Data penelitian Anda tidak pernah dibagikan kepada pihak ketiga, dan Anda mempertahankan kepemilikan penuh atas konten Anda. Kami mematuhi GDPR dan mengikuti protokol perlindungan data yang ketat.",
  },
  {
    question: "Bisakah saya berkolaborasi dengan tim saya?",
    answer:
      "Ya! Paket Professional dan Enterprise menyediakan fitur kolaborasi tim. Anda dapat berbagi grafik pengetahuan, menulis draft bersama, dan mengelola akses tim ke berbagai proyek penelitian.",
  },
  {
    question: "Format ekspor apa saja yang tersedia?",
    answer:
      "Anda dapat mengekspor draft dalam berbagai format termasuk PDF, Word (DOCX), LaTeX, HTML, dan teks biasa. Daftar referensi dapat diekspor dalam berbagai format kutipan atau sebagai file BibTeX.",
  },
  {
    question: "Bagaimana cara kerja uji coba gratis?",
    answer:
      "Uji coba gratis 14 hari kami memberikan Anda akses penuh ke semua fitur dari paket yang Anda pilih. Tidak perlu kartu kredit untuk memulai, dan Anda dapat membatalkan kapan saja selama periode uji coba tanpa kewajiban apapun.",
  },
]

export function FAQSection() {
  return (
    <Box id="faq" py={80}>
      <Container size="md">
        <Stack align="center" gap="xl" mb={60}>
          <Badge size="lg" variant="light" color="blue" radius="xl">
            Pertanyaan Umum
          </Badge>
          <Title order={2} size="2.5rem" fw={700} ta="center">
            Pertanyaan yang Sering Diajukan
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={600}>
            Temukan jawaban untuk pertanyaan umum tentang ResearchCraft dan bagaimana aplikasi ini dapat membantu 
            menyederhanakan alur kerja penelitian Anda.
          </Text>
        </Stack>

        <Accordion variant="separated" radius="md">
          {faqs.map((faq, index) => (
            <Accordion.Item key={index} value={index.toString()}>
              <Accordion.Control>
                <Text fw={500}>{faq.question}</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <Text c="dimmed">{faq.answer}</Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))}
        </Accordion>
      </Container>
    </Box>
  )
}