'use client';

import React, { useState, useCallback } from 'react';
import {
  Modal,
  TextInput,
  Group,
  Button,
  Text,
  Stack,
  NumberInput,
} from '@mantine/core';
import { IconHash } from '@tabler/icons-react';

interface GoToLineModalProps {
  opened: boolean;
  onClose: () => void;
  onGoToLine?: (lineNumber: number) => void;
  maxLines?: number;
}

function GoToLineModal({
  opened,
  onClose,
  onGoToLine,
  maxLines = 1000,
}: GoToLineModalProps) {
  const [lineNumber, setLineNumber] = useState<number | string>('');

  const handleGoToLine = useCallback(() => {
    const line = typeof lineNumber === 'string' ? parseInt(lineNumber) : lineNumber;
    if (line && line > 0 && line <= maxLines) {
      onGoToLine?.(line);
      onClose();
    }
  }, [lineNumber, maxLines, onGoToLine, onClose]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleGoToLine();
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [handleGoToLine, onClose]);

  const handleClose = useCallback(() => {
    setLineNumber('');
    onClose();
  }, [onClose]);

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap="xs">
          <IconHash size={20} />
          <Text fw={600}>Pergi ke Baris</Text>
        </Group>
      }
      size="sm"
      centered
      padding="md"
    >
      <Stack gap="md">
        <NumberInput
          placeholder={`Masukkan nomor baris (1-${maxLines})`}
          value={lineNumber}
          onChange={setLineNumber}
          onKeyDown={handleKeyDown}
          min={1}
          max={maxLines}
          leftSection={<IconHash size={16} />}
          autoFocus
        />

        <Group justify="flex-end" gap="sm">
          <Button variant="subtle" onClick={handleClose}>
            Batal
          </Button>
          <Button
            onClick={handleGoToLine}
            disabled={!lineNumber || (typeof lineNumber === 'number' && (lineNumber < 1 || lineNumber > maxLines))}
          >
            Pergi
          </Button>
        </Group>

        <Text size="xs" c="dimmed">
          Tekan Enter untuk pergi atau Esc untuk membatal
        </Text>
      </Stack>
    </Modal>
  );
}

export default GoToLineModal;