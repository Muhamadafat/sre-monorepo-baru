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
];

export function KeyboardShortcutsModal({ opened, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconKeyboard size={20} />
          <Title order={4}>Keyboard Shortcuts</Title>
        </Group>
      }
      size="lg"
      centered
      padding="xl"
    >
      <Text size="sm" c="dimmed" mb="lg">
        Use these keyboard shortcuts to work more efficiently in the writer.
      </Text>

      <Stack gap="md">
        {shortcutGroups.map((group, groupIndex) => (
          <Box key={groupIndex}>
            <Group gap="xs" mb="sm">
              <IconCommand size={16} />
              <Text fw={600} size="sm">
                {group.title}
              </Text>
            </Group>
            
            <Paper withBorder p="xs" radius="md">
              <Table striped highlightOnHover>
                <Table.Tbody>
                  {group.shortcuts.map((shortcut, index) => (
                    <Table.Tr key={index}>
                      <Table.Td width="30%">
                        <Badge
                          variant="light"
                          color="blue"
                          size="sm"
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                          }}
                        >
                          {shortcut.keys}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{shortcut.description}</Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
            
            {groupIndex < shortcutGroups.length - 1 && <Divider my="md" />}
          </Box>
        ))}
      </Stack>

      <Divider my="xl" />

      <Text size="xs" c="dimmed" ta="center" component="div">
        💡 Tip: Most shortcuts work even when typing in text fields. Press <Badge size="xs" variant="outline">Ctrl + /</Badge> anytime to see this help.
      </Text>
    </Modal>
  );
}