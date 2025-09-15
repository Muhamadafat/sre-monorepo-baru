'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  TextInput,
  Group,
  ActionIcon,
  Text,
  Badge,
  Stack,
  Paper,
  Box,
  Divider,
} from '@mantine/core';
import {
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconX,
  IconReplace,
} from '@tabler/icons-react';

interface SearchModalProps {
  opened: boolean;
  onClose: () => void;
  searchMode?: 'search' | 'replace';
  onSearch?: (query: string) => void;
  onReplace?: (searchQuery: string, replaceQuery: string) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  currentMatch?: number;
  totalMatches?: number;
}

function SearchModal({
  opened,
  onClose,
  searchMode = 'search',
  onSearch,
  onReplace,
  onNext,
  onPrevious,
  currentMatch = 0,
  totalMatches = 0,
}: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');

  const handleSearch = useCallback(() => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery);
    }
  }, [searchQuery, onSearch]);

  const handleReplace = useCallback(() => {
    if (searchQuery.trim() && replaceQuery.trim()) {
      onReplace?.(searchQuery, replaceQuery);
    }
  }, [searchQuery, replaceQuery, onReplace]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      if (event.shiftKey) {
        onPrevious?.();
      } else {
        onNext?.();
      }
    } else if (event.key === 'Escape') {
      onClose();
    }
  }, [onNext, onPrevious, onClose]);

  useEffect(() => {
    if (opened && searchQuery) {
      handleSearch();
    }
  }, [searchQuery, opened, handleSearch]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          {searchMode === 'replace' ? <IconReplace size={20} /> : <IconSearch size={20} />}
          <Text fw={600}>
            {searchMode === 'replace' ? 'Cari dan Ganti' : 'Cari dalam Dokumen'}
          </Text>
        </Group>
      }
      size="md"
      centered
      padding="md"
    >
      <Stack gap="md">
        <TextInput
          placeholder="Masukkan kata yang dicari..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.currentTarget.value)}
          onKeyDown={handleKeyDown}
          leftSection={<IconSearch size={16} />}
          rightSection={
            totalMatches > 0 && (
              <Group gap="xs">
                <Badge size="sm" variant="light">
                  {currentMatch + 1}/{totalMatches}
                </Badge>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={onPrevious}
                  disabled={totalMatches === 0}
                >
                  <IconChevronUp size={14} />
                </ActionIcon>
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  onClick={onNext}
                  disabled={totalMatches === 0}
                >
                  <IconChevronDown size={14} />
                </ActionIcon>
              </Group>
            )
          }
          autoFocus
        />

        {searchMode === 'replace' && (
          <TextInput
            placeholder="Ganti dengan..."
            value={replaceQuery}
            onChange={(event) => setReplaceQuery(event.currentTarget.value)}
            onKeyDown={handleKeyDown}
            leftSection={<IconReplace size={16} />}
          />
        )}

        {totalMatches > 0 && (
          <Paper p="xs" withBorder>
            <Text size="sm" c="dimmed">
              Ditemukan {totalMatches} hasil untuk "{searchQuery}"
            </Text>
          </Paper>
        )}

        <Divider />

        <Box>
          <Text size="xs" c="dimmed">
            <Text span fw={500}>Pintasan:</Text>
            {' '}
            Enter = Berikutnya • Shift+Enter = Sebelumnya • Esc = Tutup
          </Text>
        </Box>
      </Stack>
    </Modal>
  );
}

export default SearchModal;