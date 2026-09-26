import React, { useState } from 'react';
import { Canvas3D } from '../Canvas3D';
import { Block } from '../../types/volume';
import { Eye, Volume2, Sparkles, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speech';
import { playClickSound, playSuccessSound, playBlockAddSound } from '../../utils/audio';

interface HiddenBlocksProps {
  onGoNext: () => void;
}

export const HiddenBlocks: React.FC<HiddenBlocksProps> = ({ onGoNext }) => {
  const [modelType, setModelType] = useState<'corner' | 'podium' | 'arch'>('corner');
  const [isXRayActive, setIsXRayActive] = useState<boolean>(false);
  const [showHiddenHighlight, setShowHiddenHighlight] = useState<boolean>(false);
  const [isReading, setIsReading] = useState<boolean>(false);

  // Models with deliberately hidden cubes underneath
  const getBlocks = (): { blocks: Block[]; hiddenCount: number; visibleCount: number } => {
    const list: Block[] = [];
    let hiddenCount = 0;
    let visibleCount = 0;

    if (modelType === 'corner') {
      // 3x3 base with corner tower (corner tower sits on 2 hidden bottom blocks)
      // Base: 3x3 flat on ground (y=0) = 9 blocks
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const isCornerTowerBase = (x === 0 && z === 0);
          list.push({
            id: `b-0-${x}-${z}`,
            x,
            y: 0,
            z,
            color: isCornerTowerBase ? '#f59e0b' : '#3b82f6',
            highlighted: showHiddenHighlight && isCornerTowerBase,
            label: isCornerTowerBase ? '藏' : undefined,
          });
          if (isCornerTowerBase) hiddenCount++;
          else visibleCount++;
        }
      }
      // Layer 1: corner tower at (0,0) and (1,0), (0,1)
      list.push({
        id: 'b-1-0-0',
        x: 0,
        y: 1,
        z: 0,
        color: '#f59e0b',
        highlighted: showHiddenHighlight,
        label: '藏',
      });
      hiddenCount++;

      list.push({ id: 'b-1-1-0', x: 1, y: 1, z: 0, color: '#3b82f6' });
      list.push({ id: 'b-1-0-1', x: 0, y: 1, z: 1, color: '#3b82f6' });
      visibleCount += 2;

      // Layer 2: top block on corner (0,0)
      list.push({
        id: 'b-2-0-0',
        x: 0,
        y: 2,
        z: 0,
        color: '#ec4899',
        label: '頂',
      });
      visibleCount++;
    } else if (modelType === 'podium') {
      // 3x3 solid bottom (9 blocks), center column has 2 blocks stacked on top of center block
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const isCenter = (x === 1 && z === 1);
          list.push({
            id: `b-0-${x}-${z}`,
            x,
            y: 0,
            z,
            color: isCenter ? '#f59e0b' : '#10b981',
            highlighted: showHiddenHighlight && isCenter,
            label: isCenter ? '藏' : undefined,
          });
          if (isCenter) hiddenCount++;
          else visibleCount++;
        }
      }
      // Center layer 1
      list.push({
        id: 'b-1-1-1',
        x: 1,
        y: 1,
        z: 1,
        color: '#f59e0b',
        highlighted: showHiddenHighlight,
        label: '藏',
      });
      hiddenCount++;

      // Center layer 2 (top)
      list.push({
        id: 'b-2-1-1',
        x: 1,
        y: 2,
        z: 1,
        color: '#ec4899',
        label: '頂',
      });
      visibleCount++;
    } else {
      // Stair shape with under-stair hidden blocks
      // Bottom layer 3x2 (6 blocks, back blocks are hidden by front)
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 2; z++) {
          const isHiddenUnder = (z === 0 && x < 2);
          list.push({
            id: `b-0-${x}-${z}`,
            x,
            y: 0,
            z,
            color: isHiddenUnder ? '#f59e0b' : '#6366f1',
            highlighted: showHiddenHighlight && isHiddenUnder,
            label: isHiddenUnder ? '藏' : undefined,
          });
          if (isHiddenUnder) hiddenCount++;
          else visibleCount++;
        }
      }
      // Layer 1: x=0..1, z=0..1
      for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
          const isHiddenUnder = (z === 0 && x === 0);
          list.push({
            id: `b-1-${x}-${z}`,
            x,
            y: 1,
            z,
            color: isHiddenUnder ? '#f59e0b' : '#8b5cf6',
            highlighted: showHiddenHighlight && isHiddenUnder,
            label: isHiddenUnder ? '藏' : undefined,
          });
          if (isHiddenUnder) hiddenCount++;
          else visibleCount++;
        }
      }
      // Layer 2: x=0, z=0..1
      list.push({ id: 'b-2-0-0', x: 0, y: 2, z: 0, color: '#ec4899' });
      list.push({ id: 'b-2-0-1', x: 0, y: 2, z: 1, color: '#ec4899' });
      visibleCount += 2;
    }

    return { blocks: list, hiddenCount, visibleCount };
  };

  const { blocks, hiddenCount, visibleCount } = getBlocks();
  const totalCount = blocks.length;

  const handleRead = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      const msg = `很多四年級同學在算體積時，常常只數眼睛看得到的表面積木，卻忘記了：上面的積木不可能憑空漂浮在空中，它的正下方一定有看不見的隱藏積木在支撐！開啟X光透視眼或滑動分層展開，就能抓出所有隱藏積木喔！`;
      speakText(msg, () => setIsReading(false));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Banner */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              單元三 · 空間思維訓練
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">國小四年級常考陷阱</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            透視眼與隱藏積木
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            小心！上面的積木不會憑空浮起來，它的下方一定有「<span className="font-bold text-amber-700">隱藏積木</span>」在默默支撐！
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
          <span>{isReading ? '正在解說...' : '聽小老師解說'}</span>
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Visualization Canvas */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Eye className="w-4 h-4 text-amber-500" />
              <span>3D 透視空間觀察</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  playClickSound();
                  setShowHiddenHighlight(!showHiddenHighlight);
                }}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                  showHiddenHighlight
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200'
                }`}
              >
                {showHiddenHighlight ? '已標記隱藏積木' : '標記隱藏積木 (藏)'}
              </button>
            </div>
          </div>

          <div className="w-full h-[360px] sm:h-[400px] min-w-0">
            <Canvas3D
              blocks={blocks}
              initialXRay={isXRayActive}
              showLabels={showHiddenHighlight}
              allowLayerExplode={true}
              gridSize={{ x: 5, z: 5 }}
            />
          </div>

          {/* Counts overview */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center">
              <span className="text-xs text-slate-500 block">表面可見積木</span>
              <span className="text-lg font-black text-slate-700">{visibleCount} 個</span>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-center">
              <span className="text-xs text-amber-800 font-bold block">底層被遮住的積木</span>
              <span className="text-lg font-black text-amber-600">+{hiddenCount} 個</span>
            </div>
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-2xl text-center">
              <span className="text-xs text-orange-800 font-bold block">真實全部體積</span>
              <span className="text-lg font-black text-orange-600">{totalCount} cm³</span>
            </div>
          </div>
        </div>

        {/* Right: Model Selection & Thinking Prompts */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>選擇陷阱題型測試</span>
            </h3>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  playBlockAddSound();
                  setModelType('corner');
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  modelType === 'corner'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <h4 className="font-bold text-slate-800 text-sm">形體一：角落高塔</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  高塔下方藏了 2 塊支撐積木，正面容易少數！
                </p>
              </button>

              <button
                onClick={() => {
                  playBlockAddSound();
                  setModelType('podium');
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  modelType === 'podium'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <h4 className="font-bold text-slate-800 text-sm">形體二：中心升降台</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  正中間柱體被四周包圍，底層核心完全看不到！
                </p>
              </button>

              <button
                onClick={() => {
                  playBlockAddSound();
                  setModelType('arch');
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  modelType === 'arch'
                    ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                    : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                }`}
              >
                <h4 className="font-bold text-slate-800 text-sm">形體三：雙層斜坡階梯</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  斜坡下方的底層盲區，練習用「分層抽屜展開」檢查！
                </p>
              </button>
            </div>

            {/* Secret Technique Card */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 text-amber-900 font-bold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>大考解題神技巧：「分層法」</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                遇到複雜形體，不要亂數！記住這句口訣：<br />
                <span className="font-bold text-amber-800">
                  「由下往上數，一層一層寫下來再相加！」
                </span><br />
                例如：第 1 層有幾個、第 2 層有幾個、第 3 層有幾個，這樣不管有多少隱藏積木都不會漏算！
              </p>
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
            <span>前往單元四：複合形體拆解（切割與補齊）</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
