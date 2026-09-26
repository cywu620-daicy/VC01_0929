import React, { useState, useMemo } from 'react';
import { Canvas3D } from '../Canvas3D';
import { Block } from '../../types/volume';
import { Volume2, Layers, ArrowRight, RotateCcw, Check, Sparkles } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speech';
import { playClickSound, playBlockAddSound } from '../../utils/audio';

interface FormulaExplorerProps {
  onGoNext: () => void;
}

export const FormulaExplorer: React.FC<FormulaExplorerProps> = ({ onGoNext }) => {
  const [length, setLength] = useState<number>(4);
  const [width, setWidth] = useState<number>(3);
  const [height, setHeight] = useState<number>(2);
  const [isCubeMode, setIsCubeMode] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(3);
  const [isReading, setIsReading] = useState<boolean>(false);

  // When cube mode is on, keep all 3 dimensions equal
  const handleCubeChange = (val: number) => {
    playBlockAddSound();
    setLength(val);
    setWidth(val);
    setHeight(val);
  };

  const handleDimensionChange = (type: 'len' | 'wid' | 'hei', val: number) => {
    playBlockAddSound();
    if (isCubeMode) {
      setLength(val);
      setWidth(val);
      setHeight(val);
    } else {
      if (type === 'len') setLength(val);
      if (type === 'wid') setWidth(val);
      if (type === 'hei') setHeight(val);
    }
  };

  // Generate blocks
  const blocks = useMemo(() => {
    const list: Block[] = [];
    let count = 1;
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < width; z++) {
        for (let x = 0; x < length; x++) {
          let isHighlighted = false;
          if (activeStep === 1) {
            // Highlight just row 1 on ground (y=0, z=0)
            isHighlighted = (y === 0 && z === 0);
          } else if (activeStep === 2) {
            // Highlight entire bottom layer (y=0)
            isHighlighted = (y === 0);
          } else {
            // All active
            isHighlighted = false;
          }

          list.push({
            id: `b-${x}-${y}-${z}`,
            x,
            y,
            z,
            label: count++,
            highlighted: isHighlighted,
          });
        }
      }
    }
    return list;
  }, [length, width, height, activeStep]);

  const totalVolume = length * width * height;
  const baseArea = length * width;

  const handleRead = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      const formulaText = isCubeMode
        ? `正方體的體積公式是：邊長乘以邊長乘以邊長。邊長是${length}公分，所以體積是：${length}乘${length}乘${length}，等於${totalVolume}立方公分！`
        : `長方體的體積公式是：長乘以寬乘以高。底層每排有${length}個，有${width}排，所以一層有${baseArea}個。一共堆了${height}層，體積就是：${length}乘${width}乘${height}，等於${totalVolume}立方公分！`;
      speakText(formulaText, () => setIsReading(false));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Introduction Header */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              單元二 · 核心公式
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">國小四年級數學</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            長方體與正方體體積公式
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            不用一顆一顆辛苦數！透過「<span className="font-bold text-amber-700">長 × 寬 × 高</span>」，秒算積木總個數與體積。
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
          <span>{isReading ? '正在解說...' : '語音聽解說'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Visualization */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Layers className="w-4 h-4 text-amber-500" />
              <span>3D 長寬高實體透視</span>
            </div>
            {/* Step navigation */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => { playClickSound(); setActiveStep(1); }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  activeStep === 1 ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                步驟1：數長度
              </button>
              <button
                onClick={() => { playClickSound(); setActiveStep(2); }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  activeStep === 2 ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                步驟2：數一層
              </button>
              <button
                onClick={() => { playClickSound(); setActiveStep(3); }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  activeStep === 3 ? 'bg-amber-500 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                步驟3：乘層數
              </button>
            </div>
          </div>

          <div className="w-full h-[360px] sm:h-[400px] min-w-0">
            <Canvas3D
              blocks={blocks}
              showDimensions={true}
              dimensionValues={{ length, width, height }}
              colorMode="layer"
              gridSize={{ x: Math.max(6, length + 2), z: Math.max(6, width + 2) }}
            />
          </div>

          {/* Interactive Formula Calculation Display */}
          <div className="mt-4 p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <span className="text-xs font-bold text-amber-800 uppercase">
                {isCubeMode ? '正方體體積算式' : '長方體體積算式'}
              </span>
              <span className="text-xs text-slate-500">
                每層有 {baseArea} 塊 × 堆了 {height} 層
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-lg sm:text-2xl font-black text-slate-800">
              <span className="text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
                {length} <span className="text-xs font-semibold text-blue-500 block">長 (cm)</span>
              </span>
              <span className="text-slate-400">×</span>
              <span className="text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {width} <span className="text-xs font-semibold text-emerald-500 block">寬 (cm)</span>
              </span>
              <span className="text-slate-400">×</span>
              <span className="text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {height} <span className="text-xs font-semibold text-amber-500 block">高 (cm)</span>
              </span>
              <span className="text-slate-400">=</span>
              <span className="text-orange-600 bg-white px-4 py-1 rounded-xl border-2 border-orange-400 shadow-sm">
                {totalVolume} <span className="text-xs font-semibold text-slate-500 block">cm³（立方公分）</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Sliders & Controls */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>調整長寬高滑桿</span>
              </h3>
              {/* Mode switch */}
              <button
                onClick={() => {
                  playClickSound();
                  setIsCubeMode(!isCubeMode);
                  if (!isCubeMode) {
                    setWidth(length);
                    setHeight(length);
                  }
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  isCubeMode
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {isCubeMode ? '已鎖定為正方體' : '切換為正方體'}
              </button>
            </div>

            {/* Slider 1: Length */}
            <div className="space-y-2 p-3.5 bg-blue-50/50 border border-blue-200 rounded-2xl">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-blue-900">
                  {isCubeMode ? '正方體邊長' : '長（Length）'}
                </span>
                <span className="text-base font-black text-blue-700 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-blue-200">
                  {length} cm
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={length}
                onChange={e => {
                  const val = parseInt(e.target.value);
                  if (isCubeMode) handleCubeChange(val);
                  else handleDimensionChange('len', val);
                }}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-blue-200 rounded-lg"
              />
              <div className="flex justify-between text-[11px] text-blue-600 font-medium">
                <span>1 公分</span>
                <span>6 公分</span>
              </div>
            </div>

            {/* Slider 2: Width */}
            {!isCubeMode && (
              <div className="space-y-2 p-3.5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-900">寬（Width）</span>
                  <span className="text-base font-black text-emerald-700 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-emerald-200">
                    {width} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={width}
                  onChange={e => handleDimensionChange('wid', parseInt(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-2 bg-emerald-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-emerald-600 font-medium">
                  <span>1 公分</span>
                  <span>5 公分</span>
                </div>
              </div>
            )}

            {/* Slider 3: Height */}
            {!isCubeMode && (
              <div className="space-y-2 p-3.5 bg-amber-50/50 border border-amber-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-amber-900">高（Height - 堆幾層）</span>
                  <span className="text-base font-black text-amber-700 font-mono bg-white px-2.5 py-0.5 rounded-lg border border-amber-200">
                    {height} cm
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  value={height}
                  onChange={e => handleDimensionChange('hei', parseInt(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer h-2 bg-amber-200 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-amber-600 font-medium">
                  <span>1 層</span>
                  <span>4 層</span>
                </div>
              </div>
            )}

            {/* Pedagogical Step Explain Card */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-700 space-y-2">
              <p className="font-bold text-amber-800 flex items-center gap-1.5">
                <span>🎯</span>
                <span>為什麼是「長 × 寬 × 高」？</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-slate-600 leading-relaxed">
                <li>一排排了 <span className="font-bold text-blue-600">{length}</span> 個積木。</li>
                <li>底層排了 <span className="font-bold text-emerald-600">{width}</span> 排，所以一層共有 <span className="font-bold">{length} × {width} = {baseArea}</span> 個積木。</li>
                <li>向上堆疊了 <span className="font-bold text-amber-600">{height}</span> 層，所以總共是 <span className="font-bold">{baseArea} × {height} = {totalVolume}</span> 個小積木！</li>
              </ol>
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
            <span>前往單元三：透視眼與隱藏積木</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
