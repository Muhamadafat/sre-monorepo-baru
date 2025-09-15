import { useCallback } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface UseEditorShortcutsOptions {
  onSearch?: () => void;
  onFindReplace?: () => void;
  onGoToLine?: () => void;
  onGoToStart?: () => void;
  onGoToEnd?: () => void;
  onDuplicateLine?: () => void;
  onDeleteLine?: () => void;
  onGenerateAI?: () => void;
  enabled?: boolean;
}

export const useEditorShortcuts = ({
  onSearch,
  onFindReplace,
  onGoToLine,
  onGoToStart,
  onGoToEnd,
  onDuplicateLine,
  onDeleteLine,
  onGenerateAI,
  enabled = true,
}: UseEditorShortcutsOptions) => {

  const shortcuts = [
    // Navigation shortcuts
    {
      key: 'f',
      ctrl: true,
      description: 'Search in document',
      action: () => onSearch?.(),
    },
    // Note: Ctrl+H is handled by useAdvancedShortcuts hook
    {
      key: 'g',
      ctrl: true,
      description: 'Go to line',
      action: () => onGoToLine?.(),
    },
    {
      key: 'Home',
      ctrl: true,
      description: 'Go to beginning of document',
      action: () => onGoToStart?.(),
    },
    {
      key: 'End',
      ctrl: true,
      description: 'Go to end of document',
      action: () => onGoToEnd?.(),
    },

    // Editor actions
    {
      key: 'Enter',
      ctrl: true,
      description: 'Generate AI content',
      action: () => onGenerateAI?.(),
    },
    {
      key: 'd',
      ctrl: true,
      description: 'Duplicate line/block',
      action: () => onDuplicateLine?.(),
    },
    {
      key: 'k',
      ctrl: true,
      shift: true,
      description: 'Delete line',
      action: () => onDeleteLine?.(),
    },
    // Note: Tab and Shift+Tab are handled natively by BlockNote for list indentation
  ];

  useKeyboardShortcuts({
    enabled,
    shortcuts,
  });

  // Return helper functions
  return {
    search: useCallback(() => onSearch?.(), [onSearch]),
    findReplace: useCallback(() => onFindReplace?.(), [onFindReplace]),
    goToLine: useCallback(() => onGoToLine?.(), [onGoToLine]),
    goToStart: useCallback(() => onGoToStart?.(), [onGoToStart]),
    goToEnd: useCallback(() => onGoToEnd?.(), [onGoToEnd]),
    duplicateLine: useCallback(() => onDuplicateLine?.(), [onDuplicateLine]),
    deleteLine: useCallback(() => onDeleteLine?.(), [onDeleteLine]),
    generateAI: useCallback(() => onGenerateAI?.(), [onGenerateAI]),
  };
};