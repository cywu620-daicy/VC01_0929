// 3D Canvas Engine using 2D Canvas Projection & Painter's Algorithm

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

const FACES = [
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

function adjustColor(hex, factor) {
  if (!hex || hex[0] !== '#') return hex || '#3b82f6';
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

function hexToRgba(hex, alpha) {
  if (!hex || hex[0] !== '#') return `rgba(59, 130, 246, ${alpha})`;
  const num = parseInt(hex.slice(1), 16);
  if (isNaN(num)) return `rgba(59, 130, 246, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function isPointInPolygon(px, py, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

class BlockRenderer3D {
  constructor(containerEl, options = {}) {
    this.container = containerEl;
    this.canvas = containerEl.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');

    this.blocks = options.blocks || [];
    this.showDimensions = options.showDimensions || false;
    this.dimensionValues = options.dimensionValues || null;
    this.colorMode = options.colorMode || 'layer';
    this.showLabels = options.showLabels || false;
    this.gridSize = options.gridSize || { x: 5, z: 5 };
    this.allowLayerExplode = options.allowLayerExplode !== false;
    this.allowXRay = options.allowXRay !== false;
    this.emptyText = options.emptyText || '在此建造積木';

    this.rotX = options.defaultRotX !== undefined ? options.defaultRotX : 35 * (Math.PI / 180);
    this.rotY = options.defaultRotY !== undefined ? options.defaultRotY : 45 * (Math.PI / 180);
    this.defaultRotX = this.rotX;
    this.defaultRotY = this.rotY;

    this.zoom = 1;
    this.explodeGap = 0;
    this.isXRay = !!options.initialXRay;
    this.showGrid = true;

    this.isDragging = false;
    this.lastPos = { x: 0, y: 0 };
    this.clickableFaces = [];
    this.gridCells = [];

    this.onBlockClick = options.onBlockClick || null;
    this.onEmptyGridClick = options.onEmptyGridClick || null;

    this.initEvents();
  }

  setBlocks(blocks) {
    this.blocks = blocks;
    this.draw();
  }

  setOptions(newOpts) {
    if (newOpts.blocks !== undefined) this.blocks = newOpts.blocks;
    if (newOpts.showDimensions !== undefined) this.showDimensions = newOpts.showDimensions;
    if (newOpts.dimensionValues !== undefined) this.dimensionValues = newOpts.dimensionValues;
    if (newOpts.colorMode !== undefined) this.colorMode = newOpts.colorMode;
    if (newOpts.showLabels !== undefined) this.showLabels = newOpts.showLabels;
    if (newOpts.gridSize !== undefined) this.gridSize = newOpts.gridSize;
    if (newOpts.isXRay !== undefined) this.isXRay = newOpts.isXRay;
    if (newOpts.explodeGap !== undefined) this.explodeGap = newOpts.explodeGap;
    this.draw();
  }

  initEvents() {
    // ResizeObserver on the container element
    this.resize = () => {
      const rect = this.container.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.round(rect.width * dpr);
      this.canvas.height = Math.round(rect.height * dpr);
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
      if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.draw();
    };

    this.ro = new ResizeObserver(this.resize);
    this.ro.observe(this.container);

    this.resize();
    requestAnimationFrame(this.resize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(this.resize);
    }
    this.onVisible = () => { if (!document.hidden) this.resize(); };
    document.addEventListener('visibilitychange', this.onVisible);

    // Pointer Drag Rotation
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.lastPos = { x: e.clientX, y: e.clientY };
      try { this.canvas.setPointerCapture(e.pointerId); } catch(err) {}
    });

    this.canvas.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const dx = e.clientX - this.lastPos.x;
      const dy = e.clientY - this.lastPos.y;
      this.lastPos = { x: e.clientX, y: e.clientY };

      this.rotY += dx * 0.012;
      const nextX = this.rotX - dy * 0.012;
      this.rotX = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, nextX));
      this.draw();
    });

    const stopDrag = (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        try { this.canvas.releasePointerCapture(e.pointerId); } catch(err) {}
      }
    };
    this.canvas.addEventListener('pointerup', stopDrag);
    this.canvas.addEventListener('pointercancel', stopDrag);

    // Wheel Zoom
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoom = Math.max(0.6, Math.min(2.3, this.zoom - e.deltaY * 0.001));
      this.draw();
    }, { passive: false });

    // Click on block or ground grid
    this.canvas.addEventListener('click', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;

      // Check blocks in reverse depth order
      for (let i = this.clickableFaces.length - 1; i >= 0; i--) {
        if (isPointInPolygon(px, py, this.clickableFaces[i].polygon)) {
          if (this.onBlockClick) {
            this.onBlockClick(this.clickableFaces[i].block, this.clickableFaces[i].faceName, e);
          }
          return;
        }
      }

      // Check empty grid
      if (this.onEmptyGridClick) {
        for (let i = 0; i < this.gridCells.length; i++) {
          if (isPointInPolygon(px, py, this.gridCells[i].polygon)) {
            this.onEmptyGridClick(this.gridCells[i].x, this.gridCells[i].z);
            return;
          }
        }
      }
    });
  }

  draw() {
    if (!this.ctx || !this.canvas) return;
    const rect = this.container.getBoundingClientRect();
    const width = rect.width >= 1 ? rect.width : (this.canvas.clientWidth || 400);
    const height = rect.height >= 1 ? rect.height : (this.canvas.clientHeight || 340);
    if (width < 1 || height < 1) return;

    const dpr = window.devicePixelRatio || 1;
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Compute model bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    if (this.blocks.length === 0) {
      const gX = this.gridSize ? this.gridSize.x : 4;
      const gZ = this.gridSize ? this.gridSize.z : 4;
      minX = 0; maxX = gX - 1; minY = 0; maxY = 0; minZ = 0; maxZ = gZ - 1;
    } else {
      this.blocks.forEach(b => {
        if (b.x < minX) minX = b.x;
        if (b.x > maxX) maxX = b.x;
        if (b.y < minY) minY = b.y;
        if (b.y > maxY) maxY = b.y;
        if (b.z < minZ) minZ = b.z;
        if (b.z > maxZ) maxZ = b.z;
      });
    }

    const sizeX = Math.max(1, maxX - minX + 1);
    const sizeY = Math.max(1, maxY - minY + 1);
    const sizeZ = Math.max(1, maxZ - minZ + 1);

    const effGridX = this.gridSize ? this.gridSize.x : Math.max(sizeX, 4);
    const effGridZ = this.gridSize ? this.gridSize.z : Math.max(sizeZ, 4);
    const centerX = effGridX / 2 - 0.5;
    const centerY = (maxY - minY) / 2;
    const centerZ = effGridZ / 2 - 0.5;

    const maxDim = Math.max(sizeX, sizeZ, (sizeY + maxY * this.explodeGap) * 1.2, 5);
    const baseScale = Math.min(width, height) / (maxDim * 2.3) * this.zoom;

    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    const projectPoint = (x, y, z) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const dz = z - centerZ;

      const x1 = dx * cosY + dz * sinY;
      const z1 = -dx * sinY + dz * cosY;
      const y1 = dy;

      const y2 = y1 * cosX - z1 * sinX;
      const z2 = y1 * sinX + z1 * cosX;
      const x2 = x1;

      return {
        sx: width / 2 + x2 * baseScale,
        sy: height / 2 - y2 * baseScale,
        depth: z2
      };
    };

    this.clickableFaces = [];
    this.gridCells = [];

    // Ground Grid
    if (this.showGrid) {
      for (let gx = 0; gx < effGridX; gx++) {
        for (let gz = 0; gz < effGridZ; gz++) {
          const p1 = projectPoint(gx - 0.5, -0.5, gz - 0.5);
          const p2 = projectPoint(gx + 0.5, -0.5, gz - 0.5);
          const p3 = projectPoint(gx + 0.5, -0.5, gz + 0.5);
          const p4 = projectPoint(gx - 0.5, -0.5, gz + 0.5);

          this.gridCells.push({ x: gx, z: gz, polygon: [[p1.sx, p1.sy], [p2.sx, p2.sy], [p3.sx, p3.sy], [p4.sx, p4.sy]] });

          this.ctx.beginPath();
          this.ctx.moveTo(p1.sx, p1.sy);
          this.ctx.lineTo(p2.sx, p2.sy);
          this.ctx.lineTo(p3.sx, p3.sy);
          this.ctx.lineTo(p4.sx, p4.sy);
          this.ctx.closePath();
          this.ctx.fillStyle = (gx + gz) % 2 === 0 ? 'rgba(241, 245, 249, 0.75)' : 'rgba(226, 232, 240, 0.85)';
          this.ctx.fill();
          this.ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      }
    }

    // Prepare faces
    const renderFaces = [];
    this.blocks.forEach(block => {
      const effectiveY = block.y + block.y * this.explodeGap;

      let baseColor = block.color;
      if (!baseColor) {
        if (this.colorMode === 'layer') {
          baseColor = LAYER_COLORS[block.y % LAYER_COLORS.length];
        } else if (this.colorMode === 'split' && block.group) {
          baseColor = block.group === 'A' ? '#3b82f6' : '#ec4899';
        } else {
          baseColor = '#3b82f6';
        }
      }

      const isGhost = !!block.ghost;
      const isHighlighted = !!block.highlighted;

      const v3d = UNIT_VERTICES.map(([vx, vy, vz]) => {
        return projectPoint(block.x + vx, effectiveY + vy, block.z + vz);
      });

      FACES.forEach(faceDef => {
        const [nx, ny, nz] = faceDef.normal;
        const nx1 = nx * cosY + nz * sinY;
        const nz1 = -nx * sinY + nz * cosY;
        const ny1 = ny;
        const ny2 = ny1 * cosX - nz1 * sinX;
        const nz2 = ny1 * sinX + nz1 * cosX;

        // Back-face culling if not X-Ray
        if (nz2 <= 0 && !this.isXRay) return;

        const facePts = faceDef.indices.map(idx => v3d[idx]);
        const avgDepth = facePts.reduce((acc, p) => acc + p.depth, 0) / 4;
        const polygon = facePts.map(p => [p.sx, p.sy]);
        const centerSx = facePts.reduce((acc, p) => acc + p.sx, 0) / 4;
        const centerSy = facePts.reduce((acc, p) => acc + p.sy, 0) / 4;

        let fill = adjustColor(baseColor, faceDef.shadeFactor);
        let stroke = adjustColor(baseColor, 0.6);

        if (isGhost) {
          fill = 'rgba(226, 232, 240, 0.25)';
          stroke = 'rgba(100, 116, 139, 0.8)';
        } else if (this.isXRay) {
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
          isGhost,
          centerScreen: { sx: centerSx, sy: centerSy }
        });
      });
    });

    renderFaces.sort((a, b) => a.depth - b.depth);

    renderFaces.forEach(f => {
      this.ctx.beginPath();
      this.ctx.moveTo(f.points[0].sx, f.points[0].sy);
      for (let i = 1; i < f.points.length; i++) {
        this.ctx.lineTo(f.points[i].sx, f.points[i].sy);
      }
      this.ctx.closePath();

      this.ctx.fillStyle = f.fillColor;
      this.ctx.fill();

      this.ctx.strokeStyle = f.strokeColor;
      this.ctx.lineWidth = f.isHighlighted ? 2.5 : 1.5;
      if (f.isGhost) this.ctx.setLineDash([4, 3]);
      else this.ctx.setLineDash([]);
      this.ctx.stroke();
      this.ctx.setLineDash([]);

      if (this.showLabels && f.block.label !== undefined && (f.faceName === 'top' || f.faceName === 'front')) {
        this.ctx.font = 'bold 12px "Noto Sans TC", sans-serif';
        this.ctx.fillStyle = f.isHighlighted ? '#78350f' : '#ffffff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(String(f.block.label), f.centerScreen.sx, f.centerScreen.sy);
      }

      this.clickableFaces.push({
        block: f.block,
        faceName: f.faceName,
        polygon: f.polygon,
        depth: f.depth
      });
    });

    // Dimensions labels
    if (this.showDimensions && this.blocks.length > 0) {
      const lenVal = this.dimensionValues?.length ?? sizeX;
      const widVal = this.dimensionValues?.width ?? sizeZ;
      const heiVal = this.dimensionValues?.height ?? sizeY;

      const drawDim = (text, x, y, z, color) => {
        const pt = projectPoint(x, y, z);
        this.ctx.save();
        this.ctx.font = '700 13px "Noto Sans TC", sans-serif';
        const metrics = this.ctx.measureText(text);
        const boxW = metrics.width + 16;
        const boxH = 22;

        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        if (this.ctx.roundRect) {
          this.ctx.roundRect(pt.sx - boxW / 2, pt.sy - boxH / 2, boxW, boxH, 6);
        } else {
          this.ctx.rect(pt.sx - boxW / 2, pt.sy - boxH / 2, boxW, boxH);
        }
        this.ctx.fill();
        this.ctx.stroke();

        this.ctx.fillStyle = color;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(text, pt.sx, pt.sy);
        this.ctx.restore();
      };

      const midX = (minX + maxX) / 2;
      drawDim(`長 ${lenVal} cm`, midX, -0.5, maxZ + 0.8, '#2563eb');
      const midZ = (minZ + maxZ) / 2;
      drawDim(`寬 ${widVal} cm`, maxX + 0.8, -0.5, midZ, '#059669');
      const midY = (minY + maxY) / 2;
      drawDim(`高 ${heiVal} cm`, minX - 0.8, midY, minZ - 0.5, '#d97706');
    }

    if (this.blocks.length === 0) {
      this.ctx.save();
      this.ctx.font = '500 14px "Noto Sans TC", sans-serif';
      this.ctx.fillStyle = '#94a3b8';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(this.emptyText, width / 2, height / 2);
      this.ctx.restore();
    }
  }

  setPreset(type) {
    switch (type) {
      case 'iso':
        this.rotX = 35 * (Math.PI / 180);
        this.rotY = 45 * (Math.PI / 180);
        break;
      case 'top':
        this.rotX = 84 * (Math.PI / 180);
        this.rotY = 0;
        break;
      case 'front':
        this.rotX = 0.1;
        this.rotY = 0;
        break;
      case 'side':
        this.rotX = 0.1;
        this.rotY = Math.PI / 2;
        break;
    }
    this.draw();
  }

  resetView() {
    this.rotX = this.defaultRotX;
    this.rotY = this.defaultRotY;
    this.zoom = 1;
    this.explodeGap = 0;
    this.draw();
  }
}
