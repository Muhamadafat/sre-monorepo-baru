// Page.tsx

'use client'

import dynamic from 'next/dynamic';
import { notifications } from '@mantine/notifications';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ExtendedEdge, ExtendedNode } from '@/types'
import type { BlockNoteEditorRef } from '@/components/BlockNoteEditor';
import AnnotationPanel from '@/components/AnnotationPanel';
const BlockNoteEditorComponent = dynamic(() => import("@/components/BlockNoteEditor"), {
  ssr: false
});
import NextImage from 'next/image';
import {
  AppShell,
  Burger,
  rem,
  Container,
  Image,
  ActionIcon,
  Avatar,
  Group,
  Flex,
  Title,
  useMantineColorScheme,
  useComputedColorScheme,
  ScrollArea,
  Overlay,
  Box,
  Button,
  Stack,
  Text,
  TextInput,
  Menu,
  Tooltip,
  Paper,
  Badge,
  Divider,
  Loader,
  Modal,
  Center,
  Alert,
  Grid,
  RingProgress,
  Progress,
} from "@mantine/core";

import {useDisclosure, useDebouncedCallback, useMediaQuery} from "@mantine/hooks";
import {
   IconSettings,
   IconSun,
   IconMoon,
   IconGraph,
   IconMessageCircle2,
   IconBrain,
   IconMap2,
   IconSend,
   IconFilePlus, 
   IconUpload,
   IconFileText,
   IconChevronRight,
   IconSearch,
   IconRefresh,
   IconPlus,
   IconExternalLink,
   IconMessageCircle,
   IconStar,
   IconUser,
   IconLogout,
   IconList,
   IconHistory,
   IconTrash,
   IconNumber,
   IconDotsVertical,
   IconHighlight,
   IconRobot,
   IconEdit,
   IconAlertCircle,
   IconAlertTriangle,
   IconX,
   IconCircleCheck,
   IconBulb,
   IconShieldCheck,
   IconScan,
   IconQuote,
   IconBook,
   IconWorld,
   IconSchool,
   IconNews,
   IconVideo,
   IconMicrophone,
   IconClipboardCheck,
   IconStethoscope,
   IconPercentage,
   IconTrendingUp,
   IconTrendingDown,
   IconEye,
   IconAnalyze,
  } from "@tabler/icons-react";
import classes from '../../../container.module.css';
// import'/images/LogoSRE_FIX.png'from '../../../imageCollection/LogoSRE_Fix.png';
// import knowledgeImage from '../../../imageCollection/graph.png';
import Split from 'react-split';
import { useSearchParams } from 'next/navigation';
import { useParams, useRouter } from 'next/navigation';
import WebViewer from '@/components/WebViewer2';

interface Article {
    id: string,
    title: string,
    att_background: string,
    att_url: string,
}

interface ValidAssignment {
  id: string;
  title: string;
  description: string;
  weekNumber: number;
  dueDate: string | null;
  isOverdue: boolean;
}

interface CodeValidation {
  valid: boolean;
  message: string;
  assignment: ValidAssignment | null;
}


interface Bibliography {
  id: string; // ID unik untuk bibliography
  sourceId?: string; // ID artikel sumber (jika berasal dari artikel)
  number: number; // Nomor urut dalam daftar pustaka
  author: string; // Nama penulis
  title: string; // Judul karya
  year: string; // Tahun publikasi
  publisher?: string; // Penerbit (opsional)
  url?: string; // URL sumber (opsional)
  journal?: string; // Nama jurnal (opsional)
  volume?: string; // Volume jurnal (opsional)
  issue?: string; // Nomor terbitan (opsional)
  pages?: string; // Halaman (opsional)
  accessDate?: string; // Tanggal akses (opsional)
  doi?: string; // Digital Object Identifier (opsional)
  edition?: string; // Edisi buku (opsional)
  city?: string; // Kota penerbit (opsional)
  conference?: string; // Nama konferensi (opsional)
  medium?: string; // Media publikasi (opsional)
  createdAt: Date; // Tanggal dibuat
}

interface HeadingItem {
  id: string; // ID unik heading
  text: string; // Teks heading
  level: number; // Level heading (1-6)
}

interface HistoryItem {
  id: string; // ID unik entry history
  timestamp: Date; // Waktu penyimpanan
  aiPercentage?: number; // Persentase AI detection (hanya untuk final submission)
  wordCount: number; // Jumlah kata dalam dokumen
  title: string; // Judul dokumen saat disimpan
  version: string; // Versi dokumen ("Versi 1", "Versi 2", "Final")
  type: "draft" | "final"; // Tipe penyimpanan: draft atau final submission
  assignmentCode?: string; // Kode assignment dari dosen (untuk final submission)
}

interface AICheckResult {
  percentage: number; // Persentase kemungkinan konten dibuat oleh AI (0-100%)
  isHuman: boolean; // True jika konten dianggap human-written (≤10% AI)
  confidence: number; // Tingkat confidence analisis (0-100%)
  analysis: {
    // Detail analisis teknis
    textLength: number; // Panjang teks dalam karakter
    sentences: number; // Jumlah kalimat
    avgSentenceLength: number; // Rata-rata panjang kalimat dalam kata
    complexity: "Low" | "Medium" | "High"; // Tingkat kompleksitas teks
    humanSentences: number; // Jumlah kalimat yang terdeteksi human-written
    aiSentences: number; // Jumlah kalimat yang terdeteksi AI-generated
    mixedSentences: number; // Jumlah kalimat dengan karakteristik campuran
  };
  recommendation: string; // Rekomendasi berdasarkan hasil analisis
  highlightedContent: string; // Konten dengan highlighting per kalimat (HTML)
  sentenceAnalysis: Array<{
    // Analisis detail per kalimat
    text: string; // Teks kalimat
    probability: number; // Probabilitas AI (0-1)
    type: "human" | "ai" | "mixed"; // Klasifikasi kalimat
  }>;
}

// GPTZero API Interface from KODE 2
interface GPTZeroResponse {
  documents: Array<{
    average_generated_prob: number;
    completely_generated_prob: number;
    overall_burstiness: number;
    paragraphs: Array<{
      start_sentence_index: number;
      end_sentence_index: number;
      num_sentences: number;
      completely_generated_prob: number;
    }>;
    sentences: Array<{
      sentence: string;
      generated_prob: number;
      perplexity: number;
    }>;
  }>;
}

interface User {
  id: string,
  email: string,
  name: string,
  group: string,
}

const handleAnalytics = async (analyticsData: any) => {
  try {
    await fetch('/api/annotation', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        ...analyticsData,
        userId: 'current_user_id',
        sessionId: 'uniqueSessionId',
      }),
    });
  } catch (error) {
    console.error(error);
  }
};

export default function Home() {
  const [navUser, setNavUser] = useState<User | null>(null); // untuk navbar
  const [dropdownUser, setDropdownUser] = useState<User | null>(null); // untuk dropdown menu
  const [navbarOpened, { toggle: toggleNavbar, close: closeNavbar }] = useDisclosure();
//   const {id: sessionId} = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const [getSessionId, setGetSessionId]= useState(null);

  const urlSessionId = searchParams.get('sessionId') || getSessionId;
  const sessionId = urlSessionId || getSessionId;
  const isFromBrainstorming = !!urlSessionId;
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const projectId = useParams().id as string;
  const [writerSessionLoading, setWriterSessionLoading] = useState(true);
  const [writerSession, setWriterSession] = useState<any>(null);
  const [writerSessionInitialized, setWriterSessionInitialized] = useState(false);
  
  // const [assignmentCode, setAssignmentCode] = useState('');
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeValidation, setCodeValidation] = useState({
    valid: false, 
    message: '', 
    assignment: null as any
  });

  const [opened, setOpened] = useState(false);
  const [selectedPDF, setSelectedPDF] = useState<string | null>(null);

  const [mcpContext, setMcpContext] = useState<{
    sessionId: string;
    contextNodeIds: string[];
    contextEdgeIds: string[];
    nodeId: string | null;
    nodeIds: string[];
    mode: "general" | "single node" | "multiple node";
  } | null>(null);

  type McpContextType = {
    sessionId: string;
    contextNodeIds: string[];
    contextEdgeIds: string[];
    nodeId: string | null;
    nodeIds: string[];
    mode: "general" | "single node" | "multiple node";
  };

  // 2. Handler untuk membuka modal PDF
  const handlePdfOpen = (pdfUrl: string) => {
    setSelectedPDF(pdfUrl);
    setOpened(true);
  };

  // 3. Handler untuk menutup modal PDF
  const handlePdfClose = () => {
    setOpened(false);
    setSelectedPDF(null);
  };

  console.log('=== FRONTEND DEBUG ===');
  console.log('urlSessionId:', urlSessionId);
  console.log('getSessionId:', getSessionId);
  console.log('final sessionId:', sessionId);
  console.log('projectId:', projectId);
  console.log('isFromBrainstorming:', isFromBrainstorming);
  console.log('dropdownUser:', dropdownUser?.id);
  console.log('writerSessionInitialized:', writerSessionInitialized);

  useEffect(() => {
    const createWriterSession = async () => {
      console.log('=== createWriterSession called ===');
      
      if (writerSessionInitialized) {
        console.log('✅ Writer session already initialized, skipping...');
        return;
      }

      // Enhanced validation
      console.log('Validating parameters:', {
        sessionId,
        projectId,
        hasSessionId: !!sessionId,
        hasProjectId: !!projectId,
        dropdownUserExists: !!dropdownUser
      });

      if (!sessionId || !projectId) {
        console.log('❌ Missing sessionId or projectId:', { sessionId, projectId });
        
        // If we have dropdownUser but no sessionId, there's a problem
        if (dropdownUser && !sessionId) {
          console.log('⚠️ DropdownUser exists but sessionId is null - potential race condition');
          console.log('DropdownUser ID:', dropdownUser.id);
          console.log('getSessionId state:', getSessionId);
        }
        
        return;
      }

      setWriterSessionLoading(true);
      
      try {
        // Determine payload based on scenario
        let payload: any = { projectId };
        
        if (isFromBrainstorming) {
          payload.sessionId = sessionId;
          console.log('📤 Sending payload (Case 1 - from brainstorming):', payload);
        } else {
          console.log('📤 Sending payload (Case 2 - direct access):', payload);
        }

        const res = await fetch('/api/writer-sessions/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const result = await res.json();
        
        console.log('📥 API Response:', {
          status: res.status,
          ok: res.ok,
          result
        });

        if (!res.ok) {
          console.error("❌ API Error:", result.message || "Unknown error");
          notifications.show({
            title: 'Gagal Membuat Sesi',
            message: result.message || "Terjadi kesalahan",
            color: 'red',
          });
          return;
        }

        console.log("✅ WriterSession berhasil:", result);
        setWriterSession(result.writerSession);
        setFileName(`Draft: ${result.writerSession?.title || 'Artikel'}`);
        setWriterSessionInitialized(true);
        
      } catch (error) {
        console.error("❌ Fetch Error:", error);
        notifications.show({
          title: 'Error',
          message: "Terjadi kesalahan saat membuat sesi",
          color: 'red',
        });
      } finally {
        setWriterSessionLoading(false);
      }
    };

    const initializeData = async () => {
      console.log('=== initializeData called ===');
      
      // Fetch user data jika belum ada
      if (!dropdownUser) {
        console.log('🔄 Fetching dropdown user...');
        await fetchDropdownUser();
      } else {
        console.log('✅ DropdownUser already exists:', dropdownUser.id);
      }
      
      // Buat writer session
      await createWriterSession();
    };

    // Only run if we have the basic requirements
    if (projectId) {
      console.log('🚀 Initializing data...');
      initializeData();
    } else {
      console.log('⏳ Waiting for projectId...');
    }

  }, [sessionId, projectId, isFromBrainstorming, dropdownUser]);


  const fetchDropdownUser = async () => {
    console.log('=== fetchDropdownUser called ===');
    setLoading(true);
    
    try {
      const res = await fetch('/api/user/profile', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      console.log('👤 User profile response:', data);

      if (!data || !data.user) {
        console.log('❌ No user data received');
        setDropdownUser(null);
        throw new Error('No dropdown user authenticated');
      } else {
        console.log('✅ Setting dropdownUser and getSessionId:', data.user.id);
        setDropdownUser(data.user);
        setGetSessionId(data.user.id);
      }
    } catch (error: any) {
      console.error('❌ fetchDropdownUser error:', error.message); 
      setDropdownUser(null);
    } finally {
      setLoading(false);
    }
  };
  
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const dark = computedColorScheme === 'dark';

  const toggleColorScheme = () =>
    setColorScheme(computedColorScheme === "dark" ? "light" : "dark");

  const [activeTab, setActiveTab] = useState("chat");
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isSmallScreen = useMediaQuery('(max-width: 768px)');
  const [fileName, setFileName] = useState("Judul Artikel 1");
  const [headings, setHeadings] = useState<HeadingItem[]>([]);
  const [draftCounter, setDraftCounter] = useState(1); // Counter untuk versi draft
  // State untuk daftar artikel dari API
  const [article, setArticle] = useState<Article[]>([]);

  const sendMessage = () => {
    if (chatInput.trim() === '') return;
    setMessages((prev) => [...prev, chatInput]);
    setChatInput('');
  };

  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = article.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.att_background.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  //for article
  const [mounted, setMounted] = useState(false);
  
  // State untuk daftar pustaka
  const [bibliographyList, setBibliographyList] = useState<Bibliography[]>([]);

  // State untuk nomor berikutnya dalam daftar pustaka
  const [nextNumber, setNextNumber] = useState(1);

  // Ref untuk mencegah sinkronisasi berulang
  const isSyncingRef = useRef(false);
  const bibliographyListRef = useRef(bibliographyList);

  // State untuk konten editor
  // const [content, setContent] = useState(
  //   "Mulai menulis artikel Anda di sini..."
  // );

  // State untuk riwayat penyimpanan
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanningProgress, setScanningProgress] = useState(0); // Progress bar AI scanning (0-100%)
  const [scanningText, setScanningText] = useState("Memulai analisis..."); // Teks status scanning
  const [aiCheckResult, setAiCheckResult] = useState<AICheckResult | null>(
    null
  ); // Hasil AI detection
  const [assignmentCode, setAssignmentCode] = useState("");

  const [
    aiResultModalOpened, // Modal hasil AI detection
    { open: openAIResultModal, close: closeAIResultModal },
  ] = useDisclosure(false);
  const [
    bibliographyModalOpened, // Modal form bibliography
    { open: openBibliographyModal, close: closeBibliographyModal },
  ] = useDisclosure(false);

  useEffect(() => {
    bibliographyListRef.current = bibliographyList;
  }, [bibliographyList]);

  // 4. Load drafts di useEffect (tambahan untuk page.tsx)
  const loadDrafts = async () => {
    if (!writerSession?.id) return;

    try {
      console.log('Loading drafts for writerSessionId:', writerSession.id);
      
      const response = await fetch(`/api/draft/list?writerSessionId=${writerSession.id}`);
      const result = await response.json();

      if (response.ok && result.drafts) {
        // Convert ke HistoryItem format
        const historyItems: HistoryItem[] = result.drafts.map((draft: any, index: number) => ({
          id: draft.id,
          timestamp: new Date(draft.createdAt),
          wordCount: draft.sections.reduce((total: number, section: any) => {
            return (
              total + 
              (section.content?.split(/\s+/).filter(Boolean).length || 0)
            );
          }, 0),
          title: draft.title,
          version: `Versi ${result.drafts.length - index}`,
          type: "draft" as const
        }));

        setHistory(historyItems);
        setDraftCounter(result.drafts.length + 1);
        console.log('Drafts loaded successfully:', historyItems);
      }
    } catch (error) {
      console.error('Error loading drafts:', error);
    }
  };

  

useEffect(() => {
    if (sessionId) {
      getArticle();
    }
  }, [sessionId]);

  // Effect untuk memuat drafts saat writerSession sudah dibuat
  useEffect(() => {
    if (writerSession?.id) {
      loadDrafts();
    }
  }, [writerSession?.id]);

  const [editingBibliography, setEditingBibliography] =
    useState<Bibliography | null>(null);

  // State untuk form bibliography
  const [bibliographyForm, setBibliographyForm] = useState({
    author: "",
    title: "",
    year: "",
    publisher: "",
    url: "",
    journal: "",
    volume: "",
    issue: "",
    pages: "",
    accessDate: "",
    doi: "",
    edition: "",
    city: "",
    conference: "",
    medium: "",
  });

    // START: GPTZero functions
  /**
   * =================================================================================
   * FUNGSI SIMULASI DETEKSI AI
   * =================================================================================
   * Fungsi ini digunakan untuk mensimulasikan hasil analisis kalimat,
   * mengklasifikasikannya sebagai 'human', 'ai', atau 'mixed' berdasarkan
   * target persentase AI yang diinginkan. Ini sangat berguna untuk testing UI
   * atau sebagai fallback jika API GPTZero gagal.
   * @param text - Teks input yang akan dianalisis.
   * @param targetAiPercentage - Persentase AI yang diinginkan (0-100) untuk simulasi.
   * @returns Array berisi analisis setiap kalimat.
   */
  const analyzeSentences = (text: string, targetAiPercentage: number) => {
    const sentences = text
      .split(/[.!?]+/)
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim());

    if (sentences.length === 0) return [];

    // Hitung distribusi berdasarkan target AI percentage
    const totalSentences = sentences.length;
    const targetAiSentences = Math.round(
      (targetAiPercentage / 100) * totalSentences
    );
    // Asumsikan sebagian kecil dari kalimat AI memiliki karakteristik campuran
    const targetMixedSentences =
      targetAiPercentage > 10
        ? Math.max(1, Math.round(targetAiSentences * 0.3))
        : 0;
    const finalAiSentences = targetAiSentences - targetMixedSentences;
    const targetHumanSentences =
      totalSentences - finalAiSentences - targetMixedSentences;

    // Array untuk menyimpan tipe yang sudah ditentukan
    const sentenceTypes: ("human" | "ai" | "mixed")[] = [];

    // Isi array dengan distribusi yang diinginkan
    for (let i = 0; i < finalAiSentences; i++) sentenceTypes.push("ai");
    for (let i = 0; i < targetMixedSentences; i++) sentenceTypes.push("mixed");
    // Pastikan sisa array diisi dengan 'human', bahkan jika perhitungan negatif
    for (let i = 0; i < Math.max(0, targetHumanSentences); i++)
      sentenceTypes.push("human");

    // Pastikan jumlahnya sesuai dengan total kalimat
    while (sentenceTypes.length < totalSentences) sentenceTypes.push("human");
    while (sentenceTypes.length > totalSentences) sentenceTypes.pop();

    // Shuffle array untuk distribusi acak
    for (let i = sentenceTypes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sentenceTypes[i], sentenceTypes[j]] = [
        sentenceTypes[j],
        sentenceTypes[i],
      ];
    }

    return sentences.map((sentence, index) => {
      const type = sentenceTypes[index] || "human";
      let probability: number;

      // Set probability berdasarkan type untuk simulasi yang lebih realistis
      switch (type) {
        case "ai":
          probability = 0.7 + Math.random() * 0.3; // 0.7-1.0
          break;
        case "mixed":
          probability = 0.4 + Math.random() * 0.3; // 0.4-0.7
          break;
        case "human":
        default:
          probability = Math.random() * 0.4; // 0.0-0.4
          break;
      }

      return {
        text: sentence,
        probability: Math.round(probability * 100) / 100,
        type,
      };
    });
  };

  const createHighlightedContent = (
    sentenceAnalysis: Array<{
      text: string;
      probability: number;
      type: "human" | "ai" | "mixed";
    }>
  ) => {
    return sentenceAnalysis
      .map((analysis) => {
        // Tentukan warna highlighting berdasarkan tipe kalimat
        const color =
          analysis.type === "ai"
            ? "#ff6b6b" // Merah untuk AI-generated
            : analysis.type === "mixed"
            ? "#ffd43b" // Kuning untuk mixed
            : "#51cf66"; // Hijau untuk human-written

        // Wrap kalimat dengan span berwarna
        return `<span style="background-color: ${color}; padding: 2px 4px; border-radius: 3px; margin: 1px;">${analysis.text}</span>`;
      })
      .join(". ");
  };

  /**
   * =================================================================================
   * FUNGSI PEMANGGILAN API GPTZERO
   * =================================================================================
   * Fungsi ini bertanggung jawab untuk mengirimkan teks ke API GPTZero
   * untuk dianalisis.
   * @param text - Teks yang akan dianalisis.
   * @returns Promise yang resolve dengan response dari API GPTZero.
   */
  const callGPTZeroAPI = async (text: string): Promise<GPTZeroResponse> => {
    const apiKey = "7eef19cc7e18431ea60d89ef63b3b6b0"; // KUNCI API ANDA

    try {
      const response = await fetch("https://api.gptzero.me/v2/predict/text", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Api-Key": apiKey,
        },
        body: JSON.stringify({
          document: text,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("GPTZero API Error Body:", errorBody);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("GPTZero API Fetch Error:", error);
      throw error;
    }
  };

  /**
   * =================================================================================
   * FUNGSI UTAMA UNTUK CEK KONTEN DENGAN GPTZERO
   * =================================================================================
   * Ini adalah fungsi inti yang mengintegrasikan semua logika:
   * 1. Menampilkan progress bar saat proses berjalan.
   * 2. Mencoba memanggil API GPTZero (`try` block).
   * 3. Jika berhasil, memproses response API untuk mendapatkan skor dan highlight yang akurat.
   * - ATURAN: Jika skor AI total > 10%, semua kalimat yang tidak terdeteksi 'human' akan ditandai 'ai' (merah).
   * 4. ✅ MODIFIKASI: Jika API gagal (`catch` block), fungsi ini akan menjalankan simulasi yang lebih akurat:
   * - Menghasilkan skor AI total secara acak dari 1% hingga 100%.
   * - Menggunakan fungsi `analyzeSentences` untuk membuat distribusi highlight (human, ai, mixed) yang realistis berdasarkan skor acak tersebut.
   * - Ini memastikan bahwa bahkan saat API gagal, pengguna tetap mendapatkan feedback visual yang beragam dan masuk akal.
   * @param text - Teks yang akan diperiksa.
   * @returns Promise yang resolve dengan objek `AICheckResult` yang lengkap.
   */
  const checkWithGPTZero = async (text: string): Promise<AICheckResult> => {
    setIsScanning(true);
    setScanningProgress(0);
    setScanningText("Memulai analisis...");

    const processResult = (
      percentage: number,
      analysisDetails: AICheckResult["analysis"],
      confidence: number,
      highlightedContent: string,
      sentenceAnalysis: AICheckResult["sentenceAnalysis"],
      isSimulation: boolean = false
    ): AICheckResult => {
      let recommendation = "";
      const isConsideredHuman = percentage <= 10;

      if (isSimulation) {
        recommendation =
          "Analisis API gagal, hasil ini adalah simulasi acak. Harap periksa kembali tulisan Anda atau coba lagi nanti.";
      } else if (isConsideredHuman) {
        recommendation = "Konten Anda terlihat alami dan original. Bagus!";
      } else {
        recommendation =
          "Konten menunjukkan karakteristik AI. Silakan revisi bagian yang disorot merah untuk meningkatkan originalitas.";
      }

      return {
        percentage,
        isHuman: isConsideredHuman,
        confidence,
        analysis: analysisDetails,
        recommendation,
        highlightedContent,
        sentenceAnalysis,
      };
    };

    try {
      const scanningSteps = [
        { progress: 20, text: "Memproses teks..." },
        { progress: 40, text: "Mengirim ke GPTZero API..." },
        { progress: 60, text: "Menganalisis dengan AI..." },
        { progress: 80, text: "Mengevaluasi originalitas..." },
        { progress: 100, text: "Analisis selesai!" },
      ];
      for (const step of scanningSteps) {
        await new Promise((resolve) => setTimeout(resolve, 400));
        setScanningProgress(step.progress);
        setScanningText(step.text);
      }

      const gptZeroData = await callGPTZeroAPI(text);

      const document = gptZeroData.documents[0];
      const aiPercentage = Math.round(document.average_generated_prob * 100);

      const isOverallHighRisk = aiPercentage > 10;

      const sentenceAnalysis = document.sentences.map((s) => {
        const prob = s.generated_prob;
        let type: "human" | "ai" | "mixed";

        // Aturan highlight: Jika skor keseluruhan tinggi (>10%), maka semua yang berpotensi AI (prob >= 0.35) akan di-highlight merah.
        // Jika skor rendah, maka ada gradasi antara kuning (mixed) dan merah (ai).
        if (prob >= 0.65) {
          type = "ai";
        } else if (prob >= 0.35) {
          type = isOverallHighRisk ? "ai" : "mixed";
        } else {
          type = "human";
        }
        return { text: s.sentence, probability: prob, type };
      });

      const words = text.split(/\s+/).filter((w) => w.length > 0).length;
      const avgSentenceLength =
        sentenceAnalysis.length > 0
          ? Math.round(words / sentenceAnalysis.length)
          : 0;

      let complexity: "Low" | "Medium" | "High" = "Medium";
      if (avgSentenceLength < 10) complexity = "Low";
      else if (avgSentenceLength > 20) complexity = "High";

      const analysisDetails = {
        textLength: text.length,
        sentences: sentenceAnalysis.length,
        avgSentenceLength,
        complexity,
        humanSentences: sentenceAnalysis.filter((s) => s.type === "human")
          .length,
        aiSentences: sentenceAnalysis.filter((s) => s.type === "ai").length,
        mixedSentences: sentenceAnalysis.filter((s) => s.type === "mixed")
          .length,
      };

      return processResult(
        aiPercentage,
        analysisDetails,
        Math.round((1 - document.overall_burstiness) * 100), // Confidence bisa diambil dari burstiness
        createHighlightedContent(sentenceAnalysis),
        sentenceAnalysis
      );
    } catch (error) {
      console.warn(
        "AI Check Error / API Failed. Using enhanced fallback simulation.",
        error
      );

      // --- LOGIKA SIMULASI YANG TELAH DIPERBAIKI ---
      // 1. Menghasilkan skor acak dari 1% hingga 100% untuk simulasi yang lebih realistis.
      const percentage = Math.floor(Math.random() * 100) + 1;

      // 2. Menggunakan `analyzeSentences` untuk membuat distribusi highlight yang akurat berdasarkan skor acak.
      const sentenceAnalysis = analyzeSentences(text, percentage);

      const words = text.split(/\s+/).filter((w) => w.length > 0).length;
      const avgSentenceLength =
        sentenceAnalysis.length > 0
          ? Math.round(words / sentenceAnalysis.length)
          : 0;

      let complexity: "Low" | "Medium" | "High" = "Medium";
      if (avgSentenceLength < 10) complexity = "Low";
      else if (avgSentenceLength > 20) complexity = "High";

      const analysisDetails = {
        textLength: text.length,
        sentences: sentenceAnalysis.length,
        avgSentenceLength,
        complexity,
        humanSentences: sentenceAnalysis.filter((s) => s.type === "human")
          .length,
        aiSentences: sentenceAnalysis.filter((s) => s.type === "ai").length,
        mixedSentences: sentenceAnalysis.filter((s) => s.type === "mixed")
          .length,
      };

      return processResult(
        percentage,
        analysisDetails,
        75, // Beri nilai confidence yang lebih rendah untuk simulasi
        createHighlightedContent(sentenceAnalysis),
        sentenceAnalysis,
        true // Tandai bahwa ini adalah hasil simulasi
      );
    } finally {
      setIsScanning(false);
    }
  };
  // END: GPTZero functions

  useEffect(() => {
  const validateAssignmentCode = async () => {
    // Reset jika input kosong atau terlalu pendek
    if (!assignmentCode.trim() || assignmentCode.length < 3) {
      setCodeValidation({ valid: false, message: '', assignment: null });
      return;
    }

    setIsValidatingCode(true);

    try {
      const response = await fetch('/api/assignments/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignmentCode: assignmentCode.trim() })
      });

      const result = await response.json();

      if (result.valid) {
        setCodeValidation({
          valid: true,
          message: `${result.assignment.title}`,
          assignment: result.assignment
        });
      } else {
        setCodeValidation({
          valid: false,
          message: result.error || 'Kode assignment tidak valid',
          assignment: null
        });
      }
    } catch (error) {
      setCodeValidation({
        valid: false,
        message: 'Gagal memvalidasi kode assignment',
        assignment: null
      });
    } finally {
      setIsValidatingCode(false);
    }
  };

  // Debounce 500ms
  const debounceTimer = setTimeout(validateAssignmentCode, 500);
  return () => clearTimeout(debounceTimer);
}, [assignmentCode]);

  // Ngak dipakai yang lama ini
  // const checkWithGPTZero = async (text: string): Promise<AICheckResult> => {
  //   // Set status scanning dimulai
  //   setIsScanning(true);
  //   setScanningProgress(0);
  //   setScanningText("Memulai analisis...");

  //   try {
  //     // Simulasi tahapan scanning dengan progress indicator
  //     const scanningSteps = [
  //       { progress: 15, text: "Menghubungi GPTZero API..." },
  //       { progress: 30, text: "Memproses teks..." },
  //       { progress: 50, text: "Menganalisis struktur kalimat..." },
  //       { progress: 70, text: "Mendeteksi pola AI..." },
  //       { progress: 85, text: "Mengevaluasi originalitas..." },
  //       { progress: 95, text: "Menyelesaikan analisis..." },
  //       { progress: 100, text: "Analisis selesai!" },
  //     ];

  //     // Update progress bar secara bertahap untuk user experience
  //     for (const step of scanningSteps) {
  //       await new Promise((resolve) => setTimeout(resolve, 800));
  //       setScanningProgress(step.progress);
  //       setScanningText(step.text);
  //     }

  //     // PANGGILAN API GPTZERO - Inti dari sistem AI detection
  //     const response = await fetch("https://api.gptzero.me/v2/predict/text", {
  //       method: "POST",
  //       headers: {
  //         accept: "application/json",
  //         "X-Api-Key": "7eef19cc7e18431ea60d89ef63b3b6b0", // API Key GPTZero
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         document: text, // Teks yang akan dianalisis
  //       }),
  //     });

  //     // Validasi response dari API
  //     if (!response.ok) {
  //       throw new Error(`GPTZero API error: ${response.status}`);
  //     }

  //     const gptZeroResult = await response.json();
  //     console.log("GPTZero Response:", gptZeroResult);

  //     // Analisis kalimat untuk UI highlighting
  //     const sentenceAnalysis = analyzeSentences(text);
  //     const highlightedContent = createHighlightedContent(sentenceAnalysis);

  //     // Extract hasil dari GPTZero API
  //     const aiProbability =
  //       gptZeroResult.documents[0]?.class_probabilities?.ai || 0;
  //     const percentage = Math.round(aiProbability * 100); // Konversi ke persentase
  //     const confidence = Math.round((1 - aiProbability) * 100); // Confidence score
  //     // Hitung statistik kalimat untuk analisis detail
  //     const humanSentences = sentenceAnalysis.filter(
  //       (s) => s.type === "human"
  //     ).length;
  //     const aiSentences = sentenceAnalysis.filter(
  //       (s) => s.type === "ai"
  //     ).length;
  //     const mixedSentences = sentenceAnalysis.filter(
  //       (s) => s.type === "mixed"
  //     ).length;

  //     // Analisis karakteristik teks
  //     const sentences = sentenceAnalysis.length;
  //     const words = text.split(/\s+/).filter((w) => w.length > 0).length;
  //     const avgSentenceLength =
  //       sentences > 0 ? Math.round(words / sentences) : 0;

  //     // Tentukan tingkat kompleksitas berdasarkan panjang rata-rata kalimat
  //     let complexity: "Low" | "Medium" | "High" = "Medium";
  //     if (avgSentenceLength < 10) complexity = "Low";
  //     else if (avgSentenceLength > 20) complexity = "High";

  //     // Generate rekomendasi berdasarkan persentase AI detection
  //     let recommendation = "";
  //     if (percentage <= 10) {
  //       recommendation = "Konten Anda terlihat alami dan original. Bagus!";
  //     } else if (percentage <= 30) {
  //       recommendation =
  //         "Ada sedikit indikasi AI. Pertimbangkan untuk merevisi beberapa bagian yang disorot.";
  //     } else {
  //       recommendation =
  //         "Konten menunjukkan karakteristik AI yang kuat. Silakan revisi bagian yang disorot merah dan kuning.";
  //     }

  //     // Susun hasil analisis lengkap
  //     const result = {
  //       percentage,
  //       isHuman: percentage <= 10, // Threshold 10% untuk dianggap human-written
  //       confidence,
  //       analysis: {
  //         textLength: text.length,
  //         sentences,
  //         avgSentenceLength,
  //         complexity,
  //         humanSentences,
  //         aiSentences,
  //         mixedSentences,
  //       },
  //       recommendation,
  //       highlightedContent,
  //       sentenceAnalysis,
  //     };

  //     // Delay untuk efek loading yang smooth
  //     await new Promise((resolve) => setTimeout(resolve, 500));

  //     return result;
  //   } catch (error) {
  //     console.error("GPTZero Error:", error);

  //     // Fallback jika API gagal - gunakan data simulasi untuk testing
  //     const percentage = Math.round(Math.random() * 15);
  //     const sentenceAnalysis = analyzeSentences(text);

  //     return {
  //       percentage,
  //       isHuman: percentage <= 10,
  //       confidence: 85,
  //       analysis: {
  //         textLength: text.length,
  //         sentences: sentenceAnalysis.length,
  //         avgSentenceLength: 15,
  //         complexity: "Medium",
  //         humanSentences: Math.round(sentenceAnalysis.length * 0.8),
  //         aiSentences: Math.round(sentenceAnalysis.length * 0.1),
  //         mixedSentences: Math.round(sentenceAnalysis.length * 0.1),
  //       },
  //       recommendation:
  //         percentage <= 10
  //           ? "Konten Anda terlihat alami dan original. Bagus!"
  //           : "Silakan revisi untuk mengurangi deteksi AI.",
  //       highlightedContent: createHighlightedContent(sentenceAnalysis),
  //       sentenceAnalysis,
  //     };
  //   } finally {
  //     setIsScanning(false); // Pastikan status scanning direset
  //   }
  // };

  // Update handleSubmitToTeacher function menggunakan dropdownUser yang sudah ada

const handleSubmitToTeacher = async () => {
    if (!assignmentCode.trim()) {
      alert("Mohon masukkan kode assignment!");
      return;
    }

    if (!aiCheckResult) {
      alert("Silakan lakukan AI check terlebih dahulu!");
      return;
    }

    // Gunakan dropdownUser yang sudah ada di state
    if (!dropdownUser?.id) {
      alert("Session tidak valid, silakan refresh halaman!");
      // Trigger fetch user jika belum ada
      await fetchDropdownUser();
      if (!dropdownUser?.id) {
        alert("Gagal mendapatkan data user, silakan login ulang!");
        return;
      }
    }

    // Extract content from BlockNote editor for submission
    const blocks = editorRef.current?.getContent() || [];
    const contentText = extractTextFromBlockNote(blocks);
    
    setIsScanning(true);
    setScanningText("Mengirim assignment...");
    setScanningProgress(50);

    try {
      const response = await fetch('/api/assignments/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          assignmentCode: assignmentCode.trim(),
          content: contentText,
          fileName: fileName,
          studentId: dropdownUser.id, // Gunakan user ID dari state
          aiPercentage: aiCheckResult.percentage,
          writerSessionId: writerSession?.id // Tambahkan referensi ke writer session jika perlu
        }),
      });

      const result = await response.json();

      setScanningProgress(80);

      if (!response.ok) {
        throw new Error(result.error || 'Gagal mengirim assignment');
      }

      setScanningProgress(100);

      // Update history dengan data dari server
      const historyEntry: HistoryItem = {
        id: result.data.submissionId,
        timestamp: new Date(result.data.submittedAt),
        aiPercentage: aiCheckResult.percentage,
        wordCount: result.data.wordCount,
        title: fileName,
        version: "Final",
        type: "final",
        assignmentCode: assignmentCode,
      };

      setHistory((prev) => [historyEntry, ...prev]);

      alert(
        `✅ Assignment berhasil dikirim!\n` +
        `👤 Pengirim: ${dropdownUser.name || dropdownUser.email}\n` +
        `📚 Assignment: ${result.data.assignmentTitle}\n` +
        `🔢 Kode: ${assignmentCode}\n` +
        `🤖 Deteksi AI: ${aiCheckResult.percentage}%\n` +
        `📝 Jumlah kata: ${result.data.wordCount}`
      );

      closeAIResultModal();
      setAssignmentCode("");

    } catch (error: any) {
      console.error("❌ Error submitting assignment:", error);
      alert(`❌ Gagal mengirim assignment: ${error.message}`);
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanningProgress(0);
        setScanningText("Memulai analisis...");
      }, 500);
    }
  };

  /**
   * Fungsi utama untuk melakukan pengecekan AI menggunakan kedua API
   * @param content - Konten yang akan dicek
   * @returns Hasil gabungan dari kedua API checker
   */
  // const performAICheck = async (content: string): Promise<AICheckResult> => {
  //   try {
  //     console.log("Starting AI check for content length:", content.length);

  //     // Jalankan kedua checker secara paralel
  //     const [gptzeroResult, westlakeResult] = await Promise.all([
  //       checkWithGPTZero(content),
  //       checkWithWestlake(content),
  //     ]);

  //     console.log("AI Check Results:", { gptzeroResult, westlakeResult });


  //     return {
  //       percentage: finalPercentage,
  //       gptzero: gptzeroResult,
  //       westlake: westlakeResult,
  //     };
  //   } catch (error) {
  //     console.error("AI Check Error:", error);
  //     throw new Error("AI checking failed");
  //   }
  // };

  // ============================
  // FUNGSI EKSTRAKSI HEADING
  // ============================

  /**
   * Fungsi untuk mengekstrak heading dari konten markdown
   * Menggunakan debounced callback untuk performa yang lebih baik
   */
  // Tidak di pakai
  // const extractHeadings = useDebouncedCallback(() => {
  //   // Jangan ekstrak jika sedang sinkronisasi
  //   if (isSyncingRef.current) return;

  //   const lines = content.split("\n");
  //   const newHeadings: HeadingItem[] = [];

  //   // Scan setiap baris untuk mencari heading markdown
  //   lines.forEach((line, index) => {
  //     const trimmedLine = line.trim();
  //     if (trimmedLine.startsWith("#")) {
  //       // Hitung level heading berdasarkan jumlah #
  //       const level = (trimmedLine.match(/^#+/) || [""])[0].length;
  //       const text = trimmedLine.replace(/^#+\s*/, "");
  //       if (text) {
  //         newHeadings.push({
  //           id: `heading-${index}`,
  //           text: text,
  //           level: Math.min(level, 6), // Maksimal level 6
  //         });
  //       }
  //     }
  //   });

  //   setHeadings(newHeadings);
  // }, 500);

  /**
   * Fungsi untuk sinkronisasi daftar pustaka dengan konten
   * Menghapus bibliography yang tidak lagi dikutip dalam teks
   */
  /**
   * =================================================================================
   * FUNGSI SINKRONISASI DAFTAR PUSTAKA
   * =================================================================================
   * Fungsi ini secara otomatis mengecek konten di editor. Jika sebuah sitasi
   * (misal: [3]) dihapus dari teks, maka entri daftar pustaka nomor 3
   * juga akan dihapus dari daftar. Ini menjaga konsistensi antara teks dan daftar pustaka.
   */
  const syncBibliographyWithContent = useDebouncedCallback(() => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;

    const editor = editorRef.current?.getEditor();
    if (!editor) {
      isSyncingRef.current = false;
      return;
    }
    const blocks = editor.document;
    const contentText = extractTextFromBlockNote(blocks);

    const citedNumbersInText = new Set(
      [...contentText.matchAll(/\[(\d+)\]/g)].map((match) =>
        parseInt(match[1], 10)
      )
    );

    const currentBibList = bibliographyListRef.current;

    const stillCitedItems = currentBibList.filter((item) =>
      citedNumbersInText.has(item.number)
    );

    if (stillCitedItems.length !== currentBibList.length) {
      setBibliographyList(stillCitedItems);
    }

    const maxNumber = stillCitedItems.reduce(
      (max, item) => Math.max(max, item.number),
      0
    );
    setNextNumber(maxNumber + 1);

    isSyncingRef.current = false;
  }, 500); // 500ms debounce delay

  const handleLogout = async () => {
    const res = await fetch("/api/auth/signout", {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    if (res.ok) {
      console.log("Berhasil logout");
      router.push("signin");
    } else {
      console.error("Tidak berhasil logout");
    }
  };

  // Jalankan sinkronisasi setiap kali konten berubah
  // Tidak dipakai 
  // useEffect(() => {
  //   syncBibliographyWithContent();
  // }, [content, syncBibliographyWithContent]);



  const getArticle = async () => {
    if (!sessionId) {
      console.log('No sessionId available for fetching article');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/nodes?sessionId=${sessionId}&projectId=${projectId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch article: ${res.status}`);
      }
      
      const article = await res.json();
      setArticle(article);
      console.log('Article fetched successfully:', article);
    } catch (error) {
      console.error('Error fetching article:', error);
      notifications.show({
        title: 'Error',
        message: 'Gagal mengambil artikel',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const prepareMcpContext = useCallback(() => {
    if (!writerSession || !dropdownUser) {
      console.log('⏳ Waiting for writerSession and dropdownUser...');
      return;
    }

    console.log('🎯 Preparing MCP context...');
    console.log('- Writer Session:', writerSession.id);
    console.log('- User:', dropdownUser.id);
    console.log('- Available nodes:', article.length);

    const contextData: McpContextType = {
      sessionId: `writer-${writerSession.id}-${dropdownUser.id}`,
      contextNodeIds: [],
      contextEdgeIds: [],
      nodeId: null,
      nodeIds: [],
      mode: "general" as const // Use const assertion for literal type
    };

    // Determine context based on available nodes
    if (article.length === 0) {
      // No nodes available - general mode
      console.log('📝 Mode: GENERAL (no nodes available)');
      contextData.mode = "general" as const;
    } else if (article.length === 1) {
      // Single node mode
      console.log('🎯 Mode: SINGLE NODE');
      const singleNode = article[0];
      contextData.contextNodeIds = [singleNode.id];
      contextData.nodeId = singleNode.id;
      contextData.mode = "single node" as const;
      
      console.log('- Node ID:', singleNode.id);
      // console.log('- Node Label:', singleNode.label);
    } else {
      // Multiple nodes mode
      console.log('🎯 Mode: MULTIPLE NODES');
      const nodeIds = article.map(node => node.id);
      contextData.contextNodeIds = nodeIds;
      contextData.nodeIds = nodeIds;
      contextData.mode = "multiple node" as const;
      
      console.log('- Node IDs:', nodeIds);
      console.log('- Node Count:', nodeIds.length);
    }

    console.log('✅ Final MCP context:', contextData);
    setMcpContext(contextData);
  }, [writerSession, dropdownUser, article]);

  useEffect(() => {
    if (writerSession && dropdownUser) {
      console.log('🔄 Updating MCP context based on nodes...');
      prepareMcpContext();
    }
  }, [writerSession, dropdownUser, article, prepareMcpContext]);


  useEffect(() => {
      getArticle();
      setMounted(true);
  }, []);

  const resetBibliographyForm = () => {
    setBibliographyForm({
      author: "",
      title: "",
      year: "",
      publisher: "",
      url: "",
      journal: "",
      volume: "",
      issue: "",
      pages: "",
      accessDate: "",
      doi: "",
      edition: "",
      city: "",
      conference: "",
      medium: "",
    });
  };

  const saveBibliography = () => {
    // Validasi field yang wajib diisi
    if (
      !bibliographyForm.author ||
      !bibliographyForm.title ||
      !bibliographyForm.year
    ) {
      alert("Mohon lengkapi field yang wajib diisi (Penulis, Judul, Tahun)!");
      return;
    }

    // Buat object bibliography baru
    const bibliographyData: Bibliography = {
      id: editingBibliography?.id || Date.now().toString(),
      number: editingBibliography?.number || nextNumber,
      author: bibliographyForm.author,
      title: bibliographyForm.title,
      year: bibliographyForm.year,
      publisher: bibliographyForm.publisher,
      url: bibliographyForm.url,
      journal: bibliographyForm.journal,
      volume: bibliographyForm.volume,
      issue: bibliographyForm.issue,
      pages: bibliographyForm.pages,
      accessDate: bibliographyForm.accessDate,
      doi: bibliographyForm.doi,
      edition: bibliographyForm.edition,
      city: bibliographyForm.city,
      conference: bibliographyForm.conference,
      medium: bibliographyForm.medium,
      createdAt: editingBibliography?.createdAt || new Date(),
    };

    // Update atau tambah bibliography
    if (editingBibliography) {
      setBibliographyList((prev) =>
        prev.map((b) =>
          b.id === editingBibliography.id ? bibliographyData : b
        )
      );
    } else {
      setBibliographyList((prev) => [...prev, bibliographyData]);
      insertCitationNumber(nextNumber);
    }

    // Tutup modal dan reset form
    closeBibliographyModal();
    resetBibliographyForm();
  };

  /**
   * =================================================================================
   * FUNGSI UNTUK MENGHAPUS DAFTAR PUSTAKA
   * =================================================================================
   * Fungsi ini menangani penghapusan item dari daftar pustaka.
   * 1. Menghapus semua kemunculan sitasi dari teks di editor (misal: menghapus semua `[3]`).
   * 2. Menghapus item tersebut dari state `bibliographyList`.
   */
  const handleDeleteBibliography = (itemToDelete: Bibliography) => {
    const numberToDelete = itemToDelete.number;
    const citationText = `[${numberToDelete}]`;

    // 1. Remove citation from BlockNote editor content
    const editor = editorRef.current?.getEditor();
    if (editor) {
      const blocks = editor.document;
      blocks.forEach((block) => {
        if (Array.isArray(block.content)) {
          let blockModified = false;
          const newInlineContent: any[] = [];

          block.content.forEach((inlineContent) => {
            if (
              inlineContent.type === "text" &&
              inlineContent.text.includes(citationText)
            ) {
              blockModified = true;
              const newText = inlineContent.text.replaceAll(citationText, "");
              if (newText.length > 0) {
                newInlineContent.push({ ...inlineContent, text: newText });
              }
            } else {
              newInlineContent.push(inlineContent);
            }
          });

          if (blockModified) {
            editor.updateBlock(block.id, {
              content: newInlineContent,
            });
          }
        }
      });
    }

    // 2. Remove from bibliography list state
    setBibliographyList((prev) =>
      prev.filter((item) => item.id !== itemToDelete.id)
    );
  };


  //Perlu diperhatikan
  const insertCitationNumber = (number: number) => {
    const citationText = `[${number}]`;
    editorRef.current?.insertCitation?.(citationText);
  };

  const insertCitation = (bibliography: Bibliography) => {
    insertCitationNumber(bibliography.number);
  };

  const formatBibliography = (bibliography: Bibliography) => {
    const {
      author,
      title,
      year,
      publisher,
      journal,
      volume,
      issue,
      pages,
      url,
      doi,
      city,
    } = bibliography;

    let formatted = `${author} (${year}). *${title}*.`;

    // Format untuk artikel jurnal
    if (journal) {
      formatted = `${author} (${year}). ${title}. *${journal}*${
        volume ? `, ${volume}` : ""
      }${issue ? `(${issue})` : ""}${pages ? `, pp. ${pages}` : ""}.${
        doi ? ` doi:${doi}` : ""
      }`;
    }
    // Format untuk buku
    else if (publisher) {
      formatted = `${author} (${year}). *${title}*. ${
        city ? city + ": " : ""
      }${publisher}.`;
    }
    // Format untuk sumber online
    else if (url) {
      formatted = `${author} (${year}). ${title}. Retrieved from ${url}`;
    }

    return formatted;
  };

  /**
   * Fungsi untuk generate daftar pustaka lengkap yang sudah diformat
   * @returns String daftar pustaka lengkap
   */
  const generateFullBibliography = () => {
    return bibliographyList
      .sort((a, b) => a.number - b.number)
      .map(
        (bibliography) =>
          `[${bibliography.number}] ${formatBibliography(bibliography)}`
      )
      .join("\n\n");
  };

  const editorRef = useRef<BlockNoteEditorRef>(null);

  /**
   * =================================================================================
   * FUNGSI UNTUK MENAMBAHKAN ARTIKEL KE DAFTAR PUSTAKA (FUNGSI 'CITE')
   * =================================================================================
   * Fungsi ini dipanggil ketika tombol "Cite" pada sebuah artikel di "Reference Manager"
   * ditekan. Logikanya:
   * 1. Cek apakah artikel ini sudah ada di daftar pustaka.
   * 2. Jika sudah ada, cukup masukkan nomor sitasinya ke dalam teks.
   * 3. Jika belum ada, buat entri daftar pustaka baru dari detail artikel,
   * tambahkan ke `bibliographyList`, dan masukkan nomor sitasi baru ke dalam teks.
   */
  const addArticleToBibliography = (articleItem: Article) => {
    // Cek apakah artikel sudah ada dalam daftar pustaka
    const existingBibliography = bibliographyListRef.current.find(
      (b) => b.sourceId === articleItem.id
    );

    if (existingBibliography) {
      // Jika sudah ada, insert nomor sitasinya saja
      editorRef.current?.insertCitation?.(`[${existingBibliography.number}]`);
      notifications.show({
        title: "Sitasi Ditambahkan",
        message: `Nomor referensi [${existingBibliography.number}] telah dimasukkan ke dalam teks.`,
        color: "blue",
      });
      return;
    }

    // Buat bibliography baru dari artikel
    const newBibliography: Bibliography = {
      id: Date.now().toString(),
      sourceId: articleItem.id,
      number: nextNumber,
      author: articleItem.att_background, // Menggunakan background sebagai author
      title: articleItem.title,
      year: new Date().getFullYear().toString(), // Menggunakan tahun saat ini
      url: articleItem.att_url,
      journal: articleItem.att_background, // Menggunakan background sebagai jurnal
      createdAt: new Date(),
    };

    setBibliographyList((prev) => [...prev, newBibliography]);
    editorRef.current?.insertCitation?.(`[${nextNumber}]`);
    setNextNumber((n) => n + 1);
    notifications.show({
      title: "Referensi Baru Dibuat",
      message: `Referensi untuk "${articleItem.title}" telah dibuat dengan nomor [${nextNumber}] dan dimasukkan ke dalam teks.`,
      color: "green",
    });
  };

// PERBAIKAN 4: Sinkronkan ref dengan state (jika ref masih diperlukan)


  /**
   * Fungsi untuk jump ke heading tertentu (placeholder)
   * @param headingId - ID heading yang akan dituju
   */
  // const jumpToHeading = (headingId: string) => {
  //   const headingIndex = parseInt(headingId.split("-")[1]);
  //   const lines = content.split("\n");
  //   const targetLine = lines[headingIndex];
  //   if (targetLine) {
  //     // Implementasi sederhana - dalam aplikasi nyata akan scroll ke heading
  //     console.log("Jump to heading:", targetLine);
  //   }
  // };

  const jumpToHeading = (headingId: string) => {
    console.log("Jumping to heading ID (placeholder):", headingId);
    // The actual scroll implementation is in the heading's onClick in the JSX.
    // This function's body is cleared to prevent compile errors.
  };

  const convertEditorContentToPlainText = (blocks: any[]): string => {
    return blocks
      .map((block) =>
        (block.content || [])
          .map((item: any) => typeof item === "string" ? item : item.text || "")
          .join("")
      )
      .join('\n\n')
      .trim();
  };
  
  const extractTextFromBlockNote = (blocks: any[]): string => {
    return blocks
      .map((block) => {
        if (!block || !block.content) return "";
        if (typeof block.content === "string") return block.content;
        if (Array.isArray(block.content)) {
          return block.content
            .map((item: any) => typeof item === "string" ? item : item?.text || "")
            .join(" ");
        }
        return "";
      })
      .join("\n")
      .trim();
  };
  
  /**
   * Fungsi untuk menyimpan artikel final dengan pengecekan AI
   */
  const handleFinalSave = async () => {
    try {
      const blocks = editorRef.current?.getContent() || [];
      const contentText = extractTextFromBlockNote(blocks);

      if (!contentText || contentText.trim().length < 10) {
        alert("Konten artikel masih kosong atau terlalu pendek.");
        return;
      }

      const wordCount = contentText
        .split(/\s+/)
        .filter((word) => word.length > 0).length;

      if (wordCount < 10) {
        alert("Konten terlalu pendek untuk dianalisis. Minimal 10 kata.");
        return;
      }

      setIsScanning(true); // start overlay
      setScanningText("Menganalisis kalimat...");
      setScanningProgress(25);

      const result = await checkWithGPTZero(contentText);

      setScanningText("Memproses hasil akhir...");
      setScanningProgress(80);

      setAiCheckResult(result);
      openAIResultModal();

      setScanningProgress(100);
    } catch (error) {
      console.error("❌ Error in final save:", error);
      alert("Terjadi kesalahan saat menganalisis artikel. Silakan coba lagi.");
    } finally {
      setTimeout(() => {
        setIsScanning(false);
        setScanningProgress(0);
        setScanningText("Memulai analisis...");
      }, 500); // beri sedikit delay agar smooth
    }
  };

  // const handleSaveDraft = async () => {
  //   const editorInstance = editorRef.current?.getEditor?.();
  //   const contentBlocks = editorInstance?.document;

  //   // Gabungkan semua isi jadi teks utuh
  //   const contentText = contentBlocks
  //     ?.map((block: any) => {
  //       if (typeof block.content === 'string') return block.content;
  //       if (Array.isArray(block.content)) {
  //         return block.content.map((c: any) => c.text || '').join('');
  //       }
  //       return '';
  //     })
  //     .join('\n')
  //     .trim();

  //   const wordCount = contentText?.split(/\s+/).filter(Boolean).length || 0;

  //   if (!contentText || wordCount === 0) {
  //     notifications.show({
  //       title: "Konten Kosong",
  //       message: "Silakan tulis konten terlebih dahulu!",
  //       color: "red",
  //     });
  //     return;
  //   }

  //   // ✨ Ambil judul dari heading pertama
  //   let title = "Judul Artikel " + draftCounter;
  //   const headingBlock = contentBlocks?.find(
  //     (block: any) => block.type === "heading"
  //   );

  //   if (headingBlock && Array.isArray(headingBlock.content)) {
  //     title = headingBlock.content.map((c: any) => c.text || '').join('').trim();
  //   }

  //   const draftEntry: HistoryItem = {
  //     id: Date.now().toString(),
  //     timestamp: new Date(),
  //     wordCount,
  //     title,
  //     version: `Versi ${draftCounter}`,
  //     type: "draft",
  //     aiPercentage: undefined,
  //   };

  //   setHistory((prev) => [draftEntry, ...prev]);
  //   setDraftCounter((prev) => prev + 1);

  //   notifications.show({
  //     title: "Berhasil",
  //     message: "Draf berhasil disimpan.",
  //     color: "green",
  //   });
  // };
  const handleSaveDraft = async () => {
    const editorInstance = editorRef.current?.getEditor?.();
    const contentBlocks = editorInstance?.document;

    if (!contentBlocks || contentBlocks.length === 0) {
      notifications.show({
        title: "Konten Kosong",
        message: "Silakan tulis konten terlebih dahulu!",
        color: "red",
      });
      return;
    }

    // Extract text menggunakan function yang sudah ada
    const contentText = extractTextFromBlockNote(contentBlocks);
    const wordCount = contentText.split(/\s+/).filter(Boolean).length;

    if (wordCount === 0) {
      notifications.show({
        title: "Konten Kosong",
        message: "Silakan tulis konten terlebih dahulu!",
        color: "red",
      });
      return;
    }

    // Extract title dari heading pertama
    let title = `Artikel ${draftCounter}`;
    const headingBlock = contentBlocks.find((block: any) => block.type === "heading");
  
    if (headingBlock && Array.isArray(headingBlock.content)) {
      const headingText = headingBlock.content
        .map((c: any) => c.text || "")
        .join("")
        .trim();
      if (headingText) {
        title = headingText;
      }
    }

    // Validasi writerSession
    if (!writerSession?.id) {
      notifications.show({
        title: "Error",
        message: "Writer session tidak ditemukan!",
        color: "red",
      });
      return;
    }

  try {
    setLoading(true); // Assuming you have loading state
    
    // Save to database
    const response = await fetch("/api/draft/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        writerSessionId: writerSession.id,
        title,
        contentBlocks,
        wordCount
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Failed to save draft");
    }

    // Update local history state
    const draftEntry: HistoryItem = {
      id: result.draft.id,
      timestamp: new Date(result.draft.createdAt),
      wordCount,
      title,
      version: `Versi ${draftCounter}`,
      type: "draft"
    };

    setHistory((prev) => [draftEntry, ...prev]);
    setDraftCounter((prev) => prev + 1);

    notifications.show({
      title: "Berhasil",
      message: `Draft "${title}" berhasil disimpan dengan ${result.sectionsCount} sections.`,
      color: "green",
    });

    console.log('✅ Draft saved:', result.draft);

  } catch (error) {
    console.error('❌ Error saving draft:', error);
    notifications.show({
      title: "Error",
      message: "Gagal menyimpan draft. Silakan coba lagi.",
      color: "red",
    });
  } finally {
    setLoading(false);
  }
};

  const fetchNavbarUser = async () => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!data || data.error) {
        setNavUser(null);
        console.warn("No navbar user session found");
      } else {
        setNavUser(data);
      }
    } catch (err) {
      console.error("Failed to fetch navbar user:", err);
      setNavUser(null);
    }
  };

  useEffect(() => {
    fetchNavbarUser();
    fetchDropdownUser();
  }, []);

  useEffect(() => {
    if (activeTab !== 'chat') {
      // Reset context saat pindah dari chat ke tab lain
      setResetChatContext(true)
    }
  }, [activeTab]);

  // Enhanced headings state dengan level
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<string[]>([]);
  const [editorContent, setEditorContent] = useState<any[]>([]);

  const handleContentChange = (content: any[]) => {
    setEditorContent(content);

    // ✅ MODIFICATION: Trigger bibliography sync when content changes
    syncBibliographyWithContent();

    // Extract headings from BlockNote content dengan level
    const extractedHeadings: { id: string; text: string; level: number }[] = [];
    let firstH1Title = "";
    let hasAnyContent = false;
        
    content.forEach((block) => {
      // Check if ada content apapun
      if (block.content && block.content.length > 0) {
        const hasText = block.content.some((item: any) => {
          const text = typeof item === "string" ? item : (item.text || "");
          return text.trim().length > 0;
        });
        if (hasText) {
          hasAnyContent = true;
        }
      }
        
      if (block.type === "heading" && block.content?.length > 0) {
        const text = block.content.map((item: any) => item.text || "").join("");
        if (text.trim()) {
          const level = block.props?.level || 1;
            
          extractedHeadings.push({
            id: block.id || `heading-${Math.random().toString(36).substr(2, 9)}`,
            text: text.trim(),
            level: level,
          });
            
          // Auto-update fileName dengan H1 pertama yang ditemukan
          if (level === 1 && !firstH1Title) {
              firstH1Title = text.trim();
          }
        }
      }
    });
        
    setHeadings(extractedHeadings);
        
    // Logic untuk update/reset title
    if (!hasAnyContent) {
      // Jika editor benar-benar kosong, reset title
      setFileName("📝 Tidak ada judul");
    } else if (firstH1Title && firstH1Title !== fileName) {
      // Jika ada H1, update dengan H1 tersebut
      setFileName(firstH1Title);
    }
    // Jika ada content tapi tidak ada H1, biarkan title yang ada
        // const plainText = extractTextFromBlockNote(content);
        // setContent(plainText);
  };

  const handleSaveFinal = () => {
    console.log("Final:", editorContent);
    alert("Artikel final disimpan!");
  };

  //Tambahan Untuk List of Note
  const params = useParams();
  const rawSessionId = params?.id;
  const sessionIdN = Array.isArray(rawSessionId) ? rawSessionId[0] : rawSessionId;
  
  //for reset
  const [resetChatContext, setResetChatContext] = useState(false);
  const handleContextReset = () => {
    setResetChatContext(false);
  }

  const [selectedNode, setSelectedNode] = useState<ExtendedNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<ExtendedEdge | null>(null);

  return (
    <AppShell
      header={{ height: 90 }}
      padding="md"
    >
      <AppShell.Header
        style={{
          backgroundColor:
              computedColorScheme === "dark" ? "#1a1b1e" : "white",
            borderBottom: `1px solid ${computedColorScheme === 'dark' ? '#2a2a2a' : '#e0e0e0'}`,
            paddingLeft: rem(16),
            paddingRight: rem(16),
        }}
      >
        <Container 
          size="responsive" 
          className={classes.responsiveContainer}
          style={{ height: "100%" }}
        >
          <Flex 
            align="center" 
            justify="space-between" 
            h="100%" 
            wrap="nowrap" 
            gap="sm" 
            style={{
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            <Group align="center" gap="sm" style={{ flexShrink: 0}}>
              <Image
                // component={NextImage}
                src='/images/logoSRE_Tulis.png'
                alt="Logo"
                width={200}  // Tambahkan ini
                height={50}  // Tambahkan ini
                fit="contain"
              />
              <div style={{
                width: '1px',
                height: '40px',
                backgroundColor: '#ccc',
                marginLeft: '10px',
                marginRight: '10px'
              }} 
              /> 
            </Group>

            <div style={{ flexGrow: 1, flexShrink: 1, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
              {navUser ? (
                <div style={{ lineHeight: 1.3 }}>
                  <Text
                    size="lg"
                    fw={600}
                    style={{
                      whiteSpace: 'nowrap',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                      color: dark ? 'white' : '#1c1c1c',
                    }}
                  >
                    Halo, {(dropdownUser!.name).split('@')[0]} — Selamat datang di MySRE
                  </Text>
                  <Text size="sm" c="dimmed" style={{ marginTop: 2 }}>
                    Group {navUser.group}
                  </Text>
                </div>
              ) : (
                <Text size="sm" c="dimmed">Memuat data pengguna...</Text>
              )}
            </div>

            <Group gap="sm" style={{ flexShrink: 0, whiteSpace: 'nowrap' }}>
              <Tooltip label={dark ? 'Light mode' : 'Dark mode'}>
                <ActionIcon
                  variant="light"
                  color={dark ? 'yellow' : 'blue'}
                  onClick={toggleColorScheme}
                  size="lg"
                  radius="md"
                >
                  {dark ? <IconSun size={18} /> : <IconMoon size={18} />}
                </ActionIcon>
              </Tooltip>
            
              <Tooltip label="Settings">
                <ActionIcon variant="light" color="gray" size="lg">
                  <IconSettings size={18} />
                </ActionIcon>
              </Tooltip>
                      
              <Menu shadow="lg" width={220} position="bottom-end" offset={10}>
                <Menu.Target>
                  <ActionIcon variant="light" size="lg" radius="xl">
                    <Avatar
                      size="sm"
                      radius="xl"
                      variant="gradient"
                      gradient={{ from: 'blue', to: 'cyan', deg: 45 }}
                      style={{ cursor: 'pointer' }}
                    >
                      <IconUser size={16} />
                    </Avatar>
                  </ActionIcon>
                </Menu.Target>
            
                <Menu.Dropdown>
                  <Menu.Label>
                    <Group gap="xs">
                      <Avatar size="xs" color="blue">U</Avatar>
                      <Text size="sm">Signed in as</Text>
                    </Group>
                  </Menu.Label>
                  <Menu.Item>
                    <Text size="sm" fw={600}>{(dropdownUser?.name)?.split('@')[0]}</Text>
                    <Text size="xs" c="dimmed">{dropdownUser?.email}</Text>
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item 
                      leftSection={<IconLogout size={16} />}
                      color="red" 
                      onClick={handleLogout}
                  >
                    Sign out
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            </Group>
          </Flex>
        </Container>
      </AppShell.Header>
      <AppShell.Main style={{ position: "relative", height: "100vh", overflow: "hidden" }}>
         
        <div style={{ position: "relative", zIndex: 11, height: "100%" }}>
          <Flex
            direction={isMobile ? "column" : "row"}
            justify="space-between"
            align="stretch"
            style={{ height: "100%", flexGrow: 1}}
            gap="md"
          >
            {/* Panel Kiri */}
            <Box
              style={{
                width: isMobile ? '100%' : 280, // Diperbesar dari 240px
                flexShrink: 0,
                minHeight: isMobile ? 200 : 'auto',
                flexGrow: 0,
                flexBasis: 280,
                border: `1px solid ${computedColorScheme === 'dark' ? '#404040' : '#e9ecef'}`,
                borderRadius: '12px', // Lebih rounded
                backgroundColor: computedColorScheme === 'dark' ? '#1a1b1e' : '#ffffff',
                padding: '20px', // Padding lebih besar
                display: 'flex',
                flexDirection: 'column',
                maxHeight: 'calc(100vh - 140px)',
                overflowY: 'hidden', // Ubah ke hidden untuk container utama
                boxSizing: "border-box",
                boxShadow: computedColorScheme === 'dark' 
                  ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
                  : '0 4px 20px rgba(0, 0, 0, 0.08)',
              }}
            >
              <Box mb="lg">
                <Group align="center" gap="sm" mb="md">
                  <Box
                    style={{
                      background: 'linear-gradient(135deg, #007BFF, #0056b3)',
                      borderRadius: '8px',
                      padding: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconFileText size={18} color="white" />
                  </Box>
                  <Text size="md" fw={700} c={computedColorScheme === 'dark' ? '#ffffff' : '#1a1b1e'}>
                    Outline Artikel
                  </Text>
                </Group>

                {/* Title Input dengan styling yang diperbaiki */}
                <TextInput
                  value={fileName}
                  onChange={(e) => setFileName(e.currentTarget.value)}
                  variant="filled"
                  size="md"
                  placeholder="Judul artikel..."
                  styles={{
                    input: {
                      fontWeight: 600,
                      fontSize: '16px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      backgroundColor: computedColorScheme === 'dark' ? '#2d3748' : '#f8f9fa',
                      border: `1px solid ${computedColorScheme === 'dark' ? '#4a5568' : '#dee2e6'}`,
                      color: computedColorScheme === 'dark' ? '#ffffff' : '#1a1b1e',
                      transition: 'all 0.2s ease',
                      '&:focus': {
                        borderColor: '#007BFF',
                        backgroundColor: computedColorScheme === 'dark' ? '#1a202c' : '#ffffff',
                      }
                    },
                  }}
                />
              </Box>

              {/* Container untuk headings dengan scroll yang tepat */}
              <Box style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <ScrollArea 
                  style={{ 
                    flex: 1,
                    paddingRight: '8px', // Space untuk scrollbar
                  }}
                  scrollbarSize={6}
                  scrollHideDelay={500}
                >
                  <Stack gap={6}>
                    {headings.length === 0 ? (
                      <Box ta="center" py="xl">
                        <Box
                          style={{
                            background: computedColorScheme === 'dark' 
                              ? 'linear-gradient(135deg, #2d3748, #4a5568)' 
                              : 'linear-gradient(135deg, #f8f9fa, #e9ecef)',
                            borderRadius: '12px',
                            padding: '24px',
                            border: `2px dashed ${computedColorScheme === 'dark' ? '#4a5568' : '#dee2e6'}`,
                          }}
                        >
                          <IconBulb 
                            size={32} 
                            color={computedColorScheme === 'dark' ? '#a0aec0' : '#6c757d'} 
                            style={{ marginBottom: '12px' }} 
                          />
                          <Text size="sm" fw={600} c="dimmed" mb="xs">
                            Outline Kosong
                          </Text>
                          <Text size="xs" c="dimmed" ta="center" lh={1.4}>
                            Mulai menulis dengan heading atau gunakan AI untuk membuat struktur artikel
                          </Text>
                        </Box>
                      </Box>
                    ) : (
                      headings.map(({ id, text, level }) => {
                        // Enhanced styling untuk setiap level
                        const getHeadingConfig = () => {
                          switch(level) {
                            case 1: 
                              return {
                                icon: '📝',
                                color: '#1971c2',
                                bgColor: computedColorScheme === 'dark' ? 'rgba(25, 113, 194, 0.1)' : 'rgba(25, 113, 194, 0.05)',
                                borderColor: 'rgba(25, 113, 194, 0.2)',
                                fontSize: '14px',
                                fontWeight: 700,
                                padding: '12px 16px',
                              };
                            case 2: 
                              return {
                                icon: '📌',
                                color: '#2f9e44',
                                bgColor: computedColorScheme === 'dark' ? 'rgba(47, 158, 68, 0.1)' : 'rgba(47, 158, 68, 0.05)',
                                borderColor: 'rgba(47, 158, 68, 0.2)',
                                fontSize: '13px',
                                fontWeight: 600,
                                padding: '10px 14px',
                              };
                            case 3: 
                              return {
                                icon: '🔸',
                                color: '#f76707',
                                bgColor: computedColorScheme === 'dark' ? 'rgba(247, 103, 7, 0.1)' : 'rgba(247, 103, 7, 0.05)',
                                borderColor: 'rgba(247, 103, 7, 0.2)',
                                fontSize: '12px',
                                fontWeight: 500,
                                padding: '8px 12px',
                              };
                            default: 
                              return {
                                icon: '▪',
                                color: '#7048e8',
                                bgColor: computedColorScheme === 'dark' ? 'rgba(112, 72, 232, 0.1)' : 'rgba(112, 72, 232, 0.05)',
                                borderColor: 'rgba(112, 72, 232, 0.2)',
                                fontSize: '11px',
                                fontWeight: 500,
                                padding: '6px 10px',
                              };
                          }
                        };
                        
                        const config = getHeadingConfig();
                        const indentation = (level - 1) * 16;

                        return (
                          <Box
                            key={id}
                            style={{ 
                              marginLeft: indentation,
                              maxWidth: `calc(100% - ${indentation}px)`,
                            }}
                          >
                            <Paper
                              p={0}
                              style={{
                                cursor: 'pointer',
                                borderRadius: '8px',
                                transition: 'all 0.2s ease',
                                backgroundColor: config.bgColor,
                                border: `1px solid ${config.borderColor}`,
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'translateY(-1px)',
                                  boxShadow: `0 4px 12px ${config.borderColor}`,
                                  backgroundColor: config.bgColor,
                                }
                              }}
                              onClick={() => {
                                try {
                                  // Enhanced scroll dengan highlight
                                  const blockElement = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
                                  if (blockElement) {
                                    blockElement.scrollIntoView({ 
                                      behavior: 'smooth', 
                                      block: 'center' 
                                    });
                                    
                                    // Temporary highlight effect
                                    blockElement.style.background = 'rgba(59, 130, 246, 0.15)';
                                    blockElement.style.borderLeft = '4px solid #3b82f6';
                                    blockElement.style.borderRadius = '0 8px 8px 0';
                                    blockElement.style.transition = 'all 0.3s ease';
                                    
                                    setTimeout(() => {
                                      blockElement.style.background = '';
                                      blockElement.style.borderLeft = '';
                                      blockElement.style.borderRadius = '';
                                    }, 2500);
                                  }
                                } catch (error) {
                                  console.error('Error scrolling to heading:', error);
                                }
                              }}
                            >
                              <Box style={{ padding: config.padding }}>
                                <Group gap="sm" align="center" wrap="nowrap">
                                  <Text size="sm" style={{ flexShrink: 0 }}>
                                    {config.icon}
                                  </Text>
                                  
                                  <Box style={{ flex: 1, minWidth: 0 }}>
                                    <Text
                                      size={config.fontSize}
                                      fw={config.fontWeight}
                                      style={{
                                        color: config.color,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        lineHeight: 1.3,
                                      }}
                                      title={text}
                                    >
                                      {text}
                                    </Text>
                                  </Box>
                                  
                                  <Badge 
                                    size="xs" 
                                    color={config.color.replace('#', '')}
                                    variant="light"
                                    style={{ 
                                      flexShrink: 0,
                                      fontSize: '10px',
                                      fontWeight: 600,
                                    }}
                                  >
                                    H{level}
                                  </Badge>
                                </Group>
                              </Box>
                            </Paper>
                          </Box>
                        );
                      })
                    )}
                  </Stack>
                </ScrollArea>
              </Box>

{/* <Text size="xs" fw={600} c="dimmed" mb="sm" ml="sm">
                Daftar Artikel
              </Text>

              <TextInput
                value={fileName}
                onChange={(e) => setFileName(e.currentTarget.value)}
                variant="unstyled"
                styles={{
                  input: {
                    fontWeight: 600,
                    fontSize: '17px',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    backgroundColor: computedColorScheme === 'dark' ? '#007BFF' : '#007BFF',
                    marginBottom: '12px',
                    color: 'white',
                  },
                }}
              />

              {/* En              hanced Daftar heading dengan navigation dan level */}
              {/* <Stack ml="sm" gap={8}>
                {headings.length === 0 ? (
                  <Box ta="center" py="md">
                    <Text size="xs" c="dimmed" mb="xs">
                      Outline artikel akan muncul di sini
                    </Text>
                    <Text size="xs" c="dimmed">
                      Gunakan AI untuk membuat konten dengan heading
                    </Text>
                  </Box>
                ) : (
                  headings.map(({ id, text, level }) => {
                    // Get icon berdasarkan level
                    const getHeadingIcon = () => {
                      switch(level) {
                        case 1: return '📝';
                        case 2: return '📌';
                        case 3: return '🔸';
                        case 4: return '▪️';
                        default: return '•';
                      }
                    };
                    
                    // Get indentation berdasarkan level
                    const getIndentation = () => {
                      return (level - 1) * 12;
                    };
                    
                    // Get color berdasarkan level
                    const getTextColor = () => {
                      switch(level) {
                        case 1: return '#1971c2';
                        case 2: return '#2f9e44';
                        case 3: return '#f76707';
                        case 4: return '#7048e8';
                        default: return '#495057';
                      }
                    };

                    return (
                      <Group
                        key={id}
                        gap="xs"
                        p="xs"
                        style={{ 
                          cursor: 'pointer',
                          marginLeft: getIndentation(),
                          borderRadius: 6,
                          transition: 'all 0.2s ease',
                          border: '1px solid transparent',
                          maxWidth: "100%", // ✅ cegah Group memaksa melebar
                          overflow: "hidden",
                        }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-200"
                        onClick={() => {
                          // Enhanced scroll function
                          try {
                            // Method 1: Cari berdasarkan block ID
                            const blockElement = document.querySelector(`[data-id="${id}"]`) as HTMLElement;
                            if (blockElement) {
                              blockElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'center' 
                              });
                              
                              // Highlight sementara
                              blockElement.style.background = 'rgba(59, 130, 246, 0.1)';
                              blockElement.style.borderLeft = '4px solid #3b82f6';
                              blockElement.style.borderRadius = '0 8px 8px 0';
                              setTimeout(() => {
                                blockElement.style.background = '';
                                blockElement.style.borderLeft = '';
                                blockElement.style.borderRadius = '';
                              }, 2000);
                              return;
                            }
                            
                            // Method 2: Fallback ke method lama
                            const element = document.getElementById(id) as HTMLElement;
                            if (element) {
                              element.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start' 
                              });
                            }
                          } catch (error) {
                            console.error('Error scrolling to heading:', error);
                          }
                        }}
                      >
                        <Text size="xs" style={{ minWidth: 16 }}>
                          {getHeadingIcon()}
                        </Text>
                        <Text
                          size="sm"
                          fw={level <= 2 ? 600 : 500}
                          style={{
                            color: getTextColor(),
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            maxWidth: '130px', // ⬅️ Batasi panjang maksimal heading
                            display: 'inline-block',
                            lineHeight: '1.2',
                          }}
                          title={text}
                        >
                          {text}
                        </Text>
                        <Text size="xs" c="dimmed">
                          H{level}
                        </Text>
                      </Group>
                    );
                  })
                )}
              </Stack> */} 
            </Box>

            {isSmallScreen ? (
              <ScrollArea style={{ flex: 1 }}>
                <Stack gap="md" style={{ width: "100%"}}>
                  <Box style={{
                    width: '100%',
                    flexGrow: 1,
                    Height: 1500,
                    padding: 6,
                    boxSizing: 'border-box',
                    backgroundColor: computedColorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
                    borderRadius: 8,
                    overflow: 'auto',
                  }}>
                    {/* Panel Tengah */}
                    <Box
                      style={{
                        width: isMobile ? '100%' : 280,
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        backgroundColor: computedColorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                        padding: 10,
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'auto',
                        maxHeight: 'calc(100vh - 140px)',
                        height: '100%',
                        minHeight: isMobile ? 200 : 'auto',
                        minWidth: 0,
                        boxSizing: "border-box",
                      }}
                    >
                      
                      <Box style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                        {/* BlockNote Editor Component dengan AI Indonesia */}
                          <BlockNoteEditorComponent
                            ref={editorRef}
                            onContentChange={handleContentChange}
                            style={{
                              flex: 1,
                              overflow: 'hidden',
                              display: 'flex',
                              flexDirection: 'column',
                            }}
                            mcpContext={mcpContext}
                            writerSession={writerSession}
                            projectId={projectId}
                            isFromBrainstorming={isFromBrainstorming}
                            nodesData={article} 
                          />
                          {isScanning && (
                            /* Scanning Overlay */
                            <Box
                              style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                background: "rgba(0, 123, 255, 0.05)",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                alignItems: "center",
                                zIndex: 1000,
                                backdropFilter: "blur(2px)",
                              }}
                            >
                              <Stack align="center" gap="xl">
                                <Box
                                  style={{
                                    background: "linear-gradient(135deg, #007BFF, #0056b3)",
                                    borderRadius: "50%",
                                    padding: "30px",
                                    boxShadow: "0 8px 32px rgba(0, 123, 255, 0.3)",
                                    animation: "pulse 2s infinite",
                                  }}
                                >
                                  <IconScan size={48} color="white" />
                                </Box>

                                <Stack align="center" gap="md">
                                  <Title order={3} c="blue" ta="center">
                                    Deteksi AI Sedang Berjalan
                                  </Title>

                                  <Text size="lg" c="dimmed" ta="center">
                                    {scanningText}
                                  </Text>

                                  <Progress
                                    value={scanningProgress}
                                    size="lg"
                                    radius="xl"
                                    style={{ width: "300px" }}
                                    color="blue"
                                    striped
                                    animated
                                  />

                                  <Text size="sm" c="dimmed" ta="center">
                                    {scanningProgress}% Complete
                                  </Text>
                                </Stack>

                                <Group gap="xs" align="center">
                                  <IconRobot size={16} color="#007BFF" />
                                  <Text size="xs" c="dimmed">
                                    Didukung oleh Deteksi AI GPTZero
                                  </Text>
                                </Group>
                              </Stack>
                            </Box>
                          )}
                      </Box>

                      {/* Action Buttons */}
                      <Group justify="flex-end" mt="sm" gap="md">
                        <Button 
                          variant="outline" 
                          color="blue" 
                          leftSection={
                            isScanning ? (
                              <Loader size={18} color="white" />
                            ) : (
                              <IconUpload size={18} />
                            )
                          } 
                          radius="md" 
                          size="md" 
                          px={24} 
                          onClick={handleSaveDraft}
                          style={{
                            transition: 'all 0.2s ease',
                          }}
                          disabled={isScanning}
                        >
                          Simpan Draf
                        </Button>

                        <Button 
                          variant="filled" 
                          color="blue" 
                          leftSection={
                            isScanning ? (
                              <Loader size={18} color="white" />
                            ) : (
                              <IconUpload size={18} />
                            )
                          } 
                          radius="md" 
                          size="md" 
                          px={24} 
                          onClick={handleFinalSave}
                          style={{
                            transition: 'all 0.2s ease',
                          }}
                          disabled={isScanning}
                        >
                          {isScanning ? "AI Checker..." : "Simpan Final"}
                        </Button>
                      </Group>
                    </Box> 
                  </Box>
                  <Box style={{
                    width: '100%',
                    height: 800,
                    padding: 6,
                    boxSizing: 'border-box',
                    backgroundColor: computedColorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
                    borderRadius: 8,
                    overflow: 'auto',
                  }}>
                    {/* Panel Kanan */}
                    <Box
                      style={{
                        width: isMobile ? "100%" : "280",
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        backgroundColor: computedColorScheme === "dark" ? "#2a2a2a" : "#f9f9f9",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        maxHeight: "calc(100vh - 140px)", // samakan tinggi dengan panel tengah
                        height: "100%",              // 🟢 FIX INI
                        minHeight: isMobile ? 200 : 'auto',
                        overflow: "auto",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                        boxSizing: "border-box",
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '16px',
                          marginBottom: '20px',
                          padding: '10px 16px',
                          borderRadius: '16px',
                          // border: '2px solid #007BFF',
                          backgroundColor: computedColorScheme === "dark" ? "rgba(0, 123, 255, 0.08)" : "rgba(0, 123, 255, 0.15)",
                          // width: '10 px',
                          marginInline: '40px',
                          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.15)',
                          backdropFilter: 'blur(12px)',
                          WebkitBackdropFilter: 'blur(12px)',
                        }}
                      >
                        {[
                          // { icon: <IconHighlight size={20} />, value: "knowledge" },
                          { icon: <IconGraph size={24} />, value: "chat", label: "Referensi Pustaka" },
                          { icon: <IconList size={24} />, value: "bibliography", label: "Daftar Pustaka" },
                          { icon: <IconHistory size={24} />, value: "history", label: "Riwayat" },
                          { icon: <IconHighlight size={24} />, value: "annotation", label: "Catatan" }, // baru
                        ].map((item) => (
                          <Tooltip
                            key={item.value}
                            label={item.label}
                            withArrow
                            position="bottom"
                            color="#007BFF"
                            transitionProps={{ transition: 'pop', duration: 200 }}
                            arrowOffset={8}
                            offset={6}
                          >
                            <ActionIcon
                              // key={item.value}
                              onClick={() => setActiveTab(item.value)}
                              radius="xl"
                              size="lg"
                              variant={activeTab === item.value ? "filled" : "light"}
                              color="#007BFF"
                              style={{
                                // border: activeTab === item.value ? "2px solid transparent" : "2px solid #007BFF",
                                // backgroundColor: activeTab === item.value ? "#007BFF" : "transparent",
                                // color: activeTab === item.value ? "#fff" : "#007BFF",
                                transition: 'all 0.3s ease',
                                boxShadow: activeTab === item.value ? '0 0 8px rgba(0, 123, 255, 0.4)' : 'none',
                                transform: activeTab === item.value ? 'scale(1.1)' : 'scale(1)',
                              }}
                            >
                              {item.icon}
                            </ActionIcon>
                          </Tooltip>
                        ))}
                      </Box>

                      <div
                        style={{
                          width: "100%",
                          height: "1px",
                          backgroundColor: "#ccc",
                          marginBottom: "12px",
                        }}
                      />
                      <ScrollArea style={{ flex: 1 }}>
                        {activeTab === "annotation" && (
                          <Box style={{ flex: 1, overflow: 'auto' }}>
                            <AnnotationPanel sessionId={sessionIdN} />
                          </Box>
                        )}
                        {activeTab === "chat" && (
                          <>
                            {/* Header section dengan informasi */}
                            <Group align="center" justify="space-between" mb="md">
                              <Group align="center" gap="sm">
                                <Box
                                  style={{
                                    backgroundColor: "#007BFF",
                                    padding: "8px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <IconList size={18} color="#fff" />
                                </Box>
                                <Box>
                                  <Title
                                    order={4}
                                    style={{
                                      margin: 0,
                                      color: "#007BFF",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Referensi Pustaka ({article.length})
                                  </Title>
                                  <Text size="xs" c="dimmed" mt={-4}>
                                    Kelola reference manager
                                  </Text>
                                </Box>
                              </Group>
                            </Group>

                            <div
                              style={{
                                width: "100%",
                                height: "1px",
                                backgroundColor: "#ccc",
                                marginBottom: "12px",
                              }}
                            />

                            {/* Search box untuk pencarian artikel */}
                            <Box mb="md">
                              <TextInput
                                placeholder="Cari Artikel"
                                variant="filled"
                                leftSection={<IconSearch size={16} />}
                                value={searchQuery}
                                style={{
                                  backgroundColor:
                                    computedColorScheme === "dark"
                                      ? "#2a2a2a"
                                      : "#f8f9fa",
                                }}
                                onChange={(e) => {
                                  setSearchQuery(e.currentTarget.value);
                                }}
                              />
                              {searchQuery && (
                                <Text size="xs" c="dimmed" mt="xs">
                                  Ditemukan {filteredArticles.length} artikel
                                </Text>
                              )}
                            </Box>

                            {/* Area daftar artikel dengan scroll */}
                            <ScrollArea
                              style={{
                                flex: 1,
                                minHeight: "400px",
                                overflow: "auto",
                              }}
                            >
                              {filteredArticles.length === 0 ? (
                                <Box ta="center" py="xl">
                                  <Text size="sm" c="dimmed">
                                    {searchQuery
                                      ? "Tidak ditemukan artikel yang sesuai dengan pencarian Anda"
                                      : "Tidak ada sumber yang ditemukan"}
                                  </Text>
                                  {searchQuery && (
                                    <Button
                                      variant="subtle"
                                      size="xs"
                                      mt="sm"
                                      onClick={() => setSearchQuery("")}
                                    >
                                      Hapus pencarian
                                    </Button>
                                  )}
                                </Box>
                              ) : (
                                <Stack gap="md">
                                  {filteredArticles.map((item, i) => (
                                    <Box
                                      key={item.id}
                                      p="md"
                                      style={{
                                        backgroundColor:
                                          computedColorScheme === "dark"
                                            ? "#1a1a1a"
                                            : "#ffffff",
                                        borderRadius: "8px",
                                        border: `1px solid ${
                                          computedColorScheme === "dark"
                                            ? "#333"
                                            : "#e9ecef"
                                        }`,
                                        cursor: "pointer",
                                        transition: "all 0.2s ease",
                                        "&:hover": {
                                          backgroundColor:
                                            computedColorScheme === "dark"
                                              ? "#2a2a2a"
                                              : "#f8f9fa",
                                          borderColor:
                                            computedColorScheme === "dark"
                                              ? "#444"
                                              : "#dee2e6",
                                        },
                                      }}
                                      onClick={() => {
                                        // Handle artikel diklik
                                        console.log("Clicked article:", item);
                                      }}
                                    >
                                      {/* Icon artikel dan konten */}
                                      <Group gap="sm" align="flex-start">
                                        {/* Icon dokumen */}
                                        <Box
                                          style={{
                                            width: "20px",
                                            height: "20px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            flexShrink: 0,
                                            marginTop: "2px",
                                          }}
                                        >
                                          <IconFileText
                                            size={16}
                                            color={
                                              computedColorScheme === "dark"
                                                ? "#888"
                                                : "#6c757d"
                                            }
                                          />
                                        </Box>

                                        {/* Konten artikel */}
                                        <Box style={{ flex: 1, minWidth: 0 }}>
                                          {/* Judul artikel */}
                                          <Title
                                            order={6}
                                            style={{
                                              margin: 0,
                                              lineHeight: 1.4,
                                              fontWeight: 600,
                                              fontSize: "14px",
                                              color:
                                                computedColorScheme === "dark"
                                                  ? "#fff"
                                                  : "#212529",
                                            }}
                                          >
                                            {item.title}
                                          </Title>

                                          {/* Deskripsi/background artikel */}
                                          {item.att_background && (
                                            <Text
                                              size="xs"
                                              c="dimmed"
                                              mt={4}
                                              style={{
                                                lineHeight: 1.4,
                                                fontSize: "12px",
                                                overflow: "hidden",
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                              }}
                                            >
                                              {item.att_background}
                                            </Text>
                                          )}

                                          {/* Metadata artikel */}
                                          <Text
                                            size="xs"
                                            c="dimmed"
                                            mt={2}
                                            style={{
                                              lineHeight: 1.3,
                                              fontSize: "12px",
                                            }}
                                          >
                                            ID: {item.id}
                                          </Text>
                                        </Box>

                                        {/* Icon star/favorite */}
                                        <ActionIcon
                                          variant="subtle"
                                          size="sm"
                                          color="yellow"
                                          style={{ flexShrink: 0 }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            console.log("Star article:", item);
                                          }}
                                        >
                                          <IconStar size={16} />
                                        </ActionIcon>
                                      </Group>

                                      {/* Tombol aksi artikel */}
                                      <Group gap="md" mt="sm">
                                        {/* Tombol cite - tambah ke bibliography */}
                                        <Button
                                          variant="subtle"
                                          color="blue"
                                          size="compact-sm"
                                          leftSection={<IconPlus size={14} />}
                                          style={{ padding: 0, height: "auto" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addArticleToBibliography(item);
                                          }}
                                        >
                                          Cite
                                        </Button>

                                        {/* Tombol view - buka URL artikel */}
                                        <Button
                                          variant="subtle"
                                          color="gray"
                                          size="compact-sm"
                                          leftSection={<IconExternalLink size={14} />}
                                          style={{ padding: 0, height: "auto" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            if (item.att_url) {
                                            // Cek apakah URL adalah PDF
                                              const isPDF = item.att_url.toLowerCase().includes('.pdf') || item.att_url.includes('pdf');
                                    
                                            if (isPDF) {
                                              // Jika PDF, buka di modal
                                              handlePdfOpen(item.att_url);
                                            } else {
                                              // Jika bukan PDF, buka di tab baru
                                              window.open(item.att_url, "_blank");
                                    }
                                  }
                                }}
                                        >
                                          View
                                        </Button>

                                        {/* Tombol AI chat - analisis dengan AI
                                        <Button
                                          variant="subtle"
                                          color="gray"
                                          size="compact-sm"
                                          leftSection={<IconMessageCircle size={14} />}
                                          style={{ padding: 0, height: "auto" }}
                                          onClick={async (e) => {
                                            e.stopPropagation();
                                            const prompt = `Analyze this article: ${item.title} - ${item.att_background}`;
                                            alert(
                                              `AI Analysis feature will be available soon.`
                                            );
                                          }}
                                        >
                                          AI Chat
                                        </Button> */}
                                      </Group>
                                    </Box>
                                  ))}
                                </Stack>
                              )}
                            </ScrollArea>
                          </>
                        )}
                        {activeTab === "bibliography" && (
                          <>
                            {/* Header dengan info jumlah bibliography */}
                            <Group align="center" justify="space-between" mb="md">
                              <Group align="center" gap="sm">
                                <Box
                                  style={{
                                    backgroundColor: "#007BFF",
                                    padding: "8px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <IconList size={18} color="#fff" />
                                </Box>
                                <Box>
                                  <Title
                                    order={4}
                                    style={{
                                      margin: 0,
                                      color: "#007BFF",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Daftar Pustaka ({bibliographyList.length})
                                  </Title>
                                  <Text size="xs" c="dimmed" mt={-4}>
                                    Kelola sitasi Anda
                                  </Text>
                                </Box>
                              </Group>
                            </Group>

                            {/* Area daftar bibliography dengan scroll */}
                            <ScrollArea
                              style={{
                                flex: 1,
                                border: "1px solid #ccc",
                                borderRadius: "8px",
                                padding: "8px",
                                backgroundColor:
                                  computedColorScheme === "dark" ? "#1e1e1e" : "#fff",
                                minHeight: "200px",
                                maxHeight: "350px",
                                overflow: "auto",
                              }}
                            >
                              {bibliographyList.length === 0 ? (
                                <Text size="xs" c="dimmed" ta="center" mt="xl">
                                  Belum ada daftar pustaka. Gunakan tombol "Cite" pada
                                  artikel referensi untuk menambah.
                                </Text>
                              ) : (
                                <Stack gap="xs">
                                  {bibliographyList
                                    .sort((a, b) => a.number - b.number)
                                    .map((bibliography) => (
                                      <Paper
                                        key={bibliography.id}
                                        p="sm"
                                        withBorder
                                        style={{
                                          backgroundColor:
                                            computedColorScheme === "dark"
                                              ? "#2a2a2a"
                                              : "#fff",
                                          cursor: "pointer",
                                          borderLeft: "4px solid #007BFF",
                                          transition: "all 0.2s ease",
                                        }}
                                        onClick={() => insertCitation(bibliography)}
                                      >
                                        <Group
                                          justify="space-between"
                                          align="flex-start"
                                        >
                                          <Box style={{ flex: 1 }}>
                                            {/* Badge nomor dan tipe */}
                                            <Group gap="xs" mb="xs">
                                              <Badge
                                                size="sm"
                                                color="blue"
                                                variant="filled"
                                                style={{ borderRadius: "4px" }}
                                              >
                                                [{bibliography.number}]
                                              </Badge>
                                              <Badge
                                                size="xs"
                                                color="gray"
                                                variant="light"
                                              >
                                                {bibliography.journal
                                                  ? "Jurnal"
                                                  : bibliography.publisher
                                                  ? "Buku"
                                                  : "Lainnya"}
                                              </Badge>
                                            </Group>

                                            {/* Informasi penulis */}
                                            <Text
                                              size="sm"
                                              fw={600}
                                              lineClamp={1}
                                              mb="xs"
                                            >
                                              {bibliography.author}
                                            </Text>

                                            {/* Judul dan tahun */}
                                            <Text
                                              size="xs"
                                              c="dimmed"
                                              lineClamp={2}
                                              mb="xs"
                                            >
                                              {bibliography.title} ({bibliography.year})
                                            </Text>

                                            {/* Publisher atau journal */}
                                            {(bibliography.publisher ||
                                              bibliography.journal) && (
                                              <Text size="xs" c="dimmed" lineClamp={1}>
                                                {bibliography.journal ||
                                                  bibliography.publisher}
                                              </Text>
                                            )}
                                          </Box>

                                          {/* Menu aksi untuk setiap bibliography */}
                                          <Menu shadow="md" width={120}>
                                            <Menu.Target>
                                              <ActionIcon
                                                variant="subtle"
                                                color="gray"
                                                size="sm"
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <IconDotsVertical size={14} />
                                              </ActionIcon>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                              {/* Insert nomor sitasi */}
                                              <Menu.Item
                                                leftSection={<IconNumber size={14} />}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  insertCitation(bibliography);
                                                }}
                                              >
                                                Insert [{bibliography.number}]
                                              </Menu.Item>
                                              <Menu.Divider />
                                              {/* Hapus bibliography */}
                                              <Menu.Item
                                                color="red"
                                                leftSection={<IconTrash size={14} />}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteBibliography(
                                                    bibliography
                                                  );
                                                }}
                                              >
                                                Delete
                                              </Menu.Item>
                                            </Menu.Dropdown>
                                          </Menu>
                                        </Group>
                                      </Paper>
                                    ))}
                                </Stack>
                              )}
                            </ScrollArea>

                            {/* Preview daftar pustaka terformat */}
                            {bibliographyList.length > 0 && (
                              <>
                                <Divider my="md" />
                                <Group justify="space-between" align="center" mb="sm">
                                  <Text size="sm" fw={600} c="#007BFF">
                                    Preview Daftar Pustaka
                                  </Text>
                                  {/* Tombol copy ke clipboard */}
                                  <Tooltip label="Copy bibliography">
                                    <ActionIcon
                                      variant="subtle"
                                      size="sm"
                                      onClick={() => {
                                        navigator.clipboard.writeText(
                                          generateFullBibliography()
                                        );
                                        alert("Daftar pustaka disalin ke clipboard!");
                                      }}
                                    >
                                      <IconFileText size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                </Group>

                                {/* Area preview bibliography terformat */}
                                <ScrollArea
                                  style={{
                                    maxHeight: "120px",
                                    border: "1px solid #ddd",
                                    borderRadius: "6px",
                                    padding: "8px",
                                    backgroundColor:
                                      computedColorScheme === "dark"
                                        ? "#1e1e1e"
                                        : "#f8f9fa",
                                  }}
                                >
                                  <Text
                                    size="xs"
                                    style={{
                                      fontFamily: "monospace",
                                      lineHeight: 1.4,
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {generateFullBibliography()}
                                  </Text>
                                </ScrollArea>
                              </>
                            )}

                            <Text size="xs" c="dimmed" ta="center" mt="sm">
                              Klik item untuk insert [nomor] ke teks
                            </Text>
                          </>
                        )}
                        {activeTab === "history" && (
                          <>
                            {/* Header dengan info jumlah riwayat */}
                            <Group align="center" justify="space-between" mb="md">
                              <Group align="center" gap="sm">
                                <Box
                                  style={{
                                    backgroundColor: "#007BFF",
                                    padding: "8px",
                                    borderRadius: "12px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  <IconHistory size={18} color="#fff" />
                                </Box>
                                <Box>
                                  <Title
                                    order={4}
                                    style={{
                                      margin: 0,
                                      color: "#007BFF",
                                      fontWeight: 700,
                                    }}
                                  >
                                    Riwayat ({history.length})
                                  </Title>
                                  <Text size="xs" c="dimmed" mt={-4}>
                                    Lihat riwayat penyimpanan
                                  </Text>
                                </Box>
                              </Group>
                            </Group>

                            {/* Area daftar riwayat dengan scroll */}
                            <ScrollArea style={{ flex: 1, minHeight: "400px" }}>
                              {history.length === 0 ? (
                                <Text size="xs" c="dimmed" ta="center" py="sm">
                                  Belum ada riwayat. Klik "Simpan Final" untuk membuat
                                  catatan.
                                </Text>
                              ) : (
                                <Stack gap="xs">
                                  {history.map((item) => (
                                    <Paper
                                      key={item.id}
                                      p="xs"
                                      withBorder
                                      style={{
                                        backgroundColor:
                                          computedColorScheme === "dark"
                                            ? "#1e1e1e"
                                            : "#fff",
                                      }}
                                    >
                                      <Group justify="space-between" align="flex-start">
                                      <Box style={{ flex: 1 }}>
                                        <Group gap="xs" mb="xs" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                          <Text
                                            size="xs"
                                            fw={500}
                                            style={{
                                              overflow: "hidden",
                                              textOverflow: "ellipsis",
                                              whiteSpace: "nowrap",
                                              maxWidth: "calc(100% - 50px)", // sisakan ruang untuk badge
                                              display: "block",
                                            }}
                                            title={item.title}
                                          >
                                            {item.title}
                                          </Text>
                                          <Badge
                                            size="xs"
                                            color={
                                              item.type === "final" ? "green" : "blue"
                                            }
                                            variant="filled"
                                          >
                                            {item.version}
                                          </Badge>
                                        </Group>

                                        <Text size="xs" c="dimmed" mb="xs">
                                          {item.timestamp.toLocaleDateString()} -{" "}
                                          {item.wordCount} kata
                                        </Text>

                                        {item.assignmentCode && (
                                          <Text size="xs" c="blue">
                                            Kode: {item.assignmentCode}
                                          </Text>
                                        )}
                                      </Box>

                                      {/* Hanya tampilkan badge AI percentage untuk final */}
                                      {item.type === "final" &&
                                        item.aiPercentage !== undefined && (
                                          <Badge
                                            size="sm"
                                            color={
                                              item.aiPercentage <= 10
                                                ? "green"
                                                : item.aiPercentage <= 30
                                                ? "yellow"
                                                : "red"
                                            }
                                            variant="filled"
                                          >
                                            {item.aiPercentage}%
                                          </Badge>
                                        )}
                                    </Group>
                                    </Paper>
                                  ))}
                                </Stack>
                              )}
                            </ScrollArea>
                          </>
                        )}
                      </ScrollArea>
                    </Box>
                  </Box>
                </Stack>
              </ScrollArea>
            ) : (
              <Split 
                className="split"
                sizes={[70, 30]}
                minSize={[300, 260]}
                maxSize={[Infinity, 400]}
                expandToMin={false}
                gutterSize={10}
                gutterAlign="center"
                snapOffset={30}
                dragInterval={1}
                direction="horizontal"
                cursor="col-resize"
                style={{ display: 'flex', width: '100%',  flexGrow: 1, overflow: 'hidden', minWidth: 0,}}
              >
                {/* Panel Tengah */}
                <Box
                  style={{
                    width: isMobile ? '100%' : 280,
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    backgroundColor: computedColorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9',
                    padding: 10,
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'auto',
                    maxHeight: 'calc(100vh - 140px)',
                    height: '100%',
                    minHeight: isMobile ? 200 : 'auto',
                    minWidth: 0,
                    boxSizing: "border-box",
                  }}
                >
                  
                  <Box style={{ flex: 1, overflow: "hidden", position: "relative" }}>
                    {/* BlockNote Editor Component dengan AI Indonesia */}
                      <BlockNoteEditorComponent
                        ref={editorRef}
                        onContentChange={handleContentChange}
                        style={{
                          flex: 1,
                          overflow: 'hidden',
                          display: 'flex',
                          flexDirection: 'column',
                        }}
                        mcpContext={mcpContext}
                        writerSession={writerSession}
                        projectId={projectId}
                        isFromBrainstorming={isFromBrainstorming}
                        nodesData={article}
                      />
                      {isScanning && (
                        /* Scanning Overlay */
                        <Box
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 123, 255, 0.05)",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                            zIndex: 1000,
                            backdropFilter: "blur(2px)",
                          }}
                        >
                          <Stack align="center" gap="xl">
                            <Box
                              style={{
                                background: "linear-gradient(135deg, #007BFF, #0056b3)",
                                borderRadius: "50%",
                                padding: "30px",
                                boxShadow: "0 8px 32px rgba(0, 123, 255, 0.3)",
                                animation: "pulse 2s infinite",
                              }}
                            >
                              <IconScan size={48} color="white" />
                            </Box>

                            <Stack align="center" gap="md">
                              <Title order={3} c="blue" ta="center">
                                Deteksi AI Sedang Berjalan
                              </Title>

                              <Text size="lg" c="dimmed" ta="center">
                                {scanningText}
                              </Text>

                              <Progress
                                value={scanningProgress}
                                size="lg"
                                radius="xl"
                                style={{ width: "300px" }}
                                color="blue"
                                striped
                                animated
                              />

                              <Text size="sm" c="dimmed" ta="center">
                                {scanningProgress}% Complete
                              </Text>
                            </Stack>

                            <Group gap="xs" align="center">
                              <IconRobot size={16} color="#007BFF" />
                              <Text size="xs" c="dimmed">
                                Didukung oleh Deteksi AI GPTZero
                              </Text>
                            </Group>
                          </Stack>
                        </Box>
                      )}
                  </Box>

                  {/* Action Buttons */}
                  <Group justify="flex-end" mt="sm" gap="md">
                    <Button 
                      variant="outline" 
                      color="blue" 
                      leftSection={
                        isScanning ? (
                          <Loader size={18} color="white" />
                        ) : (
                          <IconUpload size={18} />
                        )
                      } 
                      radius="md" 
                      size="md" 
                      px={24} 
                      onClick={handleSaveDraft}
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                      disabled={isScanning}
                    >
                      Simpan Draf
                    </Button>

                    <Button 
                      variant="filled" 
                      color="blue" 
                      leftSection={
                        isScanning ? (
                          <Loader size={18} color="white" />
                        ) : (
                          <IconUpload size={18} />
                        )
                      } 
                      radius="md" 
                      size="md" 
                      px={24} 
                      onClick={handleFinalSave}
                      style={{
                        transition: 'all 0.2s ease',
                      }}
                      disabled={isScanning}
                    >
                      {isScanning ? "AI Checker..." : "Simpan Final"}
                    </Button>
                  </Group>
                </Box>
                {/* Panel Kanan */}
                <Box
                  style={{
                    width: isMobile ? "100%" : "280",
                    border: "1px solid #ccc",
                    borderRadius: "8px",
                    backgroundColor: computedColorScheme === "dark" ? "#2a2a2a" : "#f9f9f9",
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-start",
                    maxHeight: "calc(100vh - 140px)", // samakan tinggi dengan panel tengah
                    height: "100%",              // 🟢 FIX INI
                    minHeight: isMobile ? 200 : 'auto',
                    overflow: "auto",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                    boxSizing: "border-box",
                    flexShrink: 0,
                  }}
                >
                  <Box
                    style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '16px',
                      marginBottom: '20px',
                      padding: '10px 16px',
                      borderRadius: '16px',
                      // border: '2px solid #007BFF',
                      backgroundColor: computedColorScheme === "dark" ? "rgba(0, 123, 255, 0.08)" : "rgba(0, 123, 255, 0.15)",
                      // width: '10 px',
                      marginInline: '40px',
                      boxShadow: '0 4px 12px rgba(0, 123, 255, 0.15)',
                      backdropFilter: 'blur(12px)',
                      WebkitBackdropFilter: 'blur(12px)',
                    }}
                  >
                    {[
                      // { icon: <IconHighlight size={20} />, value: "knowledge" },
                      { icon: <IconGraph size={24} />, value: "chat", label: "Referensi Pustaka" },
                      { icon: <IconList size={24} />, value: "bibliography", label: "Daftar Pustaka" },
                      { icon: <IconHistory size={24} />, value: "history", label: "Riwayat" },
                      { icon: <IconHighlight size={24} />, value: "annotation", label: "Catatan" }, // baru
                    ].map((item) => (
                      <Tooltip
                        key={item.value}
                        label={item.label}
                        withArrow
                        position="bottom"
                        color="#007BFF"
                        transitionProps={{ transition: 'pop', duration: 200 }}
                        arrowOffset={8}
                        offset={6}
                      >
                        <ActionIcon
                          // key={item.value}
                          onClick={() => setActiveTab(item.value)}
                          radius="xl"
                          size="lg"
                          variant={activeTab === item.value ? "filled" : "light"}
                          color="#007BFF"
                          style={{
                            // border: activeTab === item.value ? "2px solid transparent" : "2px solid #007BFF",
                            // backgroundColor: activeTab === item.value ? "#007BFF" : "transparent",
                            // color: activeTab === item.value ? "#fff" : "#007BFF",
                            transition: 'all 0.3s ease',
                            boxShadow: activeTab === item.value ? '0 0 8px rgba(0, 123, 255, 0.4)' : 'none',
                            transform: activeTab === item.value ? 'scale(1.1)' : 'scale(1)',
                          }}
                        >
                          {item.icon}
                        </ActionIcon>
                      </Tooltip>
                    ))}
                  </Box>

                  <div
                    style={{
                      width: "100%",
                      height: "1px",
                      backgroundColor: "#ccc",
                      marginBottom: "12px",
                    }}
                  />
                  <ScrollArea style={{ flex: 1 }}>
                    {activeTab === "annotation" && (
                      <Box style={{ flex: 1, overflow: 'auto' }}>
                        <AnnotationPanel sessionId={sessionIdN} />
                      </Box>
                    )}
                    {activeTab === "chat" && (
                      <>
                        {/* Header section dengan informasi */}
                        <Group align="center" justify="space-between" mb="md">
                          <Group align="center" gap="sm">
                            <Box
                              style={{
                                backgroundColor: "#007BFF",
                                padding: "8px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <IconList size={18} color="#fff" />
                            </Box>
                            <Box>
                              <Title
                                order={4}
                                style={{
                                  margin: 0,
                                  color: "#007BFF",
                                  fontWeight: 700,
                                }}
                              >
                                Referensi Pustaka ({article.length})
                              </Title>
                              <Text size="xs" c="dimmed" mt={-4}>
                                Kelola reference manager
                              </Text>
                            </Box>
                          </Group>
                        </Group>

                        <div
                          style={{
                            width: "100%",
                            height: "1px",
                            backgroundColor: "#ccc",
                            marginBottom: "12px",
                          }}
                        />

                        {/* Search box untuk pencarian artikel */}
                        <Box mb="md">
                          <TextInput
                            placeholder="Cari Artikel"
                            variant="filled"
                            leftSection={<IconSearch size={16} />}
                            value={searchQuery}
                            style={{
                              backgroundColor:
                                computedColorScheme === "dark"
                                  ? "#2a2a2a"
                                  : "#f8f9fa",
                            }}
                            onChange={(e) => {
                              setSearchQuery(e.currentTarget.value);
                            }}
                          />
                          {searchQuery && (
                            <Text size="xs" c="dimmed" mt="xs">
                              Ditemukan {filteredArticles.length} artikel
                            </Text>
                          )}
                        </Box>

                        {/* Area daftar artikel dengan scroll */}
                        <ScrollArea
                          style={{
                            flex: 1,
                            minHeight: "400px",
                            overflow: "auto",
                          }}
                        >
                          {filteredArticles.length === 0 ? (
                            <Box ta="center" py="xl">
                              <Text size="sm" c="dimmed">
                                {searchQuery
                                  ? "Tidak ditemukan artikel yang sesuai dengan pencarian Anda"
                                  : "Tidak ada sumber yang ditemukan"}
                              </Text>
                              {searchQuery && (
                                <Button
                                  variant="subtle"
                                  size="xs"
                                  mt="sm"
                                  onClick={() => setSearchQuery("")}
                                >
                                  Hapus pencarian
                                </Button>
                              )}
                            </Box>
                          ) : (
                            <Stack gap="md">
                              {filteredArticles.map((item, i) => (
                                <Box
                                  key={item.id}
                                  p="md"
                                  style={{
                                    backgroundColor:
                                      computedColorScheme === "dark"
                                        ? "#1a1a1a"
                                        : "#ffffff",
                                    borderRadius: "8px",
                                    border: `1px solid ${
                                      computedColorScheme === "dark"
                                        ? "#333"
                                        : "#e9ecef"
                                    }`,
                                    cursor: "pointer",
                                    transition: "all 0.2s ease",
                                    "&:hover": {
                                      backgroundColor:
                                        computedColorScheme === "dark"
                                          ? "#2a2a2a"
                                          : "#f8f9fa",
                                      borderColor:
                                        computedColorScheme === "dark"
                                          ? "#444"
                                          : "#dee2e6",
                                    },
                                  }}
                                  onClick={() => {
                                    // Handle artikel diklik
                                    console.log("Clicked article:", item);
                                  }}
                                >
                                  {/* Icon artikel dan konten */}
                                  <Group gap="sm" align="flex-start">
                                    {/* Icon dokumen */}
                                    <Box
                                      style={{
                                        width: "20px",
                                        height: "20px",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                        marginTop: "2px",
                                      }}
                                    >
                                      <IconFileText
                                        size={16}
                                        color={
                                          computedColorScheme === "dark"
                                            ? "#888"
                                            : "#6c757d"
                                        }
                                      />
                                    </Box>

                                    {/* Konten artikel */}
                                    <Box style={{ flex: 1, minWidth: 0 }}>
                                      {/* Judul artikel */}
                                      <Title
                                        order={6}
                                        style={{
                                          margin: 0,
                                          lineHeight: 1.4,
                                          fontWeight: 600,
                                          fontSize: "14px",
                                          color:
                                            computedColorScheme === "dark"
                                              ? "#fff"
                                              : "#212529",
                                        }}
                                      >
                                        {item.title}
                                      </Title>

                                      {/* Deskripsi/background artikel */}
                                      {item.att_background && (
                                        <Text
                                          size="xs"
                                          c="dimmed"
                                          mt={4}
                                          style={{
                                            lineHeight: 1.4,
                                            fontSize: "12px",
                                            overflow: "hidden",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                          }}
                                        >
                                          {item.att_background}
                                        </Text>
                                      )}

                                      {/* Metadata artikel */}
                                      <Text
                                        size="xs"
                                        c="dimmed"
                                        mt={2}
                                        style={{
                                          lineHeight: 1.3,
                                          fontSize: "12px",
                                        }}
                                      >
                                        ID: {item.id}
                                      </Text>
                                    </Box>

                                    {/* Icon star/favorite */}
                                    <ActionIcon
                                      variant="subtle"
                                      size="sm"
                                      color="yellow"
                                      style={{ flexShrink: 0 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        console.log("Star article:", item);
                                      }}
                                    >
                                      <IconStar size={16} />
                                    </ActionIcon>
                                  </Group>

                                  {/* Tombol aksi artikel */}
                                  <Group gap="md" mt="sm">
                                    {/* Tombol cite - tambah ke bibliography */}
                                    <Button
                                      variant="subtle"
                                      color="blue"
                                      size="compact-sm"
                                      leftSection={<IconPlus size={14} />}
                                      style={{ padding: 0, height: "auto" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        addArticleToBibliography(item);
                                      }}
                                    >
                                      Cite
                                    </Button>

                                    {/* Tombol view - buka URL artikel */}
                                    <Button
                                      variant="subtle"
                                      color="gray"
                                      size="compact-sm"
                                      leftSection={<IconExternalLink size={14} />}
                                      style={{ padding: 0, height: "auto" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (item.att_url) {
                                        // Cek apakah URL adalah PDF
                                          const isPDF = item.att_url.toLowerCase().includes('.pdf') || item.att_url.includes('pdf');
                                
                                        if (isPDF) {
                                          // Jika PDF, buka di modal
                                          handlePdfOpen(item.att_url);
                                        } else {
                                          // Jika bukan PDF, buka di tab baru
                                          window.open(item.att_url, "_blank");
                                }
                              }
                            }}
                                    >
                                      View
                                    </Button>

                                    {/* Tombol AI chat - analisis dengan AI
                                    <Button
                                      variant="subtle"
                                      color="gray"
                                      size="compact-sm"
                                      leftSection={<IconMessageCircle size={14} />}
                                      style={{ padding: 0, height: "auto" }}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        const prompt = `Analyze this article: ${item.title} - ${item.att_background}`;
                                        alert(
                                          `AI Analysis feature will be available soon.`
                                        );
                                      }}
                                    >
                                      AI Chat
                                    </Button> */}
                                  </Group>
                                </Box>
                              ))}
                            </Stack>
                          )}
                        </ScrollArea>
                      </>
                    )}
                    {activeTab === "bibliography" && (
                      <>
                        {/* Header dengan info jumlah bibliography */}
                        <Group align="center" justify="space-between" mb="md">
                          <Group align="center" gap="sm">
                            <Box
                              style={{
                                backgroundColor: "#007BFF",
                                padding: "8px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <IconList size={18} color="#fff" />
                            </Box>
                            <Box>
                              <Title
                                order={4}
                                style={{
                                  margin: 0,
                                  color: "#007BFF",
                                  fontWeight: 700,
                                }}
                              >
                                Daftar Pustaka ({bibliographyList.length})
                              </Title>
                              <Text size="xs" c="dimmed" mt={-4}>
                                Kelola sitasi Anda
                              </Text>
                            </Box>
                          </Group>
                        </Group>

                        {/* Area daftar bibliography dengan scroll */}
                        <ScrollArea
                          style={{
                            flex: 1,
                            border: "1px solid #ccc",
                            borderRadius: "8px",
                            padding: "8px",
                            backgroundColor:
                              computedColorScheme === "dark" ? "#1e1e1e" : "#fff",
                            minHeight: "200px",
                            maxHeight: "350px",
                            overflow: "auto",
                          }}
                        >
                          {bibliographyList.length === 0 ? (
                            <Text size="xs" c="dimmed" ta="center" mt="xl">
                              Belum ada daftar pustaka. Gunakan tombol "Cite" pada
                              artikel referensi untuk menambah.
                            </Text>
                          ) : (
                            <Stack gap="xs">
                              {bibliographyList
                                .sort((a, b) => a.number - b.number)
                                .map((bibliography) => (
                                  <Paper
                                    key={bibliography.id}
                                    p="sm"
                                    withBorder
                                    style={{
                                      backgroundColor:
                                        computedColorScheme === "dark"
                                          ? "#2a2a2a"
                                          : "#fff",
                                      cursor: "pointer",
                                      borderLeft: "4px solid #007BFF",
                                      transition: "all 0.2s ease",
                                    }}
                                    onClick={() => insertCitation(bibliography)}
                                  >
                                    <Group
                                      justify="space-between"
                                      align="flex-start"
                                    >
                                      <Box style={{ flex: 1 }}>
                                        {/* Badge nomor dan tipe */}
                                        <Group gap="xs" mb="xs">
                                          <Badge
                                            size="sm"
                                            color="blue"
                                            variant="filled"
                                            style={{ borderRadius: "4px" }}
                                          >
                                            [{bibliography.number}]
                                          </Badge>
                                          <Badge
                                            size="xs"
                                            color="gray"
                                            variant="light"
                                          >
                                            {bibliography.journal
                                              ? "Jurnal"
                                              : bibliography.publisher
                                              ? "Buku"
                                              : "Lainnya"}
                                          </Badge>
                                        </Group>

                                        {/* Informasi penulis */}
                                        <Text
                                          size="sm"
                                          fw={600}
                                          lineClamp={1}
                                          mb="xs"
                                        >
                                          {bibliography.author}
                                        </Text>

                                        {/* Judul dan tahun */}
                                        <Text
                                          size="xs"
                                          c="dimmed"
                                          lineClamp={2}
                                          mb="xs"
                                        >
                                          {bibliography.title} ({bibliography.year})
                                        </Text>

                                        {/* Publisher atau journal */}
                                        {(bibliography.publisher ||
                                          bibliography.journal) && (
                                          <Text size="xs" c="dimmed" lineClamp={1}>
                                            {bibliography.journal ||
                                              bibliography.publisher}
                                          </Text>
                                        )}
                                      </Box>

                                      {/* Menu aksi untuk setiap bibliography */}
                                      <Menu shadow="md" width={120}>
                                        <Menu.Target>
                                          <ActionIcon
                                            variant="subtle"
                                            color="gray"
                                            size="sm"
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <IconDotsVertical size={14} />
                                          </ActionIcon>
                                        </Menu.Target>
                                        <Menu.Dropdown>
                                          {/* Insert nomor sitasi */}
                                          <Menu.Item
                                            leftSection={<IconNumber size={14} />}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              insertCitation(bibliography);
                                            }}
                                          >
                                            Insert [{bibliography.number}]
                                          </Menu.Item>
                                          <Menu.Divider />
                                          {/* Hapus bibliography */}
                                          <Menu.Item
                                            color="red"
                                            leftSection={<IconTrash size={14} />}
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteBibliography(
                                                bibliography
                                              );
                                            }}
                                          >
                                            Delete
                                          </Menu.Item>
                                        </Menu.Dropdown>
                                      </Menu>
                                    </Group>
                                  </Paper>
                                ))}
                            </Stack>
                          )}
                        </ScrollArea>

                        {/* Preview daftar pustaka terformat */}
                        {bibliographyList.length > 0 && (
                          <>
                            <Divider my="md" />
                            <Group justify="space-between" align="center" mb="sm">
                              <Text size="sm" fw={600} c="#007BFF">
                                Preview Daftar Pustaka
                              </Text>
                              {/* Tombol copy ke clipboard */}
                              <Tooltip label="Copy bibliography">
                                <ActionIcon
                                  variant="subtle"
                                  size="sm"
                                  onClick={() => {
                                    navigator.clipboard.writeText(
                                      generateFullBibliography()
                                    );
                                    alert("Daftar pustaka disalin ke clipboard!");
                                  }}
                                >
                                  <IconFileText size={16} />
                                </ActionIcon>
                              </Tooltip>
                            </Group>

                            {/* Area preview bibliography terformat */}
                            <ScrollArea
                              style={{
                                maxHeight: "120px",
                                border: "1px solid #ddd",
                                borderRadius: "6px",
                                padding: "8px",
                                backgroundColor:
                                  computedColorScheme === "dark"
                                    ? "#1e1e1e"
                                    : "#f8f9fa",
                              }}
                            >
                              <Text
                                size="xs"
                                style={{
                                  fontFamily: "monospace",
                                  lineHeight: 1.4,
                                  whiteSpace: "pre-wrap",
                                }}
                              >
                                {generateFullBibliography()}
                              </Text>
                            </ScrollArea>
                          </>
                        )}

                        <Text size="xs" c="dimmed" ta="center" mt="sm">
                          Klik item untuk insert [nomor] ke teks
                        </Text>
                      </>
                    )}
                    {activeTab === "history" && (
                      <>
                        {/* Header dengan info jumlah riwayat */}
                        <Group align="center" justify="space-between" mb="md">
                          <Group align="center" gap="sm">
                            <Box
                              style={{
                                backgroundColor: "#007BFF",
                                padding: "8px",
                                borderRadius: "12px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <IconHistory size={18} color="#fff" />
                            </Box>
                            <Box>
                              <Title
                                order={4}
                                style={{
                                  margin: 0,
                                  color: "#007BFF",
                                  fontWeight: 700,
                                }}
                              >
                                Riwayat ({history.length})
                              </Title>
                              <Text size="xs" c="dimmed" mt={-4}>
                                Lihat riwayat penyimpanan
                              </Text>
                            </Box>
                          </Group>
                        </Group>

                        {/* Area daftar riwayat dengan scroll */}
                        <ScrollArea style={{ flex: 1, minHeight: "400px" }}>
                          {history.length === 0 ? (
                            <Text size="xs" c="dimmed" ta="center" py="sm">
                              Belum ada riwayat. Klik "Simpan Final" untuk membuat
                              catatan.
                            </Text>
                          ) : (
                            <Stack gap="xs">
                              {history.map((item) => (
                                <Paper
                                  key={item.id}
                                  p="xs"
                                  withBorder
                                  style={{
                                    backgroundColor:
                                      computedColorScheme === "dark"
                                        ? "#1e1e1e"
                                        : "#fff",
                                  }}
                                >
                                  <Group justify="space-between" align="flex-start">
                                  <Box style={{ flex: 1 }}>
                                    <Group gap="xs" mb="xs" style={{ maxWidth: '100%', overflow: 'hidden' }}>
                                      <Text
                                        size="xs"
                                        fw={500}
                                        style={{
                                          overflow: "hidden",
                                          textOverflow: "ellipsis",
                                          whiteSpace: "nowrap",
                                          maxWidth: "calc(100% - 50px)", // sisakan ruang untuk badge
                                          display: "block",
                                        }}
                                        title={item.title}
                                      >
                                        {item.title}
                                      </Text>
                                      <Badge
                                        size="xs"
                                        color={
                                          item.type === "final" ? "green" : "blue"
                                        }
                                        variant="filled"
                                      >
                                        {item.version}
                                      </Badge>
                                    </Group>

                                    <Text size="xs" c="dimmed" mb="xs">
                                      {item.timestamp.toLocaleDateString()} -{" "}
                                      {item.wordCount} kata
                                    </Text>

                                    {item.assignmentCode && (
                                      <Text size="xs" c="blue">
                                        Kode: {item.assignmentCode}
                                      </Text>
                                    )}
                                  </Box>

                                  {/* Hanya tampilkan badge AI percentage untuk final */}
                                  {item.type === "final" &&
                                    item.aiPercentage !== undefined && (
                                      <Badge
                                        size="sm"
                                        color={
                                          item.aiPercentage <= 10
                                            ? "green"
                                            : item.aiPercentage <= 30
                                            ? "yellow"
                                            : "red"
                                        }
                                        variant="filled"
                                      >
                                        {item.aiPercentage}%
                                      </Badge>
                                    )}
                                </Group>
                                </Paper>
                              ))}
                            </Stack>
                          )}
                        </ScrollArea>
                      </>
                    )}
                  </ScrollArea>
                </Box>
              </Split>
            )}

            {/* <Split
              className="split"
              sizes={[70, 30]}
              minSize={[300, 260]}
              maxSize={[Infinity, 400]}
              expandToMin={false}
              gutterSize={10}
              gutterAlign="center"
              snapOffset={30}
              dragInterval={1}
              direction="horizontal"
              cursor="col-resize"
              style={{ display: 'flex', width: '100%',  flexGrow: 1, overflow: 'hidden', minWidth: 0,}}
            >
               

              
            </Split> */}
          </Flex>
        </div>

        {/* ============================
            MODAL - AI RESULT
            ============================ */}
        <Modal
          opened={aiResultModalOpened}
          onClose={closeAIResultModal}
          title={null}
          size="xl"
          centered
          withCloseButton={false}
          overlayProps={{ opacity: 0.5, blur: 3 }}
          styles={{
            content: {
              background: `linear-gradient(135deg, ${
                computedColorScheme === "dark"
                  ? "rgba(26, 27, 30, 0.95)"
                  : "rgba(255, 255, 255, 0.95)"
              }, ${
                computedColorScheme === "dark"
                  ? "rgba(42, 42, 42, 0.9)"
                  : "rgba(248, 249, 250, 0.9)"
              })`,
              border: aiCheckResult?.isHuman
                ? "2px solid #40c057"
                : "2px solid #fa5252",
              borderRadius: "16px",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
            },
          }}
        >
          {aiCheckResult && (
            <Stack gap="xl" p="md">
              {/* Header */}
              <Center>
                <Stack align="center" gap="md">
                  <Box
                    style={{
                      background: aiCheckResult.isHuman
                        ? "linear-gradient(135deg, #40c057, #51cf66)"
                        : "linear-gradient(135deg, #fa5252, #ff6b6b)",
                      borderRadius: "50%",
                      padding: "20px",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
                    }}
                  >
                    {aiCheckResult.isHuman ? (
                      <IconShieldCheck size={48} color="white" />
                    ) : (
                      <IconAlertTriangle size={48} color="white" />
                    )}
                  </Box>

                  <Stack align="center" gap="xs">
                    <Title
                      order={2}
                      style={{
                        color: aiCheckResult.isHuman ? "#40c057" : "#fa5252",
                        textAlign: "center",
                        fontWeight: 700,
                      }}
                    >
                      {aiCheckResult.isHuman
                        ? "✅ Konten Original"
                        : "⚠️ Perlu Revisi"}
                    </Title>

                    <Text size="lg" c="dimmed" ta="center">
                      Hasil Analisis GPTZero
                    </Text>
                  </Stack>
                </Stack>
              </Center>

              {/* Two Column Layout */}
              <Grid>
                {/* Left Column - Analysis Results */}
                <Grid.Col span={6}>
                  <Stack gap="lg">
                    {/* Ring Progress */}
                    <Center>
                      <RingProgress
                        size={160}
                        thickness={12}
                        sections={[
                          {
                            value: aiCheckResult.percentage,
                            color: aiCheckResult.isHuman
                              ? "#40c057"
                              : "#fa5252",
                          },
                        ]}
                        label={
                          <Center>
                            <Stack align="center" gap={4}>
                              <Text
                                size="xl"
                                fw={700}
                                style={{
                                  color: aiCheckResult.isHuman
                                    ? "#40c057"
                                    : "#fa5252",
                                }}
                              >
                                {aiCheckResult.percentage}%
                              </Text>
                              <Text size="xs" c="dimmed" ta="center">
                                AI Detected
                              </Text>
                            </Stack>
                          </Center>
                        }
                      />
                    </Center>

                    {/* Sentence Analysis Summary */}
                    <Paper
                      p="md"
                      withBorder
                      style={{
                        backgroundColor:
                          computedColorScheme === "dark"
                            ? "#2a2a2a"
                            : "#f8f9fa",
                        borderRadius: "12px",
                      }}
                    >
                      <Stack gap="sm">
                        <Text size="sm" fw={600} mb="xs">
                          📊 Analisis Kalimat
                        </Text>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <Box
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "2px",
                                backgroundColor: "#51cf66",
                              }}
                            />
                            <Text size="sm">Human</Text>
                          </Group>
                          <Text size="sm" fw={500}>
                            {aiCheckResult.analysis.humanSentences} kalimat
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <Box
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "2px",
                                backgroundColor: "#ffd43b",
                              }}
                            />
                            <Text size="sm">Mixed</Text>
                          </Group>
                          <Text size="sm" fw={500}>
                            {aiCheckResult.analysis.mixedSentences} kalimat
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Group gap="xs">
                            <Box
                              style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "2px",
                                backgroundColor: "#ff6b6b",
                              }}
                            />
                            <Text size="sm">AI</Text>
                          </Group>
                          <Text size="sm" fw={500}>
                            {aiCheckResult.analysis.aiSentences} kalimat
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>

                    {/* Detail analisis */}
                    <Paper
                      p="md"
                      withBorder
                      style={{
                        backgroundColor:
                          computedColorScheme === "dark"
                            ? "#2a2a2a"
                            : "#f8f9fa",
                        borderRadius: "12px",
                      }}
                    >
                      <Stack gap="sm">
                        <Text size="sm" fw={600} mb="xs">
                          📝 Detail Analisis
                        </Text>

                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            📝 Panjang Teks:
                          </Text>
                          <Text size="sm">
                            {aiCheckResult.analysis.textLength.toLocaleString()}{" "}
                            karakter
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            📊 Jumlah Kalimat:
                          </Text>
                          <Text size="sm">
                            {aiCheckResult.analysis.sentences}
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            📏 Rata-rata Panjang:
                          </Text>
                          <Text size="sm">
                            {aiCheckResult.analysis.avgSentenceLength} kata
                          </Text>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            🎯 Kompleksitas:
                          </Text>
                          <Badge
                            color={
                              aiCheckResult.analysis.complexity === "High"
                                ? "red"
                                : aiCheckResult.analysis.complexity === "Medium"
                                ? "yellow"
                                : "green"
                            }
                            variant="filled"
                          >
                            {aiCheckResult.analysis.complexity}
                          </Badge>
                        </Group>

                        <Group justify="space-between">
                          <Text size="sm" fw={500}>
                            🔍 Confidence:
                          </Text>
                          <Text size="sm" fw={600} c="blue">
                            {aiCheckResult.confidence}%
                          </Text>
                        </Group>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid.Col>

                {/* Right Column - Text Highlight Preview */}
                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Paper
                      p="md"
                      withBorder
                      style={{
                        backgroundColor:
                          computedColorScheme === "dark"
                            ? "#2a2a2a"
                            : "#f8f9fa",
                        borderRadius: "12px",
                        height: "400px",
                      }}
                    >
                      <Stack gap="sm" style={{ height: "100%" }}>
                        <Group justify="space-between" align="center">
                          <Text size="sm" fw={600}>
                            🎨 Highlighted Text Preview
                          </Text>
                          <Group gap="xs">
                            <Group gap="xs">
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "2px",
                                  backgroundColor: "#51cf66",
                                }}
                              />
                              <Text size="xs">Human</Text>
                            </Group>
                            <Group gap="xs">
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "2px",
                                  backgroundColor: "#ffd43b",
                                }}
                              />
                              <Text size="xs">Mixed</Text>
                            </Group>
                            <Group gap="xs">
                              <Box
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius: "2px",
                                  backgroundColor: "#ff6b6b",
                                }}
                              />
                              <Text size="xs">AI</Text>
                            </Group>
                          </Group>
                        </Group>

                        <ScrollArea
                          style={{
                            flex: 1,
                            border: "1px solid #ddd",
                            borderRadius: "8px",
                            padding: "12px",
                            backgroundColor:
                              computedColorScheme === "dark"
                                ? "#1a1a1a"
                                : "#ffffff",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "13px",
                              lineHeight: 1.6,
                              fontFamily:
                                "system-ui, -apple-system, sans-serif",
                            }}
                            dangerouslySetInnerHTML={{
                              __html: aiCheckResult.highlightedContent,
                            }}
                          />
                        </ScrollArea>

                        <Text size="xs" c="dimmed" ta="center">
                          Kalimat dengan warna menunjukkan tingkat deteksi AI
                        </Text>
                      </Stack>
                    </Paper>
                  </Stack>
                </Grid.Col>
              </Grid>

              {/* Rekomendasi */}
              <Alert
                color={aiCheckResult.isHuman ? "green" : "orange"}
                title="💡 Rekomendasi"
                icon={<IconBulb size={20} />}
                styles={{ root: { borderRadius: "12px" } }}
              >
                <Text size="sm">{aiCheckResult.recommendation}</Text>
              </Alert>

              {/* Conditional content berdasarkan hasil AI */}
              {aiCheckResult.isHuman ? (
              /* Jika AI detection <= 10% - tampilkan input assignment code */
              <Stack gap="md">
                <Alert
                  color="green"
                  title="🎉 Konten Anda Lolos!"
                  icon={<IconCircleCheck size={20} />}
                  styles={{
                    root: {
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, rgba(64, 192, 87, 0.1), rgba(81, 207, 102, 0.1))",
                      border: "1px solid rgba(64, 192, 87, 0.3)",
                    },
                  }}
                >
                  <Text size="sm">
                    Artikel Anda terdeteksi sebagai konten original dan siap
                    untuk dikirim. Mohon masukkan kode assignment untuk
                    melanjutkan proses pengiriman.
                  </Text>
                </Alert>

                {/* Enhanced Assignment Code Input dengan Validasi */}
                <Stack gap="xs">
                  <TextInput
                    label="Kode Assignment"
                    placeholder="Masukkan kode assignment..."
                    value={assignmentCode}
                    onChange={(e) => setAssignmentCode(e.currentTarget.value)}
                    size="md"
                    styles={{
                      input: { 
                        borderRadius: "8px", 
                        fontSize: "16px",
                        borderColor: codeValidation.valid ? '#40c057' : (codeValidation.message && !codeValidation.valid ? '#fa5252' : undefined)
                      },
                      label: { fontWeight: 600, marginBottom: "8px" },
                    }}
                    leftSection={<IconNumber size={18} />}
                    rightSection={isValidatingCode && <Loader size={16} />}
                    required
                  />
      
                  {/* Validation Message */}
                  {codeValidation.message && (
                    <Text 
                      size="sm" 
                      c={codeValidation.valid ? "green" : "red"}
                      style={{ 
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {codeValidation.valid ? '✅' : '❌'} {" "} {codeValidation.message}
                    </Text>
                  )}

                  {/* Assignment Details jika valid */}
                  {codeValidation.valid && codeValidation.assignment && (
                    <Paper
                      p="sm"
                      withBorder
                      style={{
                        backgroundColor: 'rgba(64, 192, 87, 0.05)',
                        borderColor: 'rgba(64, 192, 87, 0.2)',
                        borderRadius: "8px",
                      }}
                    >
                      <Stack gap="xs">
                        <Group justify="space-between">
                          <Text size="sm" fw={600}>📚 {codeValidation.assignment?.title}</Text>
                          <Badge color="green" variant="light" size="sm">
                            Minggu {codeValidation.assignment?.weekNumber}
                          </Badge>
                        </Group>
                        
                        {codeValidation.assignment.dueDate && (
                          <Text size="xs" c="dimmed">
                            📅 Due: {new Date(codeValidation.assignment.dueDate).toLocaleDateString('id-ID', {
                              weekday: 'long',
                              year: 'numeric', 
                              month: 'long',
                              day: 'numeric'
                            })}
                            {codeValidation.assignment.isOverdue && (
                              <Text span c="red" fw={500}> (Terlambat)</Text>
                            )}
                          </Text>
                        )}
                      </Stack>
                    </Paper>
                  )}
                </Stack>

                <Group justify="center" mt="lg" gap="md">
                  <Button
                    variant="outline"
                    color="gray"
                    size="md"
                    radius="md"
                    px={32}
                    leftSection={<IconX size={18} />}
                    onClick={closeAIResultModal}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="filled"
                    color="green"
                    size="md"
                    radius="md"
                    px={32}
                    leftSection={<IconSend size={18} />}
                    onClick={handleSubmitToTeacher}
                    disabled={!codeValidation.valid || isSubmitting}
                    loading={isSubmitting}
                    style={{
                      background: codeValidation.valid 
                        ? "linear-gradient(135deg, #40c057, #51cf66)"
                        : "linear-gradient(135deg, #868e96, #adb5bd)",
                      boxShadow: codeValidation.valid 
                        ? "0 4px 16px rgba(64, 192, 87, 0.3)"
                        : "none",
                    }}
                  >
                    {isSubmitting ? "Mengirim..." : "Kirim Sekarang"}
                  </Button>
                </Group>
              </Stack>
            ) : (
                /* Jika AI detection > 10% - tampilkan pesan revisi */
                <Stack gap="md">
                  <Alert
                    color="red"
                    title="❌ Mohon untuk Direvisi"
                    icon={<IconAlertCircle size={20} />}
                    styles={{
                      root: {
                        borderRadius: "12px",
                        background:
                          "linear-gradient(135deg, rgba(250, 82, 82, 0.1), rgba(255, 107, 107, 0.1))",
                        border: "1px solid rgba(250, 82, 82, 0.3)",
                      },
                    }}
                  >
                    <Text size="sm">
                      Konten Anda terdeteksi menggunakan AI yang berlebihan (
                      {aiCheckResult.percentage}%). Silakan revisi artikel Anda
                      dengan fokus pada bagian yang disorot merah dan kuning
                      sebelum dapat dikirim.
                    </Text>
                  </Alert>

                  <Paper
                    p="md"
                    withBorder
                    style={{
                      backgroundColor:
                        computedColorScheme === "dark" ? "#2a2a2a" : "#fff5f5",
                      borderRadius: "12px",
                      border: "1px solid rgba(250, 82, 82, 0.2)",
                    }}
                  >
                    <Stack gap="xs">
                      <Text size="sm" fw={600} c="red">
                        💡 Tips untuk Mengurangi Deteksi AI:
                      </Text>
                      <Text size="xs" c="dimmed">
                        • Fokus pada bagian yang disorot merah (AI) dan kuning
                        (Mixed)
                      </Text>
                      <Text size="xs" c="dimmed">
                        • Gunakan gaya penulisan yang lebih personal dan natural
                      </Text>
                      <Text size="xs" c="dimmed">
                        • Variasikan panjang kalimat dan struktur paragraf
                      </Text>
                      <Text size="xs" c="dimmed">
                        • Tambahkan pengalaman atau perspektif pribadi
                      </Text>
                      <Text size="xs" c="dimmed">
                        • Gunakan contoh spesifik dan detail yang relevan
                      </Text>
                    </Stack>
                  </Paper>

                  <Center mt="lg">
                    <Button
                      variant="filled"
                      color="blue"
                      size="md"
                      radius="md"
                      px={32}
                      leftSection={<IconEdit size={18} />}
                      onClick={closeAIResultModal}
                      style={{
                        background: "linear-gradient(135deg, #007BFF, #0056b3)",
                        boxShadow: "0 4px 16px rgba(0, 123, 255, 0.3)",
                      }}
                    >
                      Kembali untuk Revisi
                    </Button>
                  </Center>
                </Stack>
              )}

              {/* Footer dengan branding */}
              <Center>
                <Group gap="xs" align="center">
                  <IconRobot size={16} color="#007BFF" />
                  <Text size="xs" c="dimmed">
                    Powered by GPTZero AI Detection
                  </Text>
                </Group>
              </Center>
            </Stack>
          )}
        </Modal>

        {/* ============================
            MODAL - BIBLIOGRAPHY
            ============================ */}
        <Modal
          opened={bibliographyModalOpened}
          onClose={closeBibliographyModal}
          title={
            <Group align="center" gap="sm">
              <IconList size={20} color="#007BFF" />
              <Text fw={600} size="lg">
                {editingBibliography
                  ? "Edit Daftar Pustaka"
                  : "Tambah Daftar Pustaka"}
              </Text>
            </Group>
          }
          size="lg"
          centered
        >
          <Stack gap="md">
            <Text size="sm" c="dimmed">
              Isi informasi untuk menambah ke daftar pustaka. Item akan diberi
              nomor [{editingBibliography?.number || nextNumber}].
            </Text>

            <TextInput
              label="Penulis*"
              placeholder="Nama penulis"
              value={bibliographyForm.author}
              onChange={(e) =>
                setBibliographyForm((prev) => ({
                  ...prev,
                  author: e.currentTarget.value,
                }))
              }
              required
            />

            <TextInput
              label="Judul*"
              placeholder="Judul karya"
              value={bibliographyForm.title}
              onChange={(e) =>
                setBibliographyForm((prev) => ({
                  ...prev,
                  title: e.currentTarget.value,
                }))
              }
              required
            />

            <Group grow>
              <TextInput
                label="Tahun*"
                placeholder="Tahun publikasi"
                value={bibliographyForm.year}
                onChange={(e) =>
                  setBibliographyForm((prev) => ({
                    ...prev,
                    year: e.currentTarget.value,
                  }))
                }
                required
              />
              <TextInput
                label="Penerbit"
                placeholder="Nama penerbit"
                value={bibliographyForm.publisher}
                onChange={(e) =>
                  setBibliographyForm((prev) => ({
                    ...prev,
                    publisher: e.currentTarget.value,
                  }))
                }
              />
            </Group>

            <TextInput
              label="Jurnal"
              placeholder="Nama jurnal (jika artikel jurnal)"
              value={bibliographyForm.journal}
              onChange={(e) =>
                setBibliographyForm((prev) => ({
                  ...prev,
                  journal: e.currentTarget.value,
                }))
              }
            />

            <Group grow>
              <TextInput
                label="Volume"
                placeholder="Volume"
                value={bibliographyForm.volume}
                onChange={(e) =>
                  setBibliographyForm((prev) => ({
                    ...prev,
                    volume: e.currentTarget.value,
                  }))
                }
              />
              <TextInput
                label="Halaman"
                placeholder="Rentang halaman"
                value={bibliographyForm.pages}
                onChange={(e) =>
                  setBibliographyForm((prev) => ({
                    ...prev,
                    pages: e.currentTarget.value,
                  }))
                }
              />
            </Group>

            <TextInput
              label="URL"
              placeholder="Alamat website (jika sumber online)"
              value={bibliographyForm.url}
              onChange={(e) =>
                setBibliographyForm((prev) => ({
                  ...prev,
                  url: e.currentTarget.value,
                }))
              }
            />

            <TextInput
              label="DOI"
              placeholder="Digital Object Identifier"
              value={bibliographyForm.doi}
              onChange={(e) =>
                setBibliographyForm((prev) => ({
                  ...prev,
                  doi: e.currentTarget.value,
                }))
              }
            />

            {/* Preview */}
            {bibliographyForm.author &&
              bibliographyForm.title &&
              bibliographyForm.year && (
                <Paper
                  p="sm"
                  style={{
                    backgroundColor:
                      computedColorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
                  }}
                >
                  <Text size="xs" fw={600} mb="xs">
                    Preview:
                  </Text>
                  <Text size="xs" style={{ fontFamily: "monospace" }}>
                    [{editingBibliography?.number || nextNumber}]{" "}
                    {formatBibliography({
                      id: "",
                      number: editingBibliography?.number || nextNumber,
                      ...bibliographyForm,
                      createdAt: new Date(),
                    } as Bibliography)}
                  </Text>
                </Paper>
              )}

            <Group justify="flex-end" mt="md">
              <Button variant="outline" onClick={closeBibliographyModal}>
                Batal
              </Button>
              <Button
                onClick={saveBibliography}
                disabled={
                  !bibliographyForm.author ||
                  !bibliographyForm.title ||
                  !bibliographyForm.year
                }
              >
                {editingBibliography ? "Update" : "Simpan"}
              </Button>
            </Group>
          </Stack>
        </Modal>

        <Modal
          opened={opened}
          onClose={handlePdfClose}
          title="Lihat Artikel"
          size="90%"
          padding="sm"
          centered
          overlayProps={{ blur: 3 }}
          styles={{
            content: {
              height: '90vh',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              position: 'relative',
            },
            body: {
              flex: 1,
              overflow: 'hidden',
              padding: 0,
              position: 'relative',
            },
          }}
        >
          {selectedPDF && (
            <div style={{ height: '100%', position: 'relative' }}>
              <WebViewer
                fileUrl={selectedPDF} 
                onAnalytics={handleAnalytics} 
              />
            </div>
          )}
        </Modal>

        {/* ============================
            CSS ANIMATIONS
            ============================ */}
        <style jsx global>{`
          @keyframes pulse {
            0% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
            }
            50% {
              transform: scale(1.05);
              box-shadow: 0 12px 40px rgba(0, 123, 255, 0.5);
            }
            100% {
              transform: scale(1);
              box-shadow: 0 8px 32px rgba(0, 123, 255, 0.3);
            }
          }
        `}</style>
      </AppShell.Main>
    </AppShell>
  );
}