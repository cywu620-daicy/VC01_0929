import React, { useState } from 'react';
import { Canvas3D } from '../Canvas3D';
import { Block } from '../../types/volume';
import { Volume2, Sparkles, Box, CheckCircle2, ArrowRight } from 'lucide-react';
import { speakText, isCurrentlySpeaking, stopSpeaking } from '../../utils/speech';
import { playClickSound, playBlockAddSound } from '../../utils/audio';

interface ConceptIntroProps {
  onGoNext: () => void;
}

export const ConceptIntro: React.FC<ConceptIntroProps> = ({ onGoNext }) => {
  const [selectedShape, setSelectedShape] = useState<'single' | 'line' | 'flat' | 'box' | 'stairs'>('single');
  const [isReading, setIsReading] = useState(false);

  // Generate blocks based on selected shape
  const getBlocks = (): Block[] => {
    const list: Block[] = [];
    if (selectedShape === 'single') {
      list.push({ id: 'b-0', x: 0, y: 0, z: 0, color: '#3b82f6', label: '1' });
    } else if (selectedShape === 'line') {
      // 12 blocks in 1 straight line
      for (let i = 0; i < 12; i++) {
        list.push({ id: `b-${i}`, x: i, y: 0, z: 0, color: '#3b82f6', label: i + 1 });
      }
    } else if (selectedShape === 'flat') {
      // 4 x 3 flat rectangle (12 blocks)
      let count = 1;
      for (let x = 0; x < 4; x++) {
        for (let z = 0; z < 3; z++) {
          list.push({ id: `b-${x}-${z}`, x, y: 0, z, color: '#10b981', label: count++ });
        }
      }
    } else if (selectedShape === 'box') {
      // 3 x 2 x 2 rectangular block (12 blocks)
      let count = 1;
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 3; x++) {
          for (let z = 0; z < 2; z++) {
            list.push({ id: `b-${x}-${y}-${z}`, x, y, z, color: y === 0 ? '#3b82f6' : '#f59e0b', label: count++ });
          }
        }
      }
    } else if (selectedShape === 'stairs') {
      // Stair shape with 12 blocks: layer 0: 3x2=6, layer 1: 2x2=4, layer 2: 1x2=2 => 12 blocks!
      let count = 1;
      // Step 1: x=0..2, z=0..1, y=0 (6 blocks)
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 2; z++) {
          list.push({ id: `b-0-${x}-${z}`, x, y: 0, z, color: '#ec4899', label: count++ });
        }
      }
      // Step 2: x=0..1, z=0..1, y=1 (4 blocks)
      for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
          list.push({ id: `b-1-${x}-${z}`, x, y: 1, z, color: '#8b5cf6', label: count++ });
        }
      }
      // Step 3: x=0, z=0..1, y=2 (2 blocks)
      for (let z = 0; z < 2; z++) {
        list.push({ id: `b-2-0-${z}`, x: 0, y: 2, z, color: '#f59e0b', label: count++ });
      }
    }
    return list;
  };

  const blocks = getBlocks();
  const volumeValue = blocks.length;

  const handleRead = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      const text = selectedShape === 'single'
        ? '長1公分、寬1公分、高1公分的正方體，它所佔有的空間大小就是1立方公分。我們用立方公分作為測量體積的標準單位。'
        : `看！這四種形體雖然外觀完全不一樣，但它們全部都是由12個1立方公分的小積木組合而成的。所以它們的體積都是12立方公分！這告訴我們：形狀改變，體積不會改變！`;
      speakText(text, () => setIsReading(false));
    }
  };

  const selectPreset = (shape: typeof selectedShape) => {
    playBlockAddSound();
    setSelectedShape(shape);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Introduction Banner */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              單元一 · 基礎核心概念
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">國小四年級數學</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            什麼是體積？認識 1 立方公分（1 cm³）
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            物體在空間中佔據的大小，就稱為「<span className="font-bold text-amber-700">體積</span>」。
            邊長為 1 公分的正方體，體積就是 <span className="font-bold text-amber-700">1 立方公分</span>。
          </p>
        </div>

        <button
          onClick={handleRead}
          className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all cursor-pointer ${
            isReading
              ? 'bg-amber-600 text-white animate-pulse'
              : 'bg-amber-100 hover:bg-amber-200 text-amber-900'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>{isReading ? '正在朗讀中...' : '小老師語音導讀'}</span>
        </button>
      </div>

      {/* Main Interactive Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Visualization Canvas */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Box className="w-4 h-4 text-amber-500" />
              <span>3D 實體觀察區</span>
            </div>
            <div className="text-xs text-slate-500 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 font-medium">
              積木數量：<span className="font-bold text-amber-600 text-sm">{volumeValue}</span> 個
            </div>
          </div>

          <div className="w-full h-[360px] sm:h-[400px] min-w-0">
            <Canvas3D
              blocks={blocks}
              showDimensions={selectedShape === 'single'}
              dimensionValues={{ length: 1, width: 1, height: 1 }}
              showLabels={selectedShape !== 'line'}
              colorMode="layer"
              gridSize={{ x: selectedShape === 'line' ? 14 : 6, z: 6 }}
            />
          </div>

          {/* Volume Result Card */}
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">這個形體的體積是：</p>
              <p className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
                {volumeValue} <span className="text-sm font-bold text-slate-600">立方公分（cm³）</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 block">算式原理</span>
              <span className="text-xs font-mono font-bold text-amber-800 bg-white px-2 py-1 rounded-lg border border-amber-200 inline-block">
                1 cm³ × {volumeValue} 個 = {volumeValue} cm³
              </span>
            </div>
          </div>
        </div>

        {/* Right: Shape selector and Conservation Comparison */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <h3 className="font-bold text-slate-800 text-lg">切換不同形體觀察</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600">
              點擊下列按鈕，看看相同的「12塊積木」能變出哪些形狀：
            </p>

            <div className="space-y-2">
              <button
                onClick={() => selectPreset('single')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedShape === 'single'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">認識 1 個基準方塊</h4>
                    <p className="text-xs text-slate-500">1cm × 1cm × 1cm = 1 立方公分</p>
                  </div>
                </div>
                {selectedShape === 'single' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
              </button>

              <button
                onClick={() => selectPreset('line')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedShape === 'line'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-xs">
                    12
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">形狀 A：排成一直線長條</h4>
                    <p className="text-xs text-slate-500">12 塊排成一長排 (12 × 1 × 1)</p>
                  </div>
                </div>
                {selectedShape === 'line' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
              </button>

              <button
                onClick={() => selectPreset('flat')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedShape === 'flat'
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-xs">
                    12
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">形狀 B：排成一片扁平長方體</h4>
                    <p className="text-xs text-slate-500">長 4、寬 3、高 1 (4 × 3 × 1)</p>
                  </div>
                </div>
                {selectedShape === 'flat' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </button>

              <button
                onClick={() => selectPreset('box')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedShape === 'box'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-xs">
                    12
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">形狀 C：堆成雙層長方體</h4>
                    <p className="text-xs text-slate-500">每層 6 個，堆 2 層 (3 × 2 × 2)</p>
                  </div>
                </div>
                {selectedShape === 'box' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
              </button>

              <button
                onClick={() => selectPreset('stairs')}
                className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  selectedShape === 'stairs'
                    ? 'border-purple-500 bg-purple-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-xs">
                    12
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">形狀 D：堆成三層階梯</h4>
                    <p className="text-xs text-slate-500">第1層6個 + 第2層4個 + 第3層2個</p>
                  </div>
                </div>
                {selectedShape === 'stairs' && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
              </button>
            </div>

            {/* Core Learning Point Card */}
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs sm:text-sm text-sky-900 leading-relaxed">
              💡 <span className="font-bold">超級重要觀念（體積守恆）：</span>
              <br />
              形狀雖然完全變了，但只要小積木沒有增加也沒有減少，它們的體積就<span className="font-bold text-sky-700">完全一樣大</span>！
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
            <span>前往單元二：長寬高魔法公式</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
