//Concept Map

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Network } from 'vis-network';
import { DataSet } from 'vis-data/peer';
import 'vis-network/styles/vis-network.css';
import {
  Box, useMantineTheme, useMantineColorScheme, Center, Stack, Text,
  ActionIcon, Group, Tooltip, Modal, TextInput, Textarea, Button, Kbd, Paper, Divider, Badge, ColorPicker, ColorInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconPlus, IconArrowRight, IconZoomIn, IconZoomOut, IconBrain, IconFileExport,
  IconTrash, IconArrowUp, IconArrowDown, IconArrowLeft, IconArrowBigUp, IconArrowBigDown, IconHandStop,
  IconMaximize, IconNetwork, IconEye
} from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';

// Tipe data baru untuk Node kita
interface MapNode {
  id: string;
  label: string;
  title: string; // Judul untuk tooltip
  content?: string;
  type: 'H1' | 'H2_H4' | 'Paragraph';
  shape: string;
  color: any;
  margin: any;
  borderWidth: number;
  font: any; // Properti baru untuk styling font
}

interface ConceptMapProps {
  onGenerateToEditor: (nodes: MapNode[], edges: any[]) => void;
  initialData?: { nodes: MapNode[], edges: any[] };
  onDataChange?: (nodes: MapNode[], edges: any[]) => void;
}

const ConceptMap: React.FC<ConceptMapProps> = ({ onGenerateToEditor, initialData, onDataChange }) => {
  const visJsRef = useRef<HTMLDivElement>(null);
  const networkInstance = useRef<Network | null>(null);
  const [nodes, setNodes] = useState(new DataSet<MapNode>([]));
  const [edges, setEdges] = useState(new DataSet<{ id: string; from: string; to: string }>([]));

  const [typeSelectionOpened, { open: openTypeSelection, close: closeTypeSelection }] = useDisclosure(false);
  const [nodeCreationOpened, { open: openNodeCreation, close: closeNodeCreation }] = useDisclosure(false);
  const [nodeViewOpened, { open: openNodeView, close: closeNodeView }] = useDisclosure(false);
  const [nodeType, setNodeType] = useState<'H1' | 'H2_H4' | 'Paragraph'>('H1');
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeContent, setNodeContent] = useState('');
  const [nodeColor, setNodeColor] = useState<string>('#4ecdc4'); // Default color
  const [selectedNodeData, setSelectedNodeData] = useState<MapNode | null>(null);
  const [editNodeOpened, { open: openEditNode, close: closeEditNode }] = useDisclosure(false);
  const [editNodeTitle, setEditNodeTitle] = useState('');
  const [editNodeContent, setEditNodeContent] = useState('');

  const [activeMode, setActiveMode] = useState<'none' | 'addEdge' | 'delete'>('none');


  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();

  // Load initial data when component mounts or initialData changes
  useEffect(() => {
    console.log("=== CONCEPT MAP DATA LOADING ===");
    console.log("initialData:", initialData);
    console.log("Has nodes:", initialData?.nodes?.length || 0);
    console.log("Has edges:", initialData?.edges?.length || 0);

    if (initialData && (initialData.nodes.length > 0 || initialData.edges.length > 0)) {
      console.log("Loading initial concept map data:", initialData);

      // Don't clear if we already have the same data
      const currentNodes = nodes.get();
      const currentEdges = edges.get();

      console.log("Current nodes:", currentNodes.length);
      console.log("Current edges:", currentEdges.length);

      // Only reload if data is different
      if (currentNodes.length !== initialData.nodes.length ||
          currentEdges.length !== initialData.edges.length) {

        console.log("Data is different, reloading...");

        // Clear existing data first
        nodes.clear();
        edges.clear();

        // Add initial data
        if (initialData.nodes.length > 0) {
          nodes.add(initialData.nodes);
          console.log("Added", initialData.nodes.length, "nodes");
        }
        if (initialData.edges.length > 0) {
          edges.add(initialData.edges);
          console.log("Added", initialData.edges.length, "edges");
        }

        console.log("Initial data loaded successfully");
      } else {
        console.log("Data is same, skipping reload");
      }
    } else {
      console.log("No initial data to load");
    }
  }, [initialData]);

  const getNodeStyle = (type: 'H1' | 'H2_H4' | 'Paragraph') => {
    switch (type) {
      case 'H1':
        return { background: theme.colors.green[1], border: theme.colors.green[6] };
      case 'H2_H4':
        return { background: theme.colors.yellow[1], border: theme.colors.yellow[6] };
      case 'Paragraph':
      default:
        return { background: theme.colors.gray[2], border: theme.colors.gray[5] };
    }
  };

  const handleAddNode = () => {
    if (!nodeTitle) return;

    let label = nodeTitle;
    let font: any = { size: 16 };

    if (nodeType === 'H1') {
      font = { size: 18, bold: true, face: 'Arial' };
      label = nodeTitle.length > 30 ? nodeTitle.substring(0, 30) + '...' : nodeTitle;
    } else if (nodeType === 'H2_H4') {
      if (nodeContent) {
        label = `${nodeTitle.length > 25 ? nodeTitle.substring(0, 25) + '...' : nodeTitle}\n${nodeContent.length > 40 ? nodeContent.substring(0, 40) + '...' : nodeContent}`;
      } else {
        label = nodeTitle.length > 30 ? nodeTitle.substring(0, 30) + '...' : nodeTitle;
      }
      font = { multi: true, size: 14, bold: { size: 16 } };
    } else if (nodeType === 'Paragraph') {
      label = nodeTitle.length > 50 ? nodeTitle.substring(0, 50) + '...' : nodeTitle;
      font = { size: 14 };
    }

    const newNode: MapNode = {
      id: uuidv4(),
      label: label,
      title: `${nodeTitle}${nodeContent ? `\n\n${nodeContent}`: ''}`,
      content: nodeContent,
      type: nodeType,
      shape: 'box',
      color: { background: nodeColor, border: nodeColor },
      margin: { top: 10, right: 15, bottom: 10, left: 15 },
      borderWidth: 2,
      font: font,
    };

    nodes.add(newNode);

    // Auto-save to parent after adding node
    if (onDataChange) {
      setTimeout(() => {
        const currentNodes = nodes.get();
        const currentEdges = edges.get();
        onDataChange(currentNodes, currentEdges);
      }, 100);
    }

    closeNodeCreation();
    setNodeTitle('');
    setNodeContent('');
    setNodeColor('#4ecdc4'); // Reset to default color
  };

  const handleNodeClick = (nodeId: string) => {
    const nodeData = nodes.get(nodeId);
    if (nodeData) {
      setSelectedNodeData(nodeData);
      openNodeView();
    }
  };

  const handleZoomIn = () => {
    if (networkInstance.current) {
      const currentScale = networkInstance.current.getScale();
      networkInstance.current.moveTo({ scale: currentScale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    if (networkInstance.current) {
      const currentScale = networkInstance.current.getScale();
      networkInstance.current.moveTo({ scale: currentScale / 1.2 });
    }
  };

  const setMode = (mode: 'none' | 'addEdge' | 'delete') => {
    if (!networkInstance.current) return;

    if (activeMode === mode) {
      // Jika mode yang sama diklik lagi, matikan mode
      networkInstance.current.disableEditMode();
      setActiveMode('none');
    } else {
      // Aktifkan mode baru
      networkInstance.current.disableEditMode();

      if (mode === 'addEdge') {
        networkInstance.current.addEdgeMode();
      } else if (mode === 'delete') {
        const selectedNodes = networkInstance.current.getSelectedNodes();
        const selectedEdges = networkInstance.current.getSelectedEdges();

        if (selectedNodes.length > 0) {
          selectedNodes.forEach(nodeId => {
            nodes.remove(nodeId);
            const connectedEdges = edges.get({
              filter: (item) => item.from === nodeId || item.to === nodeId
            });
            edges.remove(connectedEdges.map(edge => edge.id));
          });
        }

        if (selectedEdges.length > 0) {
          edges.remove(selectedEdges);
        }

        // Auto-save after deletion
        if (onDataChange) {
          setTimeout(() => {
            const currentNodes = nodes.get();
            const currentEdges = edges.get();
            onDataChange(currentNodes, currentEdges);
          }, 100);
        }

        setActiveMode('none');
        return;
      }

      setActiveMode(mode);
    }
  };

  const moveNetwork = (direction: 'up' | 'down' | 'left' | 'right') => {
      if(!networkInstance.current) return;
      const moveDistance = 100;
      const currentPosition = networkInstance.current.getViewPosition();
      let newPosition = { ...currentPosition };

      switch(direction) {
          case 'up': newPosition.y -= moveDistance; break;
          case 'down': newPosition.y += moveDistance; break;
          case 'left': newPosition.x -= moveDistance; break;
          case 'right': newPosition.x += moveDistance; break;
      }
      networkInstance.current.moveTo({ position: newPosition });
  };

  useEffect(() => {
    if (visJsRef.current) {
      console.log('Creating network with nodes:', nodes.get(), 'edges:', edges.get());
      const options = {
        layout: {
          randomSeed: 2
        },
        physics: {
          enabled: true,
          stabilization: { iterations: 100 },
          barnesHut: {
            gravitationalConstant: -2000,
            centralGravity: 0.3,
            springLength: 95,
            springConstant: 0.04,
            damping: 0.09,
            avoidOverlap: 0.1
          }
        },
        edges: {
          arrows: { to: { enabled: true, scaleFactor: 0.7 } },
          color: { color: colorScheme === 'dark' ? '#868e96' : '#adb5bd', highlight: theme.colors.blue[5] }
        },
        nodes: {
          shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 2, y: 2 },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          dragNodes: true,
          dragView: true,
          zoomView: true
        },
        manipulation: {
          enabled: true,
          addEdge: function (data: { from: string; to: string }, callback: (edgeData: any) => void) {
            if (data.from !== data.to) {
              const newEdge = { id: uuidv4(), from: data.from, to: data.to };
              callback(newEdge);
              setActiveMode('none');
            } else {
              callback(null);
            }
          }
        },
      };

      const network = new Network(visJsRef.current, { nodes, edges }, options as any);
      networkInstance.current = network;

      network.on("click", (event) => {
        if (event.nodes.length > 0) {
          if (activeMode === 'none') {
            handleNodeClick(event.nodes[0]);
          }
        }
      });

      network.on("selectNode", (event) => {
        if (activeMode === 'none' && event.nodes.length > 0) {
          const nodeId = event.nodes[0];
          const nodeData = nodes.get(nodeId);
          if (nodeData) {
            setSelectedNodeData(nodeData);
            openNodeView();
          }
        }
      });

      network.on("oncontext", (event) => {
        event.event.preventDefault();
      });

      network.on("doubleClick", (event) => {
        if (event.nodes.length === 0) {
          openTypeSelection();
        }
      });

      network.on("stabilizationIterationsDone", () => {
        network.setOptions({ physics: false });
      });

      network.once("afterDrawing", () => {
        network.fit();
      });

      return () => {
        network.destroy();
        networkInstance.current = null;
      };
    }
  }, [nodes, edges, colorScheme, theme]);

  const handleTypeSelection = (type: 'H1' | 'H2_H4' | 'Paragraph') => {
    setNodeType(type);

    // Set default color based on type
    const defaultColors = {
      'H1': '#4ecdc4',
      'H2_H4': '#f38181',
      'Paragraph': '#ffffd2'
    };
    setNodeColor(defaultColors[type]);

    closeTypeSelection();
    openNodeCreation();
  };

  const handleEditNode = () => {
    if (!selectedNodeData || !editNodeTitle) return;

    let label = editNodeTitle;
    let font: any = { size: 16 };

    if (selectedNodeData.type === 'H1') {
      font = { size: 18, bold: true, face: 'Arial' };
      label = editNodeTitle.length > 30 ? editNodeTitle.substring(0, 30) + '...' : editNodeTitle;
    } else if (selectedNodeData.type === 'H2_H4') {
      if (editNodeContent) {
        label = `${editNodeTitle.length > 25 ? editNodeTitle.substring(0, 25) + '...' : editNodeTitle}\n${editNodeContent.length > 40 ? editNodeContent.substring(0, 40) + '...' : editNodeContent}`;
      } else {
        label = editNodeTitle.length > 30 ? editNodeTitle.substring(0, 30) + '...' : editNodeTitle;
      }
      font = { multi: true, size: 14, bold: { size: 16 } };
    } else if (selectedNodeData.type === 'Paragraph') {
      label = editNodeTitle.length > 50 ? editNodeTitle.substring(0, 50) + '...' : editNodeTitle;
      font = { size: 14 };
    }

    const updatedNode: MapNode = {
      ...selectedNodeData,
      label: label,
      title: `${editNodeTitle}${editNodeContent ? `\n\n${editNodeContent}`: ''}`,
      content: editNodeContent,
      font: font,
    };

    nodes.update(updatedNode);

    // Auto-save after updating node
    if (onDataChange) {
      setTimeout(() => {
        const currentNodes = nodes.get();
        const currentEdges = edges.get();
        onDataChange(currentNodes, currentEdges);
      }, 100);
    }

    closeEditNode();
    closeNodeView();
    setEditNodeTitle('');
    setEditNodeContent('');
  };

  const openEditNodeModal = () => {
    if (selectedNodeData) {
      const titlePart = selectedNodeData.title ? selectedNodeData.title.split('\n\n')[0] : selectedNodeData.label;
      setEditNodeTitle(titlePart);
      setEditNodeContent(selectedNodeData.content || '');
      closeNodeView();
      openEditNode();
    }
  };


  return (
    <Stack style={{ height: '100%', width: '100%' }} gap={0}>
      <Box style={{ flex: 1, position: 'relative', minHeight: '400px' }}>
        <Box
          ref={visJsRef}
          style={{
            height: '100%',
            width: '100%',
            border: '1px solid #ddd',
            borderRadius: '8px',
            background: colorScheme === 'dark' ? '#1a1b1e' : '#ffffff'
          }}
        />
      </Box>

      <Paper p="xs" withBorder>
        <Group justify="space-between">

          <Group>
              <Button onClick={openTypeSelection} leftSection={<IconPlus size={16}/>} size="xs" variant="gradient" gradient={{ from: 'green', to: 'yellow', deg: 45 }}>
                Tambah Node
              </Button>
          </Group>

          <Group>
            <ActionIcon.Group>
              <Tooltip label="Geser Atas"><ActionIcon variant="default" size="lg" onClick={() => moveNetwork('up')}><IconArrowUp size={20} /></ActionIcon></Tooltip>
              <Tooltip label="Geser Bawah"><ActionIcon variant="default" size="lg" onClick={() => moveNetwork('down')}><IconArrowDown size={20} /></ActionIcon></Tooltip>
              <Tooltip label="Geser Kiri"><ActionIcon variant="default" size="lg" onClick={() => moveNetwork('left')}><IconArrowLeft size={20} /></ActionIcon></Tooltip>
              <Tooltip label="Geser Kanan"><ActionIcon variant="default" size="lg" onClick={() => moveNetwork('right')}><IconArrowRight size={20} /></ActionIcon></Tooltip>
            </ActionIcon.Group>

            <ActionIcon.Group>
              <Tooltip label="Zoom In"><ActionIcon variant="default" size="lg" onClick={handleZoomIn}><IconZoomIn size={20} /></ActionIcon></Tooltip>
              <Tooltip label="Zoom Out"><ActionIcon variant="default" size="lg" onClick={handleZoomOut}><IconZoomOut size={20} /></ActionIcon></Tooltip>
              <Tooltip label="Pindah ke Tengah"><ActionIcon variant="default" size="lg" onClick={() => networkInstance.current?.fit()}><IconMaximize size={20} /></ActionIcon></Tooltip>
            </ActionIcon.Group>
          </Group>

          <Group ml="auto">
            <ActionIcon.Group>
                <Tooltip label={activeMode === 'addEdge' ? "Mode Hubungan Node (Aktif)" : "Aktifkan Mode Hubungan Node"}>
                    <ActionIcon variant={activeMode === 'addEdge' ? "filled" : "default"} color="blue" size="lg" onClick={() => setMode('addEdge')}><IconNetwork size={20}/></ActionIcon>
                </Tooltip>
                <Tooltip label="Hapus Node/Hubungan Terpilih">
                    <ActionIcon variant={activeMode === 'delete' ? "filled" : "default"} color="red" size="lg" onClick={() => setMode('delete')}><IconTrash size={20}/></ActionIcon>
                </Tooltip>
            </ActionIcon.Group>

            <Tooltip label="Generate ke Editor">
                <ActionIcon variant="filled" color="green" size="lg" onClick={() => onGenerateToEditor(nodes.get(), edges.get())}><IconFileExport size={20}/></ActionIcon>
            </Tooltip>
          </Group>

        </Group>
      </Paper>

      <Modal opened={typeSelectionOpened} onClose={closeTypeSelection} title="Pilih Tipe Node" centered size="sm">
        <Stack>
          <Button
            onClick={() => handleTypeSelection('H1')}
            color="green"
            variant="light"
            size="lg"
            leftSection={<IconPlus size={20}/>}
          >
            Judul (Hijau)
          </Button>
          <Button
            onClick={() => handleTypeSelection('H2_H4')}
            color="yellow"
            variant="light"
            size="lg"
            leftSection={<IconPlus size={20}/>}
          >
            Sub-Judul & Isi (Kuning)
          </Button>
          <Button
            onClick={() => handleTypeSelection('Paragraph')}
            color="gray"
            variant="light"
            size="lg"
            leftSection={<IconPlus size={20}/>}
          >
            Paragraf (Abu-Abu)
          </Button>
        </Stack>
      </Modal>

      <Modal
        opened={nodeCreationOpened}
        onClose={closeNodeCreation}
        title={`Tambah ${nodeType === 'H1' ? 'Judul' : nodeType === 'H2_H4' ? 'Sub-Judul' : 'Paragraf'}`}
        centered
      >
        <Stack>
            <TextInput
                label={nodeType === 'Paragraph' ? 'Ide Pokok / Kalimat' : 'Judul'}
                placeholder="Masukkan teks (jangan terlalu panjang)..."
                value={nodeTitle}
                onChange={(e) => setNodeTitle(e.currentTarget.value)}
                required
            />
            {nodeType === 'H2_H4' && (
                <Textarea
                    label="Kalimat Pendukung (Opsional)"
                    placeholder="Masukkan detail kalimat (jangan terlalu panjang)..."
                    value={nodeContent}
                    onChange={(e) => setNodeContent(e.currentTarget.value)}
                    autosize
                    minRows={3}
                />
            )}

            <Box>
              <Text size="sm" fw={500} mb="xs">Pilih Warna</Text>
              <Group gap="xs" mb="md">
                {['#4ecdc4', '#95e1d3', '#f38181', '#aa96da', '#fcbad3', '#ffffd2', '#a8d8ea', '#ffaaa5'].map((color) => (
                  <ActionIcon
                    key={color}
                    size="lg"
                    radius="md"
                    variant={nodeColor === color ? 'filled' : 'light'}
                    style={{
                      backgroundColor: color,
                      border: nodeColor === color ? '3px solid #000' : '2px solid #ddd'
                    }}
                    onClick={() => setNodeColor(color)}
                  />
                ))}
              </Group>
              <ColorInput
                label="Atau pilih warna custom"
                value={nodeColor}
                onChange={setNodeColor}
                format="hex"
              />
            </Box>

            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeNodeCreation}>Batal</Button>
                <Button onClick={handleAddNode}>Tambah Node</Button>
            </Group>
        </Stack>
      </Modal>

      <Modal
        opened={nodeViewOpened}
        onClose={closeNodeView}
        title="Detail Node"
        centered
        size="md"
      >
        {selectedNodeData && (
          <Stack>
            <Badge
              color={
                selectedNodeData.type === 'H1' ? 'green' :
                selectedNodeData.type === 'H2_H4' ? 'yellow' : 'gray'
              }
              size="lg"
            >
              {selectedNodeData.type === 'H1' ? 'Judul' :
               selectedNodeData.type === 'H2_H4' ? 'Sub-Judul' : 'Paragraf'}
            </Badge>

            <Box>
              <Text fw={500} size="sm" c="dimmed">Judul:</Text>
              <Text>{selectedNodeData.title ? selectedNodeData.title.split('\n\n')[0] : selectedNodeData.label || 'Tidak ada judul'}</Text>
            </Box>

            {selectedNodeData.content && (
              <Box>
                <Text fw={500} size="sm" c="dimmed">Konten:</Text>
                <Text>{selectedNodeData.content}</Text>
              </Box>
            )}

            <Group justify="flex-end" mt="md">
                <Button variant="light" onClick={openEditNodeModal}>Edit</Button>
                <Button onClick={closeNodeView}>Tutup</Button>
            </Group>
          </Stack>
        )}
      </Modal>

      <Modal
        opened={editNodeOpened}
        onClose={closeEditNode}
        title={`Edit ${selectedNodeData?.type === 'H1' ? 'Judul' : selectedNodeData?.type === 'H2_H4' ? 'Sub-Judul' : 'Paragraf'}`}
        centered
      >
        <Stack>
            <TextInput
                label={selectedNodeData?.type === 'Paragraph' ? 'Ide Pokok / Kalimat' : 'Judul'}
                placeholder="Masukkan teks (jangan terlalu panjang)..."
                value={editNodeTitle}
                onChange={(e) => setEditNodeTitle(e.currentTarget.value)}
                required
            />
            {selectedNodeData?.type === 'H2_H4' && (
                <Textarea
                    label="Kalimat Pendukung (Opsional)"
                    placeholder="Masukkan detail kalimat (jangan terlalu panjang)..."
                    value={editNodeContent}
                    onChange={(e) => setEditNodeContent(e.currentTarget.value)}
                    autosize
                    minRows={3}
                />
            )}
            <Group justify="flex-end" mt="md">
                <Button variant="default" onClick={closeEditNode}>Batal</Button>
                <Button onClick={handleEditNode}>Simpan</Button>
            </Group>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default ConceptMap;