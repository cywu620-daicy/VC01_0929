import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Block } from '../types/volume';
import { Maximize2, RotateCcw, Eye, Layers, Ruler, Grid as GridIcon, ZoomIn, ZoomOut } from 'lucide-react';

interface Canvas3DProps {
  blocks: Block[];
  onBlockClick?: (block: Block, face: 'top' | 'front' | 'side' | 'bottom' | 'back' | 'left' | 'right', event: React.MouseEvent) => void;
  onBlockHover?: (block: Block | null) => void;
  onEmptyGridClick?: (x: number, z: number) => void;
  showDimensions?: boolean;
  dimensionValues?: { length?: number; width?: number; height?: number };
  colorMode?: 'layer' | 'single' | 'custom' | 'split';
  defaultRotX?: number;
  defaultRotY?: number;
  interactive?: boolean;
  allowLayerExplode?: boolean;
  initialExplode?: number;
  allowXRay?: boolean;
  initialXRay?: boolean;
  showLabels?: boolean;
  gridSize?: { x: number; z: number };
  maxHeight?: number;
  selectedBlockId?: string | null;
  className?: string;
  emptyText?: string;
}

// 8 vertices relative to unit cube center [-0.5, 0.5]
const UNIT_VERTICES = [
  [-0.5, -0.5, -0.5], // 0: LBB
  [ 0.5, -0.5, -0.5], // 1: RBB
  [ 0.5,  0.5, -0.5], // 2: RTB
  [-0.5,  0.5, -0.5], // 3: LTB
  [-0.5, -0.5,  0.5], // 4: LBF
  [ 0.5, -0.5,  0.5], // 5: RBF
  [ 0.5,  0.5,  0.5], // 6: RTF
  [-0.5,  0.5,  0.5], // 7: LTF
];

// 6 faces: indices into UNIT_VERTICES and outward normal vector
const FACES: Array<{
  name: 'top' | 'bottom' | 'front' | 'back' | 'right' | 'left';
  indices: number[];
  normal: [number, number, number];
  shadeFactor: number;
}> = [
  { name: 'top', indices: [3, 2, 6, 7], normal: [0, 1, 0], shadeFactor: 1.15 },
  { name: 'bottom', indices: [0, 1, 5, 4], normal: [0, -1, 0], shadeFactor: 0.5 },
  { name: 'front', indices: [4, 5, 6, 7], normal: [0, 0, 1], shadeFactor: 0.95 },
  { name: 'back', indices: [1, 0, 3, 2], normal: [0, 0, -1], shadeFactor: 0.7 },
  { name: 'right', indices: [5, 1, 2, 6], normal: [1, 0, 0], shadeFactor: 0.8 },
  { name: 'left', indices: [0, 4, 7, 3], normal: [-1, 0, 0], shadeFactor: 0.88 },
];

const LAYER_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
];

// Utility to lighten/darken hex color
function adjustColor(hex: string, factor: number): string {
  if (!hex || hex[0] !== '#') return hex;
  const num = parseInt(hex.slice(1), 16);
  if (isNaN(num)) return hex;
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.min(255, Math.max(0, Math.round(r * factor)));
  g = Math.min(255, Math.max(0, Math.round(g * factor)));
  b = Math.min(255, Math.max(0, Math.round(b * factor)));
  return `rgb(${r}, ${g}, ${b})`;
}

// Convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  if (!hex || hex[0] !== '#') return `rgba(59, 130, 246, ${alpha})`;
  const num = parseInt(hex.slice(1), 16);
  if (isNaN(num)) return `rgba(59, 130, 246, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Point-in-polygon algorithm
function isPointInPolygon(px: number, py: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

export const Canvas3D: React.FC<Canvas3DProps> = ({
  blocks,
  onBlockClick,
  onBlockHover,
  onEmptyGridClick,
  showDimensions = false,
  dimensionValues,
  colorMode = 'layer',
  defaultRotX = 35 * (Math.PI / 180),
  defaultRotY = 45 * (Math.PI / 180),
  interactive = true,
  allowLayerExplode = true,
  initialExplode = 0,
  allowXRay = true,
  initialXRay = false,
  showLabels = false,
  gridSize,
  selectedBlockId = null,
  className = '',
  emptyText = '點擊下方按鈕或在此建造積木',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });

  // Rotation angles
  const [rotX, setRotX] = useState<number>(defaultRotX);
  const [rotY, setRotY] = useState<number>(defaultRotY);
  const [zoom, setZoom] = useState<number>(1);
  const [explodeGap, setExplodeGap] = useState<number>(initialExplode);
  const [isXRay, setIsXRay] = useState<boolean>(initialXRay);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [hoveredBlock, setHoveredBlock] = useState<Block | null>(null);

  const isDraggingRef = useRef(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const clickableFacesRef = useRef<Array<{
    block: Block;
    faceName: 'top' | 'bottom' | 'front' | 'back' | 'right' | 'left';
    polygon: Array<[number, number]>;
    depth: number;
  }>>([]);
  const gridCellsRef = useRef<Array<{
    x: number;
    z: number;
    polygon: Array<[number, number]>;
  }>>([]);

  // Compute model boundaries
  const bounds = useMemo(() => {
    if (blocks.length === 0) {
      const gX = gridSize ? gridSize.x : 4;
      const gZ = gridSize ? gridSize.z : 4;
      return { minX: 0, maxX: gX - 1, minY: 0, maxY: 0, minZ: 0, maxZ: gZ - 1, sizeX: gX, sizeY: 1, sizeZ: gZ };
    }
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    blocks.forEach(b => {
      if (b.x < minX) minX = b.x;
      if (b.x > maxX) maxX = b.x;
      if (b.y < minY) minY = b.y;
      if (b.y > maxY) maxY = b.y;
      if (b.z < minZ) minZ = b.z;
      if (b.z > maxZ) maxZ = b.z;
    });

    const sizeX = Math.max(1, maxX - minX + 1);
    const sizeY = Math.max(1, maxY - minY + 1);
    const sizeZ = Math.max(1, maxZ - minZ + 1);
    return { minX, maxX, minY, maxY, minZ, maxZ, sizeX, sizeY, sizeZ };
  }, [blocks, gridSize]);

  // Center coordinate of bounding box
  const center = useMemo(() => {
    const effectiveGridX = gridSize ? gridSize.x : Math.max(bounds.sizeX, 4);
    const effectiveGridZ = gridSize ? gridSize.z : Math.max(bounds.sizeZ, 4);
    return {
      x: effectiveGridX / 2 - 0.5,
      y: (bounds.maxY - bounds.minY) / 2,
      z: effectiveGridZ / 2 - 0.5,
    };
  }, [bounds, gridSize]);

  // Main render loop
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use real-time container bounding rect for drawing dimensions so coordinates are always up-to-date
    const container = containerRef.current;
    const containerRect = container ? container.getBoundingClientRect() : null;
    const width = containerRect && containerRect.width >= 1 ? containerRect.width : (canvas.clientWidth || 400);
    const height = containerRect && containerRect.height >= 1 ? containerRect.height : (canvas.clientHeight || 300);

    if (width < 1 || height < 1) return;

    // Reset transform to identity to clear the full backing canvas buffer, then reapply DPR transform
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Dynamic base scale based on canvas size and model dimensions
    const maxDimension = Math.max(bounds.sizeX, bounds.sizeZ, (bounds.sizeY + bounds.maxY * explodeGap) * 1.2, 5);
    const baseScale = Math.min(width, height) / (maxDimension * 2.3) * zoom;

    const cosY = Math.cos(rotY);
    const sinY = Math.sin(rotY);
    const cosX = Math.cos(rotX);
    const sinX = Math.sin(rotX);

    // Transform 3D point (world space) to Screen 2D (canvas space)
    const projectPoint = (x: number, y: number, z: number): { sx: number; sy: number; depth: number } => {
      const dx = x - center.x;
      const dy = y - center.y;
      const dz = z - center.z;

      // Rotate around Y axis (horizontal)
      const x1 = dx * cosY + dz * sinY;
      const z1 = -dx * sinY + dz * cosY;
      const y1 = dy;

      // Rotate around X axis (elevation)
      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const x2 = x1;

      return {
        sx: width / 2 + x2 * baseScale,
        sy: height / 2 - y2 * baseScale,
        depth: z2,
      };
    };

    // Clear clickable regions
    clickableFacesRef.current = [];
    gridCellsRef.current = [];

    // Draw Ground Grid
    if (showGrid) {
      const gX = gridSize ? gridSize.x : Math.max(bounds.sizeX, 4);
      const gZ = gridSize ? gridSize.z : Math.max(bounds.sizeZ, 4);

      for (let gx = 0; gx < gX; gx++) {
        for (let gz = 0; gz < gZ; gz++) {
          const p1 = projectPoint(gx - 0.5, -0.5, gz - 0.5);
          const p2 = projectPoint(gx + 0.5, -0.5, gz - 0.5);
          const p3 = projectPoint(gx + 0.5, -0.5, gz + 0.5);
          const p4 = projectPoint(gx - 0.5, -0.5, gz + 0.5);

          const poly: Array<[number, number]> = [[p1.sx, p1.sy], [p2.sx, p2.sy], [p3.sx, p3.sy], [p4.sx, p4.sy]];
          gridCellsRef.current.push({ x: gx, z: gz, polygon: poly });

          ctx.beginPath();
          ctx.moveTo(p1.sx, p1.sy);
          ctx.lineTo(p2.sx, p2.sy);
          ctx.lineTo(p3.sx, p3.sy);
          ctx.lineTo(p4.sx, p4.sy);
          ctx.closePath();

          ctx.fillStyle = (gx + gz) % 2 === 0 ? 'rgba(241, 245, 249, 0.7)' : 'rgba(226, 232, 240, 0.8)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    // Prepare faces of all blocks
    interface RenderFace {
      block: Block;
      faceName: 'top' | 'bottom' | 'front' | 'back' | 'right' | 'left';
      points: Array<{ sx: number; sy: number }>;
      polygon: Array<[number, number]>;
      depth: number;
      fillColor: string;
      strokeColor: string;
      isHighlighted: boolean;
      isSelected: boolean;
      isGhost: boolean;
      centerScreen: { sx: number; sy: number };
    }

    const renderFaces: RenderFace[] = [];

    blocks.forEach(block => {
      // Calculate exploded Y position
      const effectiveY = block.y + block.y * explodeGap;

      // Base color selection
      let baseColor = block.color;
      if (!baseColor) {
        if (colorMode === 'layer') {
          baseColor = LAYER_COLORS[block.y % LAYER_COLORS.length];
        } else if (colorMode === 'split' && block.group) {
          baseColor = block.group === 'A' ? '#3b82f6' : '#ec4899';
        } else {
          baseColor = '#3b82f6';
        }
      }

      const isGhost = !!block.ghost;
      const isSelected = selectedBlockId === block.id;
      const isHighlighted = !!block.highlighted || isSelected;

      // Pre-calculate 8 world vertices for this block
      const v3d = UNIT_VERTICES.map(([vx, vy, vz]) => {
        return projectPoint(block.x + vx, effectiveY + vy, block.z + vz);
      });

      // Process each of the 6 faces
      FACES.forEach(faceDef => {
        // Face normal in world coordinates
        const [nx, ny, nz] = faceDef.normal;
        // Rotate normal to camera space
        const nx1 = nx * cosY + nz * sinY;
        const nz1 = -nx * sinY + nz * cosY;
        const ny1 = ny;
        const ny2 = ny1 * cosX - nz1 * sinX;
        const nz2 = ny1 * sinX + nz1 * cosX;
        const nx2 = nx1;

        // Back-face culling check in orthographic view: if facing away from camera and not X-Ray, skip
        if (nz2 <= 0 && !isXRay) return;

        const facePts = faceDef.indices.map(idx => v3d[idx]);
        const avgDepth = facePts.reduce((acc, p) => acc + p.depth, 0) / 4;
        const polygon: Array<[number, number]> = facePts.map(p => [p.sx, p.sy]);
        const centerSx = facePts.reduce((acc, p) => acc + p.sx, 0) / 4;
        const centerSy = facePts.reduce((acc, p) => acc + p.sy, 0) / 4;

        // Color computation
        let fill = adjustColor(baseColor, faceDef.shadeFactor);
        let stroke = adjustColor(baseColor, 0.6);

        if (isGhost) {
          fill = 'rgba(226, 232, 240, 0.25)';
          stroke = 'rgba(100, 116, 139, 0.8)';
        } else if (isXRay) {
          const alpha = isHighlighted ? 0.85 : 0.38;
          fill = hexToRgba(baseColor, alpha);
          stroke = isHighlighted ? '#f59e0b' : hexToRgba(adjustColor(baseColor, 0.4), 0.8);
        } else if (isHighlighted) {
          fill = adjustColor('#fbbf24', faceDef.shadeFactor);
          stroke = '#b45309';
        }

        renderFaces.push({
          block,
          faceName: faceDef.name,
          points: facePts,
          polygon,
          depth: avgDepth,
          fillColor: fill,
          strokeColor: stroke,
          isHighlighted,
          isSelected,
          isGhost,
          centerScreen: { sx: centerSx, sy: centerSy },
        });
      });
    });

    // Sort faces from back to front (Painter's algorithm)
    renderFaces.sort((a, b) => a.depth - b.depth);

    // Render faces
    renderFaces.forEach(f => {
      ctx.beginPath();
      ctx.moveTo(f.points[0].sx, f.points[0].sy);
      for (let i = 1; i < f.points.length; i++) {
        ctx.lineTo(f.points[i].sx, f.points[i].sy);
      }
      ctx.closePath();

      ctx.fillStyle = f.fillColor;
      ctx.fill();

      ctx.strokeStyle = f.strokeColor;
      ctx.lineWidth = f.isSelected ? 3 : f.isHighlighted ? 2.5 : 1.5;
      if (f.isGhost) {
        ctx.setLineDash([4, 3]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw label on top face or front face
      if (showLabels && f.block.label !== undefined && (f.faceName === 'top' || f.faceName === 'front')) {
        ctx.font = 'bold 12px Fredoka, sans-serif';
        ctx.fillStyle = f.isHighlighted ? '#78350f' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(f.block.label), f.centerScreen.sx, f.centerScreen.sy);
      }

      // Record clickable face
      clickableFacesRef.current.push({
        block: f.block,
        faceName: f.faceName,
        polygon: f.polygon,
        depth: f.depth,
      });
    });

    // Draw dimension measurements if enabled
    if (showDimensions && blocks.length > 0) {
      const lenVal = dimensionValues?.length ?? bounds.sizeX;
      const widVal = dimensionValues?.width ?? bounds.sizeZ;
      const heiVal = dimensionValues?.height ?? bounds.sizeY;

      // Draw dimension labels with clean background
      const drawDimLabel = (text: string, x: number, y: number, z: number, color: string) => {
        const pt = projectPoint(x, y, z);
        ctx.save();
        ctx.font = '600 13px Fredoka, "Noto Sans TC", sans-serif';
        const metrics = ctx.measureText(text);
        const padX = 8;
        const padY = 4;
        const boxW = metrics.width + padX * 2;
        const boxH = 20;

        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.roundRect(pt.sx - boxW / 2, pt.sy - boxH / 2, boxW, boxH, 6);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, pt.sx, pt.sy);
        ctx.restore();
      };

      // Length indicator (along X axis)
      const midX = (bounds.minX + bounds.maxX) / 2;
      drawDimLabel(`長 ${lenVal} cm`, midX, -0.5, bounds.maxZ + 0.8, '#2563eb');

      // Width indicator (along Z axis)
      const midZ = (bounds.minZ + bounds.maxZ) / 2;
      drawDimLabel(`寬 ${widVal} cm`, bounds.maxX + 0.8, -0.5, midZ, '#059669');

      // Height indicator (along Y axis)
      const midY = (bounds.minY + bounds.maxY) / 2;
      drawDimLabel(`高 ${heiVal} cm`, bounds.minX - 0.8, midY, bounds.minZ - 0.5, '#d97706');
    }

    // If canvas is empty
    if (blocks.length === 0) {
      ctx.save();
      ctx.font = '500 14px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#94a3b8';
      ctx.textAlign = 'center';
      ctx.fillText(emptyText, width / 2, height / 2);
      ctx.restore();
    }
  }, [
    blocks,
    bounds,
    center,
    rotX,
    rotY,
    zoom,
    explodeGap,
    isXRay,
    showGrid,
    gridSize,
    colorMode,
    selectedBlockId,
    showLabels,
    showDimensions,
    dimensionValues,
    emptyText,
  ]);

  // Handle ResizeObserver, rAF, fonts.ready, and visibilitychange
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      renderScene();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    const rafId = requestAnimationFrame(resize);
    if (typeof document !== 'undefined' && 'fonts' in document && document.fonts.ready) {
      document.fonts.ready.then(resize);
    }
    const onVisible = () => {
      if (!document.hidden) resize();
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      ro.disconnect();
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [renderScene]);

  // Pointer drag to orbit
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = true;
    lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!interactive) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - lastMousePosRef.current.x;
      const deltaY = e.clientY - lastMousePosRef.current.y;
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };

      setRotY(prev => prev + deltaX * 0.012);
      setRotX(prev => {
        const next = prev - deltaY * 0.012;
        // Clamp elevation between 5 deg and 85 deg to prevent gimbal inversion
        return Math.max(0.1, Math.min(Math.PI / 2 - 0.05, next));
      });
      return;
    }

    // Hover detection
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check clickable faces from top of stack
    let foundBlock: Block | null = null;
    const faces = clickableFacesRef.current;
    for (let i = faces.length - 1; i >= 0; i--) {
      if (isPointInPolygon(px, py, faces[i].polygon)) {
        foundBlock = faces[i].block;
        break;
      }
    }

    if (foundBlock !== hoveredBlock) {
      setHoveredBlock(foundBlock);
      onBlockHover?.(foundBlock);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!interactive) return;
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Wheel to zoom
  const handleWheel = (e: React.WheelEvent) => {
    if (!interactive) return;
    e.preventDefault();
    setZoom(prev => {
      const next = prev - e.deltaY * 0.001;
      return Math.max(0.5, Math.min(2.5, next));
    });
  };

  // Click on block or empty grid
  const handleClick = (e: React.MouseEvent) => {
    if (!interactive) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check blocks first (reverse order)
    const faces = clickableFacesRef.current;
    for (let i = faces.length - 1; i >= 0; i--) {
      if (isPointInPolygon(px, py, faces[i].polygon)) {
        onBlockClick?.(faces[i].block, faces[i].faceName, e);
        return;
      }
    }

    // Check empty ground grid
    if (onEmptyGridClick) {
      const cells = gridCellsRef.current;
      for (let i = 0; i < cells.length; i++) {
        if (isPointInPolygon(px, py, cells[i].polygon)) {
          onEmptyGridClick(cells[i].x, cells[i].z);
          return;
        }
      }
    }
  };

  const resetView = () => {
    setRotX(defaultRotX);
    setRotY(defaultRotY);
    setZoom(1);
    setExplodeGap(0);
  };

  const setViewPreset = (type: 'iso' | 'top' | 'front' | 'side') => {
    switch (type) {
      case 'iso':
        setRotX(35 * (Math.PI / 180));
        setRotY(45 * (Math.PI / 180));
        break;
      case 'top':
        setRotX(84 * (Math.PI / 180));
        setRotY(0);
        break;
      case 'front':
        setRotX(0.1);
        setRotY(0);
        break;
      case 'side':
        setRotX(0.1);
        setRotY(Math.PI / 2);
        break;
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[320px] min-w-0 bg-gradient-to-b from-amber-50/60 to-orange-50/40 rounded-2xl border border-amber-200/80 shadow-inner overflow-hidden select-none ${className}`}>
      {/* 3D Canvas */}
      <div ref={containerRef} className="absolute inset-0 min-w-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onWheel={handleWheel}
          onClick={handleClick}
        />
      </div>

      {/* Floating View Controls (Top Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 p-1 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl z-10">
        <button
          onClick={() => setZoom(z => Math.min(2.2, z + 0.15))}
          title="放大視角"
          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom(z => Math.max(0.6, z - 0.15))}
          title="縮小視角"
          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-slate-200" />
        <button
          onClick={resetView}
          title="重置視角"
          className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Camera View Angle Presets (Top Left) */}
      <div className="absolute top-3 left-3 flex items-center gap-1 p-1 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-xl text-xs font-medium z-10">
        <button
          onClick={() => setViewPreset('iso')}
          className="px-2.5 py-1 text-slate-700 hover:bg-amber-100/70 rounded-lg transition-colors font-semibold"
        >
          3D等角
        </button>
        <button
          onClick={() => setViewPreset('top')}
          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          俯視
        </button>
        <button
          onClick={() => setViewPreset('front')}
          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          正視
        </button>
        <button
          onClick={() => setViewPreset('side')}
          className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          右側
        </button>
      </div>

      {/* Feature Toggles (Bottom Bar) */}
      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-none z-10">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {allowXRay && (
            <button
              onClick={() => setIsXRay(!isXRay)}
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm backdrop-blur-md transition-all ${
                isXRay
                  ? 'bg-amber-500 text-white shadow-amber-200'
                  : 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{isXRay ? '透視眼 開' : '透視眼 關'}</span>
            </button>
          )}

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg shadow-sm backdrop-blur-md transition-all ${
              showGrid
                ? 'bg-white/90 text-slate-700 hover:bg-white border border-slate-200'
                : 'bg-slate-100 text-slate-400 border border-slate-200'
            }`}
            title="開關地板格線"
          >
            <GridIcon className="w-3.5 h-3.5" />
            <span>格線</span>
          </button>
        </div>

        {/* Layer Exploder Slider */}
        {allowLayerExplode && bounds.sizeY > 1 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-md border border-slate-200 rounded-xl shadow-sm pointer-events-auto text-xs font-medium text-slate-700">
            <Layers className="w-3.5 h-3.5 text-amber-600" />
            <span>分層抽屜展開:</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.05"
              value={explodeGap}
              onChange={e => setExplodeGap(parseFloat(e.target.value))}
              className="w-20 sm:w-28 accent-amber-500 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            />
            <span className="w-6 text-right font-mono text-[11px] text-amber-700">
              {explodeGap > 0 ? `${(explodeGap * 10).toFixed(0)}格` : '合'}
            </span>
          </div>
        )}
      </div>

      {/* Quick Helper text */}
      <div className="absolute bottom-12 left-3 text-[11px] text-slate-400 pointer-events-none hidden sm:block">
        💡 滑鼠或手指拖曳旋轉 · 滾輪縮放
      </div>
    </div>
  );
};
