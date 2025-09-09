import { useCallback } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface UseTextFormattingShortcutsOptions {
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onStrikethrough?: () => void;
  onCode?: () => void;
  onHeading?: (level: number) => void;
  onBulletList?: () => void;
  onNumberedList?: () => void;
  onQuote?: () => void;
  onLink?: () => void;
  enabled?: boolean;
}

export const useTextFormattingShortcuts = ({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onCode,
  onHeading,
  onBulletList,
  onNumberedList,
  onQuote,
  onLink,
  enabled = true,
}: UseTextFormattingShortcutsOptions) => {

  const shortcuts = [
    // Basic formatting
    {
      key: 'b',
      ctrl: true,
      description: 'Toggle bold formatting',
      action: () => onBold?.(),
    },
    {
      key: 'i',
      ctrl: true,
      description: 'Toggle italic formatting',
      action: () => onItalic?.(),
    },
    {
      key: 'u',
      ctrl: true,
      description: 'Toggle underline formatting',
      action: () => onUnderline?.(),
    },
    {
      key: 's',
      ctrl: true,
      shift: true,
      description: 'Toggle strikethrough formatting',
      action: () => onStrikethrough?.(),
    },
    {
      key: 'e',
      ctrl: true,
      description: 'Toggle code formatting',
      action: () => onCode?.(),
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Insert/edit link',
      action: () => onLink?.(),
    },
    
    // Headings
    {
      key: '1',
      ctrl: true,
      description: 'Convert to Heading 1',
      action: () => onHeading?.(1),
    },
    {
      key: '2',
      ctrl: true,
      description: 'Convert to Heading 2',
      action: () => onHeading?.(2),
    },
    {
      key: '3',
      ctrl: true,
      description: 'Convert to Heading 3',
      action: () => onHeading?.(3),
    },
    
    // Lists
    {
      key: 'l',
      ctrl: true,
      shift: true,
      description: 'Create bullet list',
      action: () => onBulletList?.(),
    },
    {
      key: 'o',
      ctrl: true,
      shift: true,
      description: 'Create numbered list',
      action: () => onNumberedList?.(),
    },
    
    // Quote
    {
      key: 'q',
      ctrl: true,
      shift: true,
      description: 'Create quote block',
      action: () => onQuote?.(),
    },
  ];

  useKeyboardShortcuts({
    enabled,
    shortcuts,
  });

  // Return helper functions that can be used by components
  return {
    formatBold: useCallback(() => onBold?.(), [onBold]),
    formatItalic: useCallback(() => onItalic?.(), [onItalic]),
    formatUnderline: useCallback(() => onUnderline?.(), [onUnderline]),
    formatStrikethrough: useCallback(() => onStrikethrough?.(), [onStrikethrough]),
    formatCode: useCallback(() => onCode?.(), [onCode]),
    insertLink: useCallback(() => onLink?.(), [onLink]),
    createHeading: useCallback((level: number) => onHeading?.(level), [onHeading]),
    createBulletList: useCallback(() => onBulletList?.(), [onBulletList]),
    createNumberedList: useCallback(() => onNumberedList?.(), [onNumberedList]),
    createQuote: useCallback(() => onQuote?.(), [onQuote]),
  };
};