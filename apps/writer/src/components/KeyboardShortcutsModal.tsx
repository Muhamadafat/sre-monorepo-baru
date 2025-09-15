'use client';

import React from 'react';
import {
  Modal,
  Text,
  Stack,
  Group,
  Badge,
  Table,
  Title,
  Divider,
  Box,
  Paper,
} from '@mantine/core';
import { IconKeyboard, IconCommand } from '@tabler/icons-react';

interface KeyboardShortcutsModalProps {
  opened: boolean;
  onClose: () => void;
}

interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    keys: string;
    description: string;
  }>;
}

const shortcutGroups: ShortcutGroup[] = [
  {
    title: 'Umum',
    shortcuts: [
      { keys: 'Ctrl + S', description: 'Simpan draft saat ini' },
      { keys: 'Ctrl + Alt + D', description: 'Buat draft/proyek baru' },
      { keys: 'Ctrl + /', description: 'Tampilkan dialog bantuan ini' },
      { keys: 'Ctrl + F', description: 'Cari dalam dokumen' },
      { keys: 'Ctrl + Z', description: 'Batalkan aksi terakhir' },
      { keys: 'Ctrl + Y', description: 'Ulangi aksi terakhir' },
    ],
  },
  {
    title: 'Format Teks',
    shortcuts: [
      { keys: 'Ctrl + B', description: 'Teks tebal' },
      { keys: 'Ctrl + I', description: 'Teks miring' },
      { keys: 'Ctrl + U', description: 'Garis bawah teks' },
      { keys: 'Ctrl + K', description: 'Sisipkan tautan' },
      { keys: 'Ctrl + Shift + L', description: 'Buat daftar berbutir' },
      { keys: 'Ctrl + Shift + O', description: 'Buat daftar bernomor' },
    ],
  },
  {
    title: 'Navigasi',
    shortcuts: [
      { keys: 'Ctrl + Home', description: 'Pergi ke awal dokumen' },
      { keys: 'Ctrl + End', description: 'Pergi ke akhir dokumen' },
      { keys: 'Ctrl + G', description: 'Pergi ke baris' },
      { keys: 'Escape', description: 'Tutup modal/menu' },
    ],
  },
  {
    title: 'Aksi Editor',
    shortcuts: [
      { keys: 'Ctrl + Enter', description: 'Buat konten AI' },
      { keys: 'Ctrl + D', description: 'Duplikasi baris/blok' },
      { keys: 'Ctrl + Shift + K', description: 'Hapus baris' },
      { keys: 'Tab', description: 'Indentasi teks' },
      { keys: 'Shift + Tab', description: 'Kurangi indentasi teks' },
    ],
  },
  {
    title: 'Fitur Lanjutan (Ahli)',
    shortcuts: [
      { keys: 'Ctrl + Alt + R', description: 'Sisipkan kutipan' },
      { keys: 'Ctrl + Shift + M', description: 'Sisipkan rumus matematika' },
      { keys: 'Ctrl + Shift + G', description: 'Buat konten AI' },
      { keys: 'Ctrl + Alt + B', description: 'Analisis referensi dengan AI' },
      { keys: 'Ctrl + Alt + W', description: 'Tampilkan jumlah kata' },
    ],
  },
  {
    title: 'Penyisipan Konten (Ahli)',
    shortcuts: [
      { keys: 'Ctrl + Shift + T', description: 'Sisipkan tabel' },
      { keys: 'Ctrl + Shift + I', description: 'Sisipkan placeholder gambar' },
      { keys: 'Ctrl + Shift + C', description: 'Sisipkan blok kode' },
      { keys: 'Ctrl + Alt + Q', description: 'Sisipkan blok kutipan' },
      { keys: 'Ctrl + Shift + P', description: 'Ekspor draft ke PDF' },
      { keys: 'F11', description: 'Toggle mode layar penuh' },
      { keys: 'Ctrl + H', description: 'Cari dan ganti' },
    ],
  },
  {
    title: 'Alur Kerja Draft (Akses Cepat)',
    shortcuts: [
      { keys: 'Ctrl + Shift + D', description: 'Buka daftar draft (akses cepat)' },
      { keys: 'Ctrl + Alt + L', description: 'Daftar draft terbaru' },
      { keys: 'Ctrl + Alt + D', description: 'Buat draft baru' },
      { keys: 'Ctrl + S', description: 'Simpan draft saat ini' },
    ],
  },
];

export function KeyboardShortcutsModal({ opened, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconKeyboard size={20} style={{
            transition: 'all 0.2s ease',
            transform: opened ? 'rotate(0deg)' : 'rotate(-5deg)',
          }} />
          <Title order={4} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>Pintasan Keyboard</Title>
        </Group>
      }
      size="xl"
      centered
      padding="xl"
      transitionProps={{
        transition: 'fade',
        duration: 200,
        timingFunction: 'ease-out',
      }}
      overlayProps={{
        backgroundOpacity: 0.35,
        blur: 3,
      }}
      styles={{
        body: {
          maxHeight: '70vh',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
        },
        content: {
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        },
      }}
    >
      <Text size="sm" c="dimmed" mb="lg" style={{
        lineHeight: 1.6,
        letterSpacing: '0.025em',
      }}>
        Gunakan pintasan keyboard ini untuk bekerja lebih efisien di editor.
      </Text>

      <Stack gap="md">
        {shortcutGroups.map((group, groupIndex) => (
          <Box key={groupIndex}>
            <Group gap="xs" mb="sm" style={{
              padding: '4px 0',
            }}>
              <IconCommand size={16} style={{
                color: '#667eea',
                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
              }} />
              <Text fw={600} size="sm" style={{
                color: '#4a5568',
                letterSpacing: '0.025em',
              }}>
                {group.title}
              </Text>
            </Group>
            
            <Paper withBorder p="xs" radius="md" style={{
              background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
              border: '1px solid rgba(102, 126, 234, 0.1)',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
            }}>
              <Table striped highlightOnHover style={{
                '--table-hover-color': 'rgba(102, 126, 234, 0.05)',
                '--table-striped-color': 'rgba(102, 126, 234, 0.02)',
              }}>
                <Table.Tbody>
                  {group.shortcuts.map((shortcut, index) => (
                    <Table.Tr key={index}>
                      <Table.Td width="30%">
                        <Badge
                          variant="light"
                          color="blue"
                          size="sm"
                          style={{
                            fontFamily: 'JetBrains Mono, Consolas, monospace',
                            fontSize: '0.75rem',
                            background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            color: '#4a5568',
                            fontWeight: 500,
                            letterSpacing: '0.5px',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {shortcut.keys}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" style={{
                          color: '#2d3748',
                          lineHeight: 1.5,
                          letterSpacing: '0.025em',
                        }}>{shortcut.description}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
            
            {groupIndex < shortcutGroups.length - 1 && <Divider my="md" style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.2) 50%, transparent 100%)',
              height: '1px',
              border: 'none',
            }} />}
          </Box>
        ))}
      </Stack>

      <Divider my="xl" style={{
        background: 'linear-gradient(90deg, transparent 0%, rgba(102, 126, 234, 0.3) 50%, transparent 100%)',
        height: '2px',
        border: 'none',
      }} />

      <Text size="xs" c="dimmed" ta="center" component="div" style={{
        padding: '12px 16px',
        background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
        borderRadius: '8px',
        border: '1px solid rgba(102, 126, 234, 0.1)',
        lineHeight: 1.6,
        letterSpacing: '0.025em',
      }}>
        💡 Tips: Sebagian besar pintasan berfungsi bahkan saat mengetik di bidang teks. Tekan <Badge size="xs" variant="outline" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          color: '#667eea',
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          borderRadius: '4px',
        }}>Ctrl + /</Badge> kapan saja untuk melihat bantuan ini.
      </Text>
    </Modal>
  );
}