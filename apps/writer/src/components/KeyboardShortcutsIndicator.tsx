'use client';

import React, { useState } from 'react';
import {
  ActionIcon,
  Tooltip,
  Transition,
  Group,
  Paper,
  Text,
  Stack,
  Badge,
  Box,
} from '@mantine/core';
import { IconKeyboard, IconQuestionMark } from '@tabler/icons-react';

interface KeyboardShortcutsIndicatorProps {
  onShowShortcuts?: () => void;
}

export function KeyboardShortcutsIndicator({ onShowShortcuts }: KeyboardShortcutsIndicatorProps) {
  const [hovering, setHovering] = useState(false);

  const quickShortcuts = [
    { key: 'Ctrl + S', action: 'Simpan' },
    { key: 'Ctrl + Alt + D', action: 'Draft Baru' },
    { key: 'Ctrl + B', action: 'Tebal' },
    { key: 'Ctrl + I', action: 'Miring' },
  ];

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
      }}
    >
      <Transition mounted={hovering} transition="fade" duration={200}>
        {(styles) => (
          <Paper
            shadow="lg"
            p="sm"
            radius="md"
            withBorder
            style={{
              ...styles,
              marginBottom: 8,
              backgroundColor: 'var(--mantine-color-body)',
            }}
          >
            <Stack gap="xs">
              <Text size="xs" fw={500} c="dimmed">
                Pintasan cepat:
              </Text>
              {quickShortcuts.map((shortcut, index) => (
                <Group key={index} justify="space-between" gap="md">
                  <Badge
                    size="xs"
                    variant="outline"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {shortcut.key}
                  </Badge>
                  <Text size="xs">{shortcut.action}</Text>
                </Group>
              ))}
              <Text size="xs" c="dimmed" ta="center">
                Tekan <Badge size="xs" variant="outline">Ctrl + /</Badge> untuk semua pintasan
              </Text>
            </Stack>
          </Paper>
        )}
      </Transition>

      <Tooltip
        label="Pintasan Keyboard (Ctrl + /)"
        position="left"
        withArrow
      >
        <ActionIcon
          size="lg"
          radius="xl"
          variant="filled"
          color="blue"
          onClick={onShowShortcuts}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          }}
        >
          <IconKeyboard size={20} />
        </ActionIcon>
      </Tooltip>
    </Box>
  );
}