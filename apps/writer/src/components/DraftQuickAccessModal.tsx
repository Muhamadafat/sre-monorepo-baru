'use client';

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Text,
  Stack,
  Group,
  Badge,
  Button,
  TextInput,
  Paper,
  Avatar,
  ActionIcon,
  Tooltip,
  Divider,
  Center,
  Loader,
  Alert,
} from '@mantine/core';
import {
  IconSearch,
  IconFileText,
  IconClock,
  IconStar,
  IconTrash,
  IconEdit,
  IconPlus,
  IconArrowRight,
  IconAlertCircle,
} from '@tabler/icons-react';

interface Draft {
  id: string;
  title: string;
  lastModified: string;
  wordCount: number;
  status: 'konsep' | 'selesai' | 'arsip';
  isFavorite?: boolean;
}

interface DraftQuickAccessModalProps {
  opened: boolean;
  onClose: () => void;
  onSelectDraft?: (draftId: string) => void;
  onCreateNew?: () => void;
}

export function DraftQuickAccessModal({ 
  opened, 
  onClose, 
  onSelectDraft,
  onCreateNew 
}: DraftQuickAccessModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, fetch from API
  useEffect(() => {
    if (opened) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setDrafts([
          {
            id: '1',
            title: 'Makalah Penelitian tentang Etika AI',
            lastModified: '2 jam yang lalu',
            wordCount: 1250,
            status: 'konsep',
            isFavorite: true,
          },
          {
            id: '2', 
            title: 'Draft Tinjauan Literatur',
            lastModified: '1 hari yang lalu',
            wordCount: 890,
            status: 'konsep',
          },
          {
            id: '3',
            title: 'Bagian Metodologi',
            lastModified: '3 hari yang lalu', 
            wordCount: 567,
            status: 'selesai',
          },
          {
            id: '4',
            title: 'Bab Pendahuluan',
            lastModified: '1 minggu yang lalu',
            wordCount: 1890,
            status: 'konsep',
          },
        ]);
        setLoading(false);
      }, 800);
    }
  }, [opened]);

  const filteredDrafts = drafts.filter(draft =>
    draft.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'konsep': return 'blue';
      case 'selesai': return 'green';
      case 'arsip': return 'gray';
      default: return 'blue';
    }
  };

  const handleSelectDraft = (draftId: string) => {
    onSelectDraft?.(draftId);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew?.();
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <IconFileText size={20} style={{
            color: '#667eea',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
            transition: 'all 0.3s ease',
          }} />
          <Text fw={600} style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.025em',
          }}>Akses Cepat - Draft</Text>
        </Group>
      }
      size="lg"
      centered
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
      {/* Search Bar */}
      <TextInput
        placeholder="Cari draft... (ketik untuk filter)"
        leftSection={<IconSearch size={16} style={{
          color: '#667eea',
          transition: 'all 0.2s ease',
        }} />}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.currentTarget.value)}
        mb="md"
        size="md"
        styles={{
          input: {
            borderRadius: '12px',
            border: '2px solid rgba(102, 126, 234, 0.1)',
            transition: 'all 0.2s ease',
            backgroundColor: 'rgba(248, 250, 255, 0.8)',
            '&:focus': {
              borderColor: '#667eea',
              boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
            },
            '&:hover': {
              borderColor: 'rgba(102, 126, 234, 0.2)',
            },
          },
        }}
      />

      {/* Quick Actions */}
      <Group mb="lg">
        <Button
          leftSection={<IconPlus size={16} style={{
            transition: 'transform 0.2s ease',
          }} />}
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan' }}
          onClick={handleCreateNew}
          style={{
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.2s ease',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)',
            },
          }}
          onMouseEnter={(e) => {
            const icon = e.currentTarget.querySelector('svg');
            if (icon) icon.style.transform = 'rotate(90deg)';
          }}
          onMouseLeave={(e) => {
            const icon = e.currentTarget.querySelector('svg');
            if (icon) icon.style.transform = 'rotate(0deg)';
          }}
        >
          Buat Draft Baru
        </Button>
        
        <Badge variant="light" color="blue" style={{
          background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: '8px',
          fontWeight: 500,
          letterSpacing: '0.025em',
          padding: '6px 12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        }}>
          {filteredDrafts.length} draft ditemukan
        </Badge>
      </Group>

      <Divider mb="md" />

      {/* Drafts List */}
      {loading ? (
        <Center py="xl">
          <Stack align="center" gap="md">
            <div style={{
              position: 'relative',
              display: 'inline-block',
            }}>
              <Loader color="blue" size="md" style={{
                filter: 'drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3))',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60px',
                height: '60px',
                border: '2px solid rgba(102, 126, 234, 0.1)',
                borderRadius: '50%',
                animation: 'pulse 2s infinite',
              }} />
            </div>
            <Text size="sm" c="dimmed" style={{
              letterSpacing: '0.025em',
              fontWeight: 500,
            }}>Memuat draft...</Text>
          </Stack>
        </Center>
      ) : filteredDrafts.length === 0 ? (
        <Center py="xl">
          <Stack align="center" gap="md" style={{
            padding: '2rem',
          }}>
            <div style={{
              position: 'relative',
              display: 'inline-block',
            }}>
              <IconAlertCircle size={48} style={{
                color: '#a0aec0',
                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1))',
              }} />
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '80px',
                height: '80px',
                border: '1px solid rgba(160, 174, 192, 0.2)',
                borderRadius: '50%',
                animation: 'pulse 3s infinite',
              }} />
            </div>
            <Text size="lg" c="dimmed" style={{
              fontWeight: 600,
              letterSpacing: '0.025em',
              color: '#4a5568',
            }}>Tidak ada draft ditemukan</Text>
            <Text size="sm" c="dimmed" style={{
              textAlign: 'center',
              lineHeight: 1.6,
              color: '#718096',
              maxWidth: '300px',
            }}>
              {searchQuery ? 'Coba kata kunci pencarian lain' : 'Buat draft pertama Anda untuk memulai'}
            </Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="xs">
          {filteredDrafts.map((draft) => (
            <Paper
              key={draft.id}
              withBorder
              p="md"
              radius="md"
              style={{
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onClick={() => handleSelectDraft(draft.id)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff 0%, #f0f5ff 100%)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.02)';
                e.currentTarget.style.borderColor = 'rgba(102, 126, 234, 0.1)';
                e.currentTarget.style.background = 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)';
              }}
            >
              <Group justify="space-between" align="flex-start">
                <Stack gap="xs" flex={1}>
                  <Group gap="xs">
                    <Text fw={600} size="sm" lineClamp={1} style={{
                      color: '#2d3748',
                      letterSpacing: '0.025em',
                      lineHeight: 1.4,
                    }}>
                      {draft.title}
                    </Text>
                    {draft.isFavorite && (
                      <IconStar size={14} fill="orange" color="orange" style={{
                        filter: 'drop-shadow(0 1px 2px rgba(255, 165, 0, 0.3))',
                        animation: 'pulse 2s infinite',
                      }} />
                    )}
                  </Group>
                  
                  <Group gap="md">
                    <Group gap="xs">
                      <IconClock size={12} color="gray" />
                      <Text size="xs" c="dimmed">
                        {draft.lastModified}
                      </Text>
                    </Group>
                    
                    <Text size="xs" c="dimmed">
                      {draft.wordCount} kata
                    </Text>
                    
                    <Badge 
                      size="xs" 
                      variant="light" 
                      color={getStatusColor(draft.status)}
                      style={{
                        borderRadius: '6px',
                        fontWeight: 500,
                        fontSize: '10px',
                        letterSpacing: '0.5px',
                        textTransform: 'uppercase',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                      }}
                    >
                      {draft.status}
                    </Badge>
                  </Group>
                </Stack>

                <Group gap="xs">
                  <Tooltip label="Edit cepat">
                    <ActionIcon
                      variant="subtle"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle quick edit
                      }}
                      style={{
                        borderRadius: '8px',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      <IconEdit size={14} style={{
                        color: '#667eea',
                        transition: 'all 0.2s ease',
                      }} />
                    </ActionIcon>
                  </Tooltip>
                  
                  <IconArrowRight size={16} style={{
                    color: '#a0aec0',
                    transition: 'all 0.2s ease',
                  }} />
                </Group>
              </Group>
            </Paper>
          ))}
        </Stack>
      )}

      {/* Quick Tips */}
      <Alert
        icon={<IconAlertCircle size={16} style={{
          color: '#667eea',
        }} />}
        color="blue"
        variant="light"
        mt="md"
        style={{
          background: 'linear-gradient(135deg, #f8faff 0%, #e3f2fd 100%)',
          border: '1px solid rgba(102, 126, 234, 0.2)',
          borderRadius: '12px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Text size="xs" component="div" style={{
          lineHeight: 1.6,
          color: '#4a5568',
          letterSpacing: '0.025em',
        }}>
          💡 Tips cepat: Tekan <Badge size="xs" variant="outline" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            color: '#667eea',
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            borderRadius: '4px',
            marginInline: '2px',
          }}>Ctrl + Shift + D</Badge> kapan saja untuk membuka dialog ini, 
          atau <Badge size="xs" variant="outline" style={{
            background: 'rgba(255, 255, 255, 0.8)',
            border: '1px solid rgba(102, 126, 234, 0.3)',
            color: '#667eea',
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            borderRadius: '4px',
            marginInline: '2px',
          }}>Ctrl + Alt + L</Badge> hanya untuk draft terbaru.
        </Text>
      </Alert>
    </Modal>
  );
}