import React, { useState, useMemo } from 'react';
import { Canvas3D } from '../Canvas3D';
import { Block } from '../../types/volume';
import { Hammer, Trash2, Plus, Sparkles, RotateCcw, Box, ArrowRight } from 'lucide-react';
import { playBlockAddSound, playBlockRemoveSound, playClickSound } from '../../utils/audio';

const PALETTE = [
  { name: '天藍', color: '#3b82f6' },
  { name: '翠綠', color: '#10b981' },
  { name: '陽光黃', color: '#f59e0b' },
  { name: '莓果粉', color: '#ec4899' },
  { name: '紫羅蘭', color: '#8b5cf6' },
  { name: '珊瑚橘', color: '#f97316' },
  { name: '薄荷綠', color: '#06b6d4' },
];

const PRESETS: Record<string, { name: string; blocks: Array<{ x: number; y: number; z: number; color: string }> }> = {
  heart: {
    name: '💖 愛心',
    blocks: [
      { x: 2, y: 0, z: 2, color: '#ec4899' },
      { x: 1, y: 1, z: 2, color: '#ec4899' },
      { x: 2, y: 1, z: 2, color: '#ec4899' },
      { x: 3, y: 1, z: 2, color: '#ec4899' },
      { x: 0, y: 2, z: 2, color: '#ec4899' },
      { x: 1, y: 2, z: 2, color: '#ec4899' },
      { x: 2, y: 2, z: 2, color: '#ec4899' },
      { x: 3, y: 2, z: 2, color: '#ec4899' },
      { x: 4, y: 2, z: 2, color: '#ec4899' },
      { x: 0, y: 3, z: 2, color: '#ec4899' },
      { x: 1, y: 3, z: 2, color: '#ec4899' },
      { x: 3, y: 3, z: 2, color: '#ec4899' },
      { x: 4, y: 3, z: 2, color: '#ec4899' },
    ],
  },
  puppy: {
    name: '🐕 可愛小狗',
    blocks: [
      // 4 legs
      { x: 1, y: 0, z: 1, color: '#f59e0b' },
      { x: 3, y: 0, z: 1, color: '#f59e0b' },
      { x: 1, y: 0, z: 3, color: '#f59e0b' },
      { x: 3, y: 0, z: 3, color: '#f59e0b' },
      // Body
      { x: 1, y: 1, z: 1, color: '#f59e0b' },
      { x: 2, y: 1, z: 1, color: '#f59e0b' },
      { x: 3, y: 1, z: 1, color: '#f59e0b' },
      { x: 1, y: 1, z: 2, color: '#f59e0b' },
      { x: 2, y: 1, z: 2, color: '#f59e0b' },
      { x: 3, y: 1, z: 2, color: '#f59e0b' },
      { x: 1, y: 1, z: 3, color: '#f59e0b' },
      { x: 2, y: 1, z: 3, color: '#f59e0b' },
      { x: 3, y: 1, z: 3, color: '#f59e0b' },
      // Head & Ears
      { x: 1, y: 2, z: 1, color: '#f59e0b' },
      { x: 2, y: 2, z: 1, color: '#f59e0b' },
      { x: 1, y: 3, z: 1, color: '#b45309' },
      { x: 2, y: 3, z: 1, color: '#b45309' },
      // Tail
      { x: 2, y: 2, z: 3, color: '#b45309' },
    ],
  },
  castle: {
    name: '🏰 城堡塔樓',
    blocks: [
      // Base 3x3
      { x: 1, y: 0, z: 1, color: '#3b82f6' }, { x: 2, y: 0, z: 1, color: '#3b82f6' }, { x: 3, y: 0, z: 1, color: '#3b82f6' },
      { x: 1, y: 0, z: 2, color: '#3b82f6' }, { x: 2, y: 0, z: 2, color: '#3b82f6' }, { x: 3, y: 0, z: 2, color: '#3b82f6' },
      { x: 1, y: 0, z: 3, color: '#3b82f6' }, { x: 2, y: 0, z: 3, color: '#3b82f6' }, { x: 3, y: 0, z: 3, color: '#3b82f6' },
      // Layer 1
      { x: 1, y: 1, z: 1, color: '#60a5fa' }, { x: 3, y: 1, z: 1, color: '#60a5fa' },
      { x: 2, y: 1, z: 2, color: '#60a5fa' },
      { x: 1, y: 1, z: 3, color: '#60a5fa' }, { x: 3, y: 1, z: 3, color: '#60a5fa' },
      // Battlements
      { x: 1, y: 2, z: 1, color: '#93c5fd' },
      { x: 3, y: 2, z: 1, color: '#93c5fd' },
      { x: 1, y: 2, z: 3, color: '#93c5fd' },
      { x: 3, y: 2, z: 3, color: '#93c5fd' },
    ],
  },
  robot: {
    name: '🤖 體積機器人',
    blocks: [
      // Feet
      { x: 1, y: 0, z: 2, color: '#475569' },
      { x: 3, y: 0, z: 2, color: '#475569' },
      // Legs
      { x: 1, y: 1, z: 2, color: '#64748b' },
      { x: 3, y: 1, z: 2, color: '#64748b' },
      // Torso 3x2x1
      { x: 1, y: 2, z: 2, color: '#06b6d4' },
      { x: 2, y: 2, z: 2, color: '#06b6d4' },
      { x: 3, y: 2, z: 2, color: '#06b6d4' },
      { x: 1, y: 3, z: 2, color: '#06b6d4' },
      { x: 2, y: 3, z: 2, color: '#06b6d4' },
      { x: 3, y: 3, z: 2, color: '#06b6d4' },
      // Arms
      { x: 0, y: 3, z: 2, color: '#38bdf8' },
      { x: 4, y: 3, z: 2, color: '#38bdf8' },
      // Head
      { x: 2, y: 4, z: 2, color: '#f59e0b' },
    ],
  },
};

interface FreeBuilderProps {
  onGoNext: () => void;
}

export const FreeBuilder: React.FC<FreeBuilderProps> = ({ onGoNext }) => {
  const [blocks, setBlocks] = useState<Block[]>([
    { id: 'init-0', x: 2, y: 0, z: 2, color: '#3b82f6' },
    { id: 'init-1', x: 2, y: 1, z: 2, color: '#10b981' },
    { id: 'init-2', x: 3, y: 0, z: 2, color: '#3b82f6' },
  ]);
  const [selectedColor, setSelectedColor] = useState<string>('#3b82f6');
  const [toolMode, setToolMode] = useState<'build' | 'delete'>('build');

  // Handle clicking on empty grid
  const handleEmptyGridClick = (gx: number, gz: number) => {
    if (toolMode === 'delete') return;
    const exists = blocks.some(b => b.x === gx && b.y === 0 && b.z === gz);
    if (!exists) {
      playBlockAddSound();
      const newBlock: Block = {
        id: `blk-${Date.now()}-${Math.random()}`,
        x: gx,
        y: 0,
        z: gz,
        color: selectedColor,
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  };

  // Handle clicking on existing block
  const handleBlockClick = (block: Block, faceName: string) => {
    if (toolMode === 'delete') {
      playBlockRemoveSound();
      setBlocks(prev => prev.filter(b => b.id !== block.id));
      return;
    }

    // Add block on clicked face
    let newX = block.x;
    let newY = block.y;
    let newZ = block.z;

    switch (faceName) {
      case 'top':
        newY += 1;
        break;
      case 'bottom':
        newY -= 1;
        break;
      case 'front':
        newZ += 1;
        break;
      case 'back':
        newZ -= 1;
        break;
      case 'right':
        newX += 1;
        break;
      case 'left':
        newX -= 1;
        break;
      default:
        newY += 1;
    }

    // Check bounds
    if (newX < 0 || newX > 6 || newZ < 0 || newZ > 6 || newY < 0 || newY > 6) return;

    // Check collision
    const collision = blocks.some(b => b.x === newX && b.y === newY && b.z === newZ);
    if (!collision) {
      playBlockAddSound();
      const newBlock: Block = {
        id: `blk-${Date.now()}-${Math.random()}`,
        x: newX,
        y: newY,
        z: newZ,
        color: selectedColor,
      };
      setBlocks(prev => [...prev, newBlock]);
    }
  };

  // Layer statistics
  const layerStats = useMemo(() => {
    const stats: Record<number, number> = {};
    blocks.forEach(b => {
      stats[b.y] = (stats[b.y] || 0) + 1;
    });
    return stats;
  }, [blocks]);

  // Load preset
  const loadPreset = (key: keyof typeof PRESETS) => {
    playBlockAddSound();
    const preset = PRESETS[key];
    const newBlocks: Block[] = preset.blocks.map((item, idx) => ({
      id: `preset-${key}-${idx}`,
      x: item.x,
      y: item.y,
      z: item.z,
      color: item.color,
    }));
    setBlocks(newBlocks);
  };

  const clearAll = () => {
    playBlockRemoveSound();
    setBlocks([]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              單元五 · 自由創作與實作
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">國小四年級建築師</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            小小建築師：自由建造實驗室
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            點擊地板或積木表面即可堆疊，隨時觀察你親手蓋出的城堡有幾立方公分！
          </p>
        </div>

        {/* Total Volume Badge */}
        <div className="px-5 py-3 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-200 flex items-center gap-3 shrink-0">
          <Box className="w-8 h-8" />
          <div>
            <div className="text-xs text-amber-100 font-medium">作品總體積</div>
            <div className="text-2xl font-black">{blocks.length} cm³</div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Canvas */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setToolMode('build');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  toolMode === 'build'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>建造模式 (放置)</span>
              </button>
              <button
                onClick={() => {
                  playClickSound();
                  setToolMode('delete');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  toolMode === 'delete'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Trash2 className="w-4 h-4" />
                <span>敲碎模式 (刪除)</span>
              </button>
            </div>

            <button
              onClick={clearAll}
              className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              清空全部
            </button>
          </div>

          <div className="w-full h-[380px] sm:h-[420px] min-w-0">
            <Canvas3D
              blocks={blocks}
              onBlockClick={handleBlockClick}
              onEmptyGridClick={handleEmptyGridClick}
              gridSize={{ x: 6, z: 6 }}
              colorMode="custom"
              allowLayerExplode={true}
              emptyText="點擊地板格線放第一顆積木！"
            />
          </div>

          {/* Layer Breakdown Bar */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-slate-700">各樓層積木統計：</span>
            <div className="flex flex-wrap items-center gap-2">
              {Object.keys(layerStats).length === 0 ? (
                <span className="text-slate-400">尚未放置積木</span>
              ) : (
                Object.entries(layerStats)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([layer, count]) => (
                    <span
                      key={layer}
                      className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-700 font-semibold"
                    >
                      第 {Number(layer) + 1} 層：<span className="text-amber-600 font-bold">{count}</span> 個
                    </span>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Right: Colors, Presets & Controls */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-5">
            {/* Color Palette */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-2.5">
                選擇積木顏色
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {PALETTE.map(item => (
                  <button
                    key={item.color}
                    onClick={() => {
                      playClickSound();
                      setSelectedColor(item.color);
                      setToolMode('build');
                    }}
                    style={{ backgroundColor: item.color }}
                    className={`w-8 h-8 rounded-xl shadow-xs transition-transform cursor-pointer ${
                      selectedColor === item.color && toolMode === 'build'
                        ? 'ring-3 ring-amber-400 scale-110'
                        : 'hover:scale-105'
                    }`}
                    title={item.name}
                  />
                ))}
              </div>
            </div>

            {/* Presets */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-2.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>一鍵載入經典作品</span>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(PRESETS).map(([key, item]) => (
                  <button
                    key={key}
                    onClick={() => loadPreset(key)}
                    className="p-3 bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 rounded-2xl text-left transition-all cursor-pointer group"
                  >
                    <span className="font-bold text-xs sm:text-sm text-slate-800 group-hover:text-amber-700 block">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      體積：{item.blocks.length} cm³
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tips */}
            <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-slate-700 space-y-1.5">
              <p className="font-bold text-amber-900">💡 操作小密技：</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>點擊地板網格：在地面放小積木。</li>
                <li>點擊積木的上方或側面：往外或往上堆疊。</li>
                <li>切換「敲碎模式」：點擊不需要的積木即可移除。</li>
              </ul>
            </div>
          </div>

          {/* Next Button */}
          <button
            onClick={() => {
              playClickSound();
              onGoNext();
            }}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
          >
            <span>前往單元六：冒險闖關大挑戰！</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
