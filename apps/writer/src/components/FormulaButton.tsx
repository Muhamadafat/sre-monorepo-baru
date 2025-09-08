"use client";

import React from "react";
import { Card, Stack, Group, Text, Badge, Box, Tooltip } from "@mantine/core";
import { BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

interface FormulaButtonProps {
  title: string;
  formula: string;
  description: string;
  category: string;
  onClick: () => void;
}

export const FormulaButton: React.FC<FormulaButtonProps> = ({
  title,
  formula,
  description,
  category,
  onClick,
}) => {
  return (
    <Tooltip label={`Klik untuk menggunakan rumus ${title}: ${description}`}>
      <Card 
        withBorder 
        p="sm" 
        style={{ cursor: "pointer", height: "100%" }}
        onClick={onClick}
        className="hover:bg-gray-50"
      >
      <Stack gap="xs" h="100%">
        <Group justify="space-between">
          <Text fw={500} size="sm" color="blue">
            {title}
          </Text>
          <Badge variant="light" size="xs">
            {category}
          </Badge>
        </Group>
        
        <Box style={{ textAlign: "center", flex: 1 }}>
          <BlockMath math={formula} />
        </Box>
        
        <Text size="xs" color="dimmed" ta="center">
          {description}
        </Text>
      </Stack>
      </Card>
    </Tooltip>
  );
};

export default FormulaButton;