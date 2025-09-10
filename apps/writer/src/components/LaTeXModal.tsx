"use client";

import React, { useState, useCallback } from "react";
import {
  Modal,
  Button,
  TextInput,
  Text,
  Group,
  Stack,
  Card,
  Grid,
  Badge,
  ActionIcon,
  Textarea,
  Switch,
  Box,
  Divider,
  ScrollArea,
} from "@mantine/core";
import { IconX, IconFunction, IconCopy } from "@tabler/icons-react";
import { BlockMath, InlineMath } from "react-katex";
import "katex/dist/katex.min.css";
import { FormulaButton } from "./FormulaButton";

interface LaTeXModalProps {
  opened: boolean;
  onClose: () => void;
  onInsert: (formula: string) => void;
}

interface FormulaTemplate {
  title: string;
  formula: string;
  description: string;
  category: string;
}

const FORMULA_TEMPLATES: FormulaTemplate[] = [
  // Basic Operations
  {
    title: "Penjumlahan",
    formula: "[a]+[b]",
    description: "Penjumlahan (contoh: a=10, b=5 → hasil=15)",
    category: "Dasar"
  },
  {
    title: "Pengurangan", 
    formula: "[a]-[b]",
    description: "Pengurangan (contoh: a=10, b=3 → hasil=7)",
    category: "Dasar"
  },
  {
    title: "Perkalian",
    formula: "[a]*[b]", 
    description: "Perkalian (contoh: a=6, b=7 → hasil=42)",
    category: "Dasar"
  },
  {
    title: "Pembagian",
    formula: "[a]/[b]",
    description: "Pembagian (contoh: a=20, b=4 → hasil=5)",
    category: "Dasar"
  },
  {
    title: "Persentase",
    formula: "[x]*[percent]/100",
    description: "Persentase (contoh: x=200, percent=15 → hasil=30)",
    category: "Dasar"
  },
  
  // Powers & Roots
  {
    title: "Kuadrat",
    formula: "[x]^2", 
    description: "Kuadrat (contoh: x=5 → hasil=25)",
    category: "Pangkat"
  },
  {
    title: "Kubik",
    formula: "[x]^3",
    description: "Kubik (contoh: x=4 → hasil=64)",
    category: "Pangkat"
  },
  {
    title: "Akar Kuadrat",
    formula: "\\sqrt{[x]}",
    description: "Akar kuadrat (contoh: x=9 → hasil=3)",
    category: "Pangkat"
  },
  {
    title: "Pangkat",
    formula: "[base]^[exponent]",
    description: "Pangkat (contoh: base=2, exponent=8 → hasil=256)",
    category: "Pangkat"
  },
  
  // Geometry
  {
    title: "Teorema Pythagoras", 
    formula: "[a]^2 + [b]^2 = [c]^2",
    description: "Teorema Pythagoras (contoh: a=3, b=4, c=5 → 25=25 ✓)",
    category: "Geometri"
  },
  {
    title: "Luas Lingkaran",
    formula: "3.14159*[r]^2",
    description: "Luas lingkaran (contoh: r=5 → hasil=78.54)",
    category: "Geometri"
  },
  {
    title: "Keliling Lingkaran",
    formula: "2*3.14159*[r]",
    description: "Keliling lingkaran (contoh: r=7 → hasil=43.98)",
    category: "Geometri"
  },
  {
    title: "Luas Persegi Panjang",
    formula: "[length]*[width]",
    description: "Luas persegi panjang (contoh: length=8, width=5 → hasil=40)",
    category: "Geometri"
  },
  {
    title: "Luas Segitiga",
    formula: "0.5*[base]*[height]",
    description: "Luas segitiga (contoh: base=10, height=6 → hasil=30)",
    category: "Geometri"
  },
  
  // Fractions & Decimals
  {
    title: "Pecahan",
    formula: "\\frac{[numerator]}{[denominator]}",
    description: "Pecahan (contoh: 8/4 → hasil=2)",
    category: "Pecahan"
  },
  {
    title: "Pecahan Campuran ke Biasa",
    formula: "[whole]*[denominator]+[numerator]",
    description: "Pecahan campuran ke biasa (contoh: 2¾ = 2×4+3 → hasil=11)",
    category: "Pecahan"
  },
  
  // Statistics
  {
    title: "Rata-rata (2 angka)",
    formula: "([a]+[b])/2",
    description: "Rata-rata 2 angka (contoh: a=80, b=90 → hasil=85)",
    category: "Statistik"
  },
  {
    title: "Rata-rata (3 angka)",
    formula: "([a]+[b]+[c])/3",
    description: "Rata-rata 3 angka (contoh: a=70, b=80, c=90 → hasil=80)",
    category: "Statistik"
  },
  
  // Finance
  {
    title: "Bunga Sederhana",
    formula: "[principal]*[rate]*[time]/100",
    description: "Bunga sederhana (contoh: P=1000, r=5%, t=2 → hasil=100)",
    category: "Keuangan"
  },
  {
    title: "Diskon",
    formula: "[price]*[discount_percent]/100",
    description: "Diskon (contoh: price=500, discount=20% → hasil=100)",
    category: "Keuangan"
  },
  
  // Conversions
  {
    title: "Celcius ke Fahrenheit",
    formula: "[celsius]*9/5+32",
    description: "Celcius ke Fahrenheit (contoh: celsius=25 → hasil=77)",
    category: "Konversi"
  },
  {
    title: "Fahrenheit ke Celcius", 
    formula: "([fahrenheit]-32)*5/9",
    description: "Fahrenheit ke Celcius (contoh: fahrenheit=86 → hasil=30)",
    category: "Konversi"
  },
  
  // Simple Number
  {
    title: "Angka Sederhana",
    formula: "[x]",
    description: "Angka biasa (contoh: x=42 → hasil=42)",
    category: "Dasar"
  },

  // Advanced & Complex Formulas
  {
    title: "Akar Kubik",
    formula: "\\sqrt[3]{[x]}",
    description: "Akar kubik (contoh: x=27 → hasil=3)",
    category: "Lanjutan"
  },
  {
    title: "Rumus Kuadrat (Diskriminan)",
    formula: "\\sqrt{[b]^2 - 4*[a]*[c]}",
    description: "Diskriminan rumus kuadrat (contoh: a=1, b=5, c=6 → hasil=1)",
    category: "Lanjutan"
  },
  {
    title: "Jarak Dua Titik",
    formula: "\\sqrt{([x2]-[x1])^2 + ([y2]-[y1])^2}",
    description: "Jarak antara dua titik (contoh: (0,0) ke (3,4) → hasil=5)",
    category: "Lanjutan"
  },
  {
    title: "Standar Deviasi",
    formula: "\\sqrt{\\frac{([x1]-[mean])^2 + ([x2]-[mean])^2 + ([x3]-[mean])^2}{3}}",
    description: "Standar deviasi 3 data (contoh: x1=2, x2=4, x3=6, mean=4 → hasil=1.63)",
    category: "Lanjutan"
  },
  {
    title: "Teorema Pythagoras 3D",
    formula: "\\sqrt{[x]^2 + [y]^2 + [z]^2}",
    description: "Jarak 3D dari origin (contoh: x=1, y=2, z=2 → hasil=3)",
    category: "Lanjutan"
  },
  {
    title: "RMS (Root Mean Square)",
    formula: "\\sqrt{\\frac{[a]^2 + [b]^2 + [c]^2}{3}}",
    description: "RMS dari 3 nilai (contoh: a=3, b=4, c=5 → hasil=4.08)",
    category: "Lanjutan"
  },
  {
    title: "Kecepatan Final (Kinematika)",
    formula: "\\sqrt{[v0]^2 + 2*[a]*[s]}",
    description: "Kecepatan final (contoh: v0=10, a=2, s=5 → hasil=11.83)",
    category: "Lanjutan"
  },
  {
    title: "Hipotenusa Segitiga",
    formula: "\\sqrt{[a]^2 + [b]^2}",
    description: "Panjang hipotenusa (contoh: a=3, b=4 → hasil=5)",
    category: "Lanjutan"
  },
  {
    title: "Rata-rata Geometrik",
    formula: "\\sqrt{[a]*[b]}",
    description: "Rata-rata geometrik 2 angka (contoh: a=4, b=9 → hasil=6)",
    category: "Lanjutan"
  },
  {
    title: "Formula Heron (Luas Segitiga)",
    formula: "\\sqrt{[s]*([s]-[a])*([s]-[b])*([s]-[c])}",
    description: "Luas segitiga dengan sisi a,b,c dan s=semi-perimeter",
    category: "Lanjutan"
  },
  {
    title: "Resonansi Frekuensi",
    formula: "\\frac{1}{2*3.14159*\\sqrt{[L]*[C]}}",
    description: "Frekuensi resonansi LC (contoh: L=1, C=1 → hasil=0.159)",
    category: "Lanjutan"
  },
  {
    title: "Escape Velocity",
    formula: "\\sqrt{\\frac{2*[G]*[M]}{[r]}}",
    description: "Kecepatan lepas planet (G=grav const, M=massa, r=radius)",
    category: "Lanjutan"
  }
];

export const LaTeXModal: React.FC<LaTeXModalProps> = ({ 
  opened, 
  onClose, 
  onInsert 
}) => {
  const [formula, setFormula] = useState("");
  const [isInlineMode, setIsInlineMode] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [placeholders, setPlaceholders] = useState<string[]>([]);
  const [placeholderValues, setPlaceholderValues] = useState<{[key: string]: string}>({});

  // Extract placeholders from formula
  const extractPlaceholders = useCallback((formula: string) => {
    const matches = formula.match(/\[([^\]]+)\]/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  }, []);

  const handleFormulaSelect = useCallback((selectedFormula: string) => {
    setFormula(selectedFormula);
    setPreviewError(null);
    
    // Extract and initialize placeholders
    const foundPlaceholders = extractPlaceholders(selectedFormula);
    setPlaceholders(foundPlaceholders);
    
    // Initialize placeholder values
    const initialValues: {[key: string]: string} = {};
    foundPlaceholders.forEach(placeholder => {
      initialValues[placeholder] = "";
    });
    setPlaceholderValues(initialValues);
  }, [extractPlaceholders]);

  const handleInsert = useCallback(() => {
    if (formula.trim()) {
      // Replace placeholders with actual values
      let finalFormula = formula;
      Object.entries(placeholderValues).forEach(([placeholder, value]) => {
        if (value.trim()) {
          finalFormula = finalFormula.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), value);
        }
      });
      
      onInsert(finalFormula);
      setFormula("");
      setPlaceholders([]);
      setPlaceholderValues({});
      onClose();
    }
  }, [formula, placeholderValues, onInsert, onClose]);

  const handleCancel = useCallback(() => {
    setFormula("");
    setPreviewError(null);
    setPlaceholders([]);
    setPlaceholderValues({});
    onClose();
  }, [onClose]);

  // Convert LaTeX to readable mathematical notation for copy functionality  
  const convertToReadableFormula = useCallback((formula: string) => {
    try {
      let readableFormula = formula.trim();
      
      // Replace placeholders with actual values first
      Object.entries(placeholderValues).forEach(([placeholder, value]) => {
        if (value.trim()) {
          readableFormula = readableFormula.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), value);
        }
      });

      // Convert LaTeX symbols to readable format
      readableFormula = readableFormula
        // Cube roots (handle before square roots)
        .replace(/\\sqrt\[3\]\{([^}]+)\}/g, '∛$1')
        // Square roots
        .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
        // Fractions
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1÷$2')
        // Powers (convert ^ to superscript notation)
        .replace(/\^2/g, '²')
        .replace(/\^3/g, '³')
        .replace(/\^4/g, '⁴')
        .replace(/\^5/g, '⁵')
        .replace(/\^6/g, '⁶')
        .replace(/\^7/g, '⁷')
        .replace(/\^8/g, '⁸')
        .replace(/\^9/g, '⁹')
        .replace(/\^0/g, '⁰')
        .replace(/\^1/g, '¹')
        // For other numbers, keep the caret notation
        .replace(/\^([0-9]+)/g, '^$1')
        // Mathematical operators
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        // Constants (replace common decimal approximations)
        .replace(/3\.14159/g, 'π')
        .replace(/2\.71828/g, 'e')
        // Remove any remaining backslashes
        .replace(/\\/g, '');

      return readableFormula;
    } catch (error) {
      return formula;
    }
  }, [placeholderValues]);

  const handleCopyRenderedFormula = useCallback(async () => {
    if (!formula.trim()) return;
    
    const readableFormula = convertToReadableFormula(formula);
    
    try {
      await navigator.clipboard.writeText(readableFormula);
      // Could add a toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, [formula, convertToReadableFormula]);

  const renderPreview = useCallback(() => {
    if (!formula.trim()) return null;
    
    try {
      // Replace placeholders with actual values for preview, or keep placeholders if empty
      let previewFormula = formula;
      Object.entries(placeholderValues).forEach(([placeholder, value]) => {
        if (value.trim()) {
          previewFormula = previewFormula.replace(new RegExp(`\\[${placeholder}\\]`, 'g'), value);
        }
      });
      
      return isInlineMode ? (
        <InlineMath math={previewFormula} />
      ) : (
        <BlockMath math={previewFormula} />
      );
    } catch (error) {
      return (
        <Text color="red" size="sm">
          Rumus LaTeX tidak valid
        </Text>
      );
    }
  }, [formula, isInlineMode, placeholderValues]);

  // Separate effect to handle preview error state
  React.useEffect(() => {
    if (!formula.trim()) {
      setPreviewError(null);
      return;
    }
    
    try {
      // Test if formula is valid by creating a temporary element
      const testElement = document.createElement('div');
      testElement.style.position = 'absolute';
      testElement.style.visibility = 'hidden';
      document.body.appendChild(testElement);
      
      if (isInlineMode) {
        testElement.innerHTML = `<span>${formula}</span>`;
      } else {
        testElement.innerHTML = `<div>${formula}</div>`;
      }
      
      document.body.removeChild(testElement);
      setPreviewError(null);
    } catch (error) {
      setPreviewError("Rumus LaTeX tidak valid");
    }
  }, [formula, isInlineMode]);

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={
        <Group gap="sm">
          <IconFunction size={20} />
          <Text fw={600}>Sisipkan Rumus Matematika</Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack gap="md">
        {/* Help Text */}
        <Box>
          <Badge variant="light" color="green" size="sm" mb="xs">
            💡 Panduan:
          </Badge>
          <Text size="xs" c="dimmed">
            Pilih template di bawah atau ketik manual. Contoh: "5+3", "√16", "12^2", "3^2+4^2=5^2"
          </Text>
        </Box>

        {/* LaTeX Code Input */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Badge variant="filled" color="blue" size="sm">
              Kode LaTeX:
            </Badge>
            <Group gap="md">
              <Switch
                label="Mode Inline"
                size="sm"
                checked={isInlineMode}
                onChange={(event) => setIsInlineMode(event.currentTarget.checked)}
              />
              <Button variant="light" size="xs" onClick={() => {
                setFormula("");
                setPlaceholders([]);
                setPlaceholderValues({});
              }}>
                Hapus
              </Button>
            </Group>
          </Group>
          
          <Textarea
            value={formula}
            onChange={(event) => {
              const newFormula = event.currentTarget.value;
              setFormula(newFormula);
              
              // Update placeholders when manually editing formula
              const foundPlaceholders = extractPlaceholders(newFormula);
              setPlaceholders(foundPlaceholders);
              
              // Keep existing values and initialize new ones
              const updatedValues = { ...placeholderValues };
              foundPlaceholders.forEach(placeholder => {
                if (!updatedValues.hasOwnProperty(placeholder)) {
                  updatedValues[placeholder] = "";
                }
              });
              
              // Remove values for placeholders that no longer exist
              Object.keys(updatedValues).forEach(key => {
                if (!foundPlaceholders.includes(key)) {
                  delete updatedValues[key];
                }
              });
              
              setPlaceholderValues(updatedValues);
            }}
            placeholder="Masukkan rumus LaTeX (contoh: x^2 + y^2 = z^2)"
            minRows={3}
            maxRows={6}
            styles={{
              input: {
                fontFamily: "Monaco, Consolas, 'Courier New', monospace",
                fontSize: "14px"
              }
            }}
          />
        </Box>

        {/* Placeholder Inputs */}
        {placeholders.length > 0 && (
          <Box>
            <Badge variant="light" color="orange" size="sm" mb="xs">
              Isi Nilai:
            </Badge>
            <Grid>
              {placeholders.map((placeholder, index) => (
                <Grid.Col span={6} key={index}>
                  <TextInput
                    label={placeholder}
                    placeholder={`Masukkan nilai untuk ${placeholder}`}
                    value={placeholderValues[placeholder] || ""}
                    onChange={(event) => {
                      const value = event.currentTarget?.value || "";
                      setPlaceholderValues(prev => ({
                        ...prev,
                        [placeholder]: value
                      }));
                    }}
                    size="sm"
                  />
                </Grid.Col>
              ))}
            </Grid>
          </Box>
        )}

        {/* Preview */}
        {formula && (
          <Box>
            <Group justify="space-between" mb="xs">
              <Badge variant="light" color="green" size="sm">
                Pratinjau:
              </Badge>
              <ActionIcon
                variant="light"
                color="blue"
                size="sm"
                onClick={handleCopyRenderedFormula}
                title="Salin rumus yang sudah di-render"
              >
                <IconCopy size={16} />
              </ActionIcon>
            </Group>
            <Card withBorder p="md" style={{ textAlign: "center", minHeight: 60 }}>
              {renderPreview()}
            </Card>
          </Box>
        )}

        <Divider />

        {/* Common Formulas */}
        <Box>
          <Text fw={600} mb="sm">Rumus Umum:</Text>
          
          <ScrollArea h={300}>
            <Grid>
              {FORMULA_TEMPLATES.map((template, index) => (
                <Grid.Col span={6} key={index}>
                  <FormulaButton
                    title={template.title}
                    formula={template.formula}
                    description={template.description}
                    category={template.category}
                    onClick={() => handleFormulaSelect(template.formula)}
                  />
                </Grid.Col>
              ))}
            </Grid>
          </ScrollArea>
        </Box>

        {/* Action Buttons */}
        <Group justify="flex-end" mt="md">
          <Button 
            variant="light" 
            color="gray"
            onClick={handleCancel}
          >
            Batal
          </Button>
          <Button 
            onClick={handleInsert}
            disabled={!formula.trim() || !!previewError}
          >
            Sisipkan Rumus
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default LaTeXModal;