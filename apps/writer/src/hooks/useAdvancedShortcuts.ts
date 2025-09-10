import { useCallback } from 'react';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

interface UseAdvancedShortcutsOptions {
  onInsertCitation?: () => void;
  onInsertFormula?: () => void;
  onGenerateAI?: () => void;
  onAnalyzeReferences?: () => void;
  onInsertTable?: () => void;
  onInsertImage?: () => void;
  onInsertCode?: () => void;
  onInsertQuote?: () => void;
  onWordCount?: () => void;
  onExportDraft?: () => void;
  onToggleFullscreen?: () => void;
  onFindReplace?: () => void;
  onOpenDraftList?: () => void;
  onListRecentDrafts?: () => void;
  enabled?: boolean;
}

export const useAdvancedShortcuts = ({
  onInsertCitation,
  onInsertFormula,
  onGenerateAI,
  onAnalyzeReferences,
  onInsertTable,
  onInsertImage,
  onInsertCode,
  onInsertQuote,
  onWordCount,
  onExportDraft,
  onToggleFullscreen,
  onFindReplace,
  onOpenDraftList,
  onListRecentDrafts,
  enabled = true,
}: UseAdvancedShortcutsOptions) => {

  const shortcuts = [
    // Citation and Reference shortcuts
    {
      key: 'r',
      ctrl: true,
      alt: true,
      description: 'Insert citation',
      action: () => onInsertCitation?.(),
    },
    {
      key: 'm',
      ctrl: true,
      shift: true,
      description: 'Insert mathematical formula',
      action: () => onInsertFormula?.(),
    },
    {
      key: 'b',
      ctrl: true,
      alt: true,
      description: 'Analyze references with AI',
      action: () => onAnalyzeReferences?.(),
    },

    // AI and Generation shortcuts
    {
      key: 'g',
      ctrl: true,
      shift: true,
      description: 'Generate AI content',
      action: () => onGenerateAI?.(),
    },

    // Content insertion shortcuts
    {
      key: 't',
      ctrl: true,
      shift: true,
      description: 'Insert table',
      action: () => onInsertTable?.(),
    },
    {
      key: 'i',
      ctrl: true,
      shift: true,
      description: 'Insert image',
      action: () => onInsertImage?.(),
    },
    {
      key: 'c',
      ctrl: true,
      shift: true,
      description: 'Insert code block',
      action: () => onInsertCode?.(),
    },
    {
      key: 'q',
      ctrl: true,
      alt: true,
      description: 'Insert quote block',
      action: () => onInsertQuote?.(),
    },

    // Document management shortcuts
    {
      key: 'w',
      ctrl: true,
      alt: true,
      description: 'Show word count',
      action: () => onWordCount?.(),
    },
    {
      key: 'p',
      ctrl: true,
      shift: true,
      description: 'Export draft to PDF',
      action: () => onExportDraft?.(),
    },
    {
      key: 'F11',
      description: 'Toggle fullscreen mode',
      action: () => onToggleFullscreen?.(),
    },
    {
      key: 'h',
      ctrl: true,
      description: 'Find and replace',
      action: () => onFindReplace?.(),
    },
    
    // Draft workflow shortcuts
    {
      key: 'd',
      ctrl: true,
      shift: true,
      description: 'Open draft list',
      action: () => onOpenDraftList?.(),
    },
    {
      key: 'l',
      ctrl: true,
      alt: true,
      description: 'List recent drafts',
      action: () => onListRecentDrafts?.(),
    },
  ];

  useKeyboardShortcuts({
    enabled,
    shortcuts,
  });

  // Return helper functions
  return {
    insertCitation: useCallback(() => onInsertCitation?.(), [onInsertCitation]),
    insertFormula: useCallback(() => onInsertFormula?.(), [onInsertFormula]),
    generateAI: useCallback(() => onGenerateAI?.(), [onGenerateAI]),
    analyzeReferences: useCallback(() => onAnalyzeReferences?.(), [onAnalyzeReferences]),
    insertTable: useCallback(() => onInsertTable?.(), [onInsertTable]),
    insertImage: useCallback(() => onInsertImage?.(), [onInsertImage]),
    insertCode: useCallback(() => onInsertCode?.(), [onInsertCode]),
    insertQuote: useCallback(() => onInsertQuote?.(), [onInsertQuote]),
    showWordCount: useCallback(() => onWordCount?.(), [onWordCount]),
    exportDraft: useCallback(() => onExportDraft?.(), [onExportDraft]),
    toggleFullscreen: useCallback(() => onToggleFullscreen?.(), [onToggleFullscreen]),
    findReplace: useCallback(() => onFindReplace?.(), [onFindReplace]),
    openDraftList: useCallback(() => onOpenDraftList?.(), [onOpenDraftList]),
    listRecentDrafts: useCallback(() => onListRecentDrafts?.(), [onListRecentDrafts]),
  };
};