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
    title: 'General',
    shortcuts: [
      { keys: 'Ctrl + S', description: 'Save current draft' },
      { keys: 'Ctrl + Alt + D', description: 'Create new draft/project' },
      { keys: 'Ctrl + /', description: 'Show this help dialog' },
      { keys: 'Ctrl + F', description: 'Search in document' },
      { keys: 'Ctrl + Z', description: 'Undo last action' },
      { keys: 'Ctrl + Y', description: 'Redo last action' },
    ],
  },
  {
    title: 'Text Formatting',
    shortcuts: [
      { keys: 'Ctrl + B', description: 'Bold text' },
      { keys: 'Ctrl + I', description: 'Italic text' },
      { keys: 'Ctrl + U', description: 'Underline text' },
      { keys: 'Ctrl + K', description: 'Insert link' },
      { keys: 'Ctrl + Shift + L', description: 'Create bulleted list' },
      { keys: 'Ctrl + Shift + O', description: 'Create numbered list' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: 'Ctrl + Home', description: 'Go to beginning of document' },
      { keys: 'Ctrl + End', description: 'Go to end of document' },
      { keys: 'Ctrl + G', description: 'Go to line' },
      { keys: 'Escape', description: 'Close modals/menus' },
    ],
  },
  {
    title: 'Editor Actions',
    shortcuts: [
      { keys: 'Ctrl + Enter', description: 'Generate AI content' },
      { keys: 'Ctrl + D', description: 'Duplicate line/block' },
      { keys: 'Ctrl + Shift + K', description: 'Delete line' },
      { keys: 'Tab', description: 'Indent text' },
      { keys: 'Shift + Tab', description: 'Outdent text' },
    ],
  },
  {
    title: 'Advanced Features (Expert)',
    shortcuts: [
      { keys: 'Ctrl + Alt + R', description: 'Insert citation' },
      { keys: 'Ctrl + Shift + M', description: 'Insert mathematical formula' },
      { keys: 'Ctrl + Shift + G', description: 'Generate AI content' },
      { keys: 'Ctrl + Alt + B', description: 'Analyze references with AI' },
      { keys: 'Ctrl + Alt + W', description: 'Show word count' },
    ],
  },
  {
    title: 'Content Insertion (Expert)',
    shortcuts: [
      { keys: 'Ctrl + Shift + T', description: 'Insert table' },
      { keys: 'Ctrl + Shift + I', description: 'Insert image placeholder' },
      { keys: 'Ctrl + Shift + C', description: 'Insert code block' },
      { keys: 'Ctrl + Alt + Q', description: 'Insert quote block' },
      { keys: 'Ctrl + Shift + P', description: 'Export draft to PDF' },
      { keys: 'F11', description: 'Toggle fullscreen mode' },
      { keys: 'Ctrl + H', description: 'Find and replace' },
    ],
  },
  {
    title: 'Draft Workflow (Quick Access)',
    shortcuts: [
      { keys: 'Ctrl + Shift + D', description: 'Open draft list (quick access)' },
      { keys: 'Ctrl + Alt + L', description: 'List recent drafts' },
      { keys: 'Ctrl + Alt + D', description: 'Create new draft' },
      { keys: 'Ctrl + S', description: 'Save current draft' },
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
          }}>Keyboard Shortcuts</Title>
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
        Use these keyboard shortcuts to work more efficiently in the writer.
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
        💡 Tip: Most shortcuts work even when typing in text fields. Press <Badge size="xs" variant="outline" style={{
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(102, 126, 234, 0.3)',
          color: '#667eea',
          fontFamily: 'JetBrains Mono, Consolas, monospace',
          borderRadius: '4px',
        }}>Ctrl + /</Badge> anytime to see this help.
      </Text>
    </Modal>
  );
}