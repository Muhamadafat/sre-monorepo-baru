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
import { IconX, IconFunction } from "@tabler/icons-react";
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
    title: "Addition",
    formula: "[a]+[b]",
    description: "Penjumlahan (contoh: a=10, b=5 → hasil=15)",
    category: "Basic"
  },
  {
    title: "Subtraction", 
    formula: "[a]-[b]",
    description: "Pengurangan (contoh: a=10, b=3 → hasil=7)",
    category: "Basic"
  },
  {
    title: "Multiplication",
    formula: "[a]*[b]", 
    description: "Perkalian (contoh: a=6, b=7 → hasil=42)",
    category: "Basic"
  },
  {
    title: "Division",
    formula: "[a]/[b]",
    description: "Pembagian (contoh: a=20, b=4 → hasil=5)",
    category: "Basic"
  },
  {
    title: "Percentage",
    formula: "[x]*[percent]/100",
    description: "Persentase (contoh: x=200, percent=15 → hasil=30)",
    category: "Basic"
  },
  
  // Powers & Roots
  {
    title: "Square",
    formula: "[x]^2", 
    description: "Kuadrat (contoh: x=5 → hasil=25)",
    category: "Powers"
  },
  {
    title: "Cube",
    formula: "[x]^3",
    description: "Kubik (contoh: x=4 → hasil=64)",
    category: "Powers"
  },
  {
    title: "Square Root",
    formula: "\\sqrt{[x]}",
    description: "Akar kuadrat (contoh: x=9 → hasil=3)",
    category: "Powers"
  },
  {
    title: "Power",
    formula: "[base]^[exponent]",
    description: "Pangkat (contoh: base=2, exponent=8 → hasil=256)",
    category: "Powers"
  },
  
  // Geometry
  {
    title: "Pythagorean Theorem", 
    formula: "[a]^2 + [b]^2 = [c]^2",
    description: "Teorema Pythagoras (contoh: a=3, b=4, c=5 → 25=25 ✓)",
    category: "Geometry"
  },
  {
    title: "Circle Area",
    formula: "3.14159*[r]^2",
    description: "Luas lingkaran (contoh: r=5 → hasil=78.54)",
    category: "Geometry"
  },
  {
    title: "Circle Circumference",
    formula: "2*3.14159*[r]",
    description: "Keliling lingkaran (contoh: r=7 → hasil=43.98)",
    category: "Geometry"
  },
  {
    title: "Rectangle Area",
    formula: "[length]*[width]",
    description: "Luas persegi panjang (contoh: length=8, width=5 → hasil=40)",
    category: "Geometry"
  },
  {
    title: "Triangle Area",
    formula: "0.5*[base]*[height]",
    description: "Luas segitiga (contoh: base=10, height=6 → hasil=30)",
    category: "Geometry"
  },
  
  // Fractions & Decimals
  {
    title: "Fraction",
    formula: "\\frac{[numerator]}{[denominator]}",
    description: "Pecahan (contoh: 8/4 → hasil=2)",
    category: "Fractions"
  },
  {
    title: "Mixed to Improper",
    formula: "[whole]*[denominator]+[numerator]",
    description: "Pecahan campuran ke biasa (contoh: 2¾ = 2*4+3 → hasil=11)",
    category: "Fractions"
  },
  
  // Statistics
  {
    title: "Average (2 numbers)",
    formula: "([a]+[b])/2",
    description: "Rata-rata 2 angka (contoh: a=80, b=90 → hasil=85)",
    category: "Statistics"
  },
  {
    title: "Average (3 numbers)",
    formula: "([a]+[b]+[c])/3",
    description: "Rata-rata 3 angka (contoh: a=70, b=80, c=90 → hasil=80)",
    category: "Statistics"
  },
  
  // Finance
  {
    title: "Simple Interest",
    formula: "[principal]*[rate]*[time]/100",
    description: "Bunga sederhana (contoh: P=1000, r=5%, t=2 → hasil=100)",
    category: "Finance"
  },
  {
    title: "Discount",
    formula: "[price]*[discount_percent]/100",
    description: "Diskon (contoh: price=500, discount=20% → hasil=100)",
    category: "Finance"
  },
  
  // Conversions
  {
    title: "Celsius to Fahrenheit",
    formula: "[celsius]*9/5+32",
    description: "Celcius ke Fahrenheit (contoh: celsius=25 → hasil=77)",
    category: "Conversion"
  },
  {
    title: "Fahrenheit to Celsius", 
    formula: "([fahrenheit]-32)*5/9",
    description: "Fahrenheit ke Celcius (contoh: fahrenheit=86 → hasil=30)",
    category: "Conversion"
  },
  
  // Simple Number
  {
    title: "Simple Number",
    formula: "[x]",
    description: "Angka biasa (contoh: x=42 → hasil=42)",
    category: "Basic"
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
          Invalid LaTeX formula
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
      setPreviewError("Invalid LaTeX formula");
    }
  }, [formula, isInlineMode]);

  return (
    <Modal
      opened={opened}
      onClose={handleCancel}
      title={
        <Group gap="sm">
          <IconFunction size={20} />
          <Text fw={600}>Insert LaTeX Formula</Text>
        </Group>
      }
      size="xl"
      centered
    >
      <Stack gap="md">
        {/* Help Text */}
        <Box>
          <Badge variant="light" color="green" size="sm" mb="xs">
            💡 Tips:
          </Badge>
          <Text size="xs" c="dimmed">
            Pilih template di bawah atau ketik manual. Contoh: "5+3", "√16", "12^2", "3^2+4^2=5^2"
          </Text>
        </Box>

        {/* LaTeX Code Input */}
        <Box>
          <Group justify="space-between" mb="xs">
            <Badge variant="filled" color="blue" size="sm">
              LaTeX Code:
            </Badge>
            <Group gap="md">
              <Switch
                label="Inline Mode"
                size="sm"
                checked={isInlineMode}
                onChange={(event) => setIsInlineMode(event.currentTarget.checked)}
              />
              <Button variant="light" size="xs" onClick={() => {
                setFormula("");
                setPlaceholders([]);
                setPlaceholderValues({});
              }}>
                Clear
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
            placeholder="Enter LaTeX formula (e.g., x^2 + y^2 = z^2)"
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
              Fill Values:
            </Badge>
            <Grid>
              {placeholders.map((placeholder, index) => (
                <Grid.Col span={6} key={index}>
                  <TextInput
                    label={placeholder}
                    placeholder={`Enter value for ${placeholder}`}
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
            <Badge variant="light" color="green" size="sm" mb="xs">
              Preview:
            </Badge>
            <Card withBorder p="md" style={{ textAlign: "center", minHeight: 60 }}>
              {renderPreview()}
            </Card>
          </Box>
        )}

        <Divider />

        {/* Common Formulas */}
        <Box>
          <Text fw={600} mb="sm">Common Formulas:</Text>
          
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
            Cancel
          </Button>
          <Button 
            onClick={handleInsert}
            disabled={!formula.trim() || !!previewError}
          >
            Insert Formula
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default LaTeXModal;