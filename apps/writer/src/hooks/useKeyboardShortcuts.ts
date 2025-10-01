import { useCallback, useEffect } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[];
  enabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when user is typing in input fields, but allow more shortcuts in contentEditable (editor)
    const target = event.target as HTMLElement;
    const isInEditor = target.contentEditable === 'true' || target.closest('[contenteditable="true"]');
    const isInInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    if (isInInput) {
      // Only allow essential shortcuts in input fields
      const allowedInInputs = ['s', 'n'];
      const currentKey = event.key.toLowerCase();
      if (!allowedInInputs.includes(currentKey) || !event.ctrlKey) {
        return;
      }
    } else if (isInEditor) {
      // IMPORTANT: Don't interfere with normal typing in the editor
      // Only allow shortcuts with modifier keys (Ctrl/Alt/Shift) to prevent conflicts
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey || event.shiftKey;

      // If no modifier key is pressed, let BlockNote handle it natively
      if (!hasModifier) {
        return;
      }

      // For Enter key specifically, only handle if Ctrl/Cmd is pressed
      if (event.key === 'Enter' && !event.ctrlKey && !event.metaKey) {
        return; // Let BlockNote handle Enter key without Ctrl
      }
    }

    for (const shortcut of shortcuts) {
      const matchesKey = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const matchesCtrl = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
      const matchesAlt = shortcut.alt ? event.altKey : !event.altKey;
      const matchesShift = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const matchesMeta = shortcut.meta ? event.metaKey : true;

      if (matchesKey && matchesCtrl && matchesAlt && matchesShift && matchesMeta) {
        console.log('🎯 Keyboard shortcut triggered:', shortcut.description, {
          key: event.key,
          ctrl: event.ctrlKey,
          alt: event.altKey,
          shift: event.shiftKey,
          shortcut: shortcut
        });
        event.preventDefault();
        event.stopPropagation();
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Use capture: false to allow editor's native handlers to run first
    document.addEventListener('keydown', handleKeyDown, false);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, false);
    };
  }, [handleKeyDown, enabled]);

  return { handleKeyDown };
};

// Predefined shortcut combinations
export const SHORTCUTS = {
  SAVE: { key: 's', ctrl: true, description: 'Save draft' },
  NEW_DRAFT: { key: 'd', ctrl: true, alt: true, description: 'Create new draft' },
  BOLD: { key: 'b', ctrl: true, description: 'Bold text' },
  ITALIC: { key: 'i', ctrl: true, description: 'Italic text' },
  UNDERLINE: { key: 'u', ctrl: true, description: 'Underline text' },
  COPY: { key: 'c', ctrl: true, description: 'Copy text' },
  PASTE: { key: 'v', ctrl: true, description: 'Paste text' },
  UNDO: { key: 'z', ctrl: true, description: 'Undo last action' },
  REDO: { key: 'y', ctrl: true, description: 'Redo last action' },
  SEARCH: { key: 'f', ctrl: true, description: 'Search in document' },
  HELP: { key: '/', ctrl: true, description: 'Show keyboard shortcuts' },
} as const;

// Helper function to format shortcut display
export const formatShortcut = (shortcut: Partial<KeyboardShortcut>): string => {
  const parts: string[] = [];
  
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.alt) parts.push('Alt');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.meta) parts.push('Cmd');
  
  if (shortcut.key) {
    parts.push(shortcut.key.toUpperCase());
  }
  
  return parts.join(' + ');
};