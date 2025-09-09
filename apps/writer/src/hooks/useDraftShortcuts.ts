import { useCallback, useState } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { notifications } from '@mantine/notifications';

interface UseDraftShortcutsOptions {
  onSave?: () => Promise<void> | void;
  onNewDraft?: () => void;
  onShowHelp?: () => void;
  enabled?: boolean;
}

export const useDraftShortcuts = ({
  onSave,
  onNewDraft,
  onShowHelp,
  enabled = true,
}: UseDraftShortcutsOptions) => {
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!onSave || isSaving) return;

    try {
      setIsSaving(true);
      await onSave();
      
      notifications.show({
        title: 'Draft Saved',
        message: 'Your draft has been saved successfully',
        color: 'green',
        autoClose: 2000,
      });
    } catch (error) {
      console.error('Save error:', error);
      notifications.show({
        title: 'Save Failed',
        message: 'Failed to save draft. Please try again.',
        color: 'red',
        autoClose: 4000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [onSave, isSaving]);

  const handleNewDraft = useCallback(() => {
    if (onNewDraft) {
      onNewDraft();
      notifications.show({
        title: 'New Draft',
        message: 'Starting new draft...',
        color: 'blue',
        autoClose: 1500,
      });
    }
  }, [onNewDraft]);

  const handleShowHelp = useCallback(() => {
    if (onShowHelp) {
      onShowHelp();
    }
  }, [onShowHelp]);

  useKeyboardShortcuts({
    enabled,
    shortcuts: [
      {
        key: 's',
        ctrl: true,
        description: 'Save draft',
        action: handleSave,
      },
      {
        key: 'd',
        ctrl: true,
        alt: true,
        description: 'Create new draft',
        action: handleNewDraft,
      },
      {
        key: '/',
        ctrl: true,
        description: 'Show keyboard shortcuts help',
        action: handleShowHelp,
      },
    ],
  });

  return {
    isSaving,
    handleSave,
    handleNewDraft,
    handleShowHelp,
  };
};