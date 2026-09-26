import React, { useState } from 'react';
import { Canvas3D } from '../Canvas3D';
import { Block } from '../../types/volume';
import { Puzzle, Scissors, PlusSquare, ArrowRight, Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speech';
import { playClickSound, playBlockAddSound } from '../../utils/audio';

interface CompositeShapesProps {
  onGoNext: () => void;
}

export const CompositeShapes: React.FC<CompositeShapesProps> = ({ onGoNext }) => {
  const [shapeType, setShapeType] = useState<'l-shape' | 'u-shape' | 'steps'>('l-shape');
  const [strategy, setStrategy] = useState<'split-v' | 'split-h' | 'fill'>('split-v');
  const [isReading, setIsReading] = useState(false);

  // Generate blocks based on shape and strategy
  const getShapeData = () => {
    const blocks: Block[] = [];
    let formulaA = '';
    let formulaB = '';
    let formulaTotal = '';
    let volA = 0;
    let volB = 0;
    let volTotal = 0;

    if (shapeType === 'l-shape') {
      // L-shape bounding box 4 wide (X), 3 high (Y), 2 deep (Z)
      // Tall left pillar: X=0..1, Y=0..2, Z=0..1 (2 x 3 x 2 = 12)
      // Low right flat:   X=2..3, Y=0..0, Z=0..1 (2 x 1 x 2 = 4)
      // Total volume = 16 cm³

      if (strategy === 'split-v') {
        // Vertical cut: Pillar A (2x3x2=12) and Flat B (2x1x2=4)
        for (let x = 0; x < 2; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              blocks.push({ id: `a-${x}-${y}-${z}`, x, y, z, color: '#3b82f6', group: 'A' });
            }
          }
        }
        for (let x = 2; x < 4; x++) {
          for (let y = 0; y < 1; y++) {
            for (let z = 0; z < 2; z++) {
              blocks.push({ id: `b-${x}-${y}-${z}`, x, y, z, color: '#ec4899', group: 'B' });
            }
          }
        }
        volA = 2 * 3 * 2;
        volB = 2 * 1 * 2;
        volTotal = volA + volB;
        formulaA = '左長方體 A：2 × 2 × 3 = 12 cm³';
        formulaB = '右長方體 B：2 × 2 × 1 = 4 cm³';
        formulaTotal = '體積 = 12 + 4 = 16 立方公分';
      } else if (strategy === 'split-h') {
        // Horizontal cut: Bottom base (4x1x2=8) and Top tower (2x2x2=8)
        for (let x = 0; x < 4; x++) {
          for (let y = 0; y < 1; y++) {
            for (let z = 0; z < 2; z++) {
              blocks.push({ id: `b-${x}-${y}-${z}`, x, y, z, color: '#ec4899', group: 'B' });
            }
          }
        }
        for (let x = 0; x < 2; x++) {
          for (let y = 1; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              blocks.push({ id: `a-${x}-${y}-${z}`, x, y, z, color: '#3b82f6', group: 'A' });
            }
          }
        }
        volA = 2 * 2 * 2;
        volB = 4 * 2 * 1;
        volTotal = volA + volB;
        formulaA = '上方小正方體 A：2 × 2 × 2 = 8 cm³';
        formulaB = '下方大底座 B：4 × 2 × 1 = 8 cm³';
        formulaTotal = '體積 = 8 + 8 = 16 立方公分';
      } else {
        // Fill method: Big bounding box (4x3x2=24) minus missing corner (2x2x2=8)
        // Solid parts:
        for (let x = 0; x < 4; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              const isMissing = x >= 2 && y >= 1;
              blocks.push({
                id: `blk-${x}-${y}-${z}`,
                x,
                y,
                z,
                color: isMissing ? '#94a3b8' : '#3b82f6',
                ghost: isMissing,
                label: isMissing ? '缺' : undefined,
              });
            }
          }
        }
        volA = 4 * 2 * 3; // total 24
        volB = 2 * 2 * 2; // missing 8
        volTotal = volA - volB;
        formulaA = '補齊後大長方體：4 × 2 × 3 = 24 cm³';
        formulaB = '減去缺角部分：2 × 2 × 2 = 8 cm³';
        formulaTotal = '體積 = 24 - 8 = 16 立方公分';
      }
    } else if (shapeType === 'u-shape') {
      // U-shape arch (concave)
      // Left pillar: 1x3x2=6, Right pillar: 1x3x2=6, Center base: 1x1x2=2 => Total 14 cm³
      if (strategy === 'fill') {
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              const isHollow = x === 1 && y >= 1;
              blocks.push({
                id: `u-${x}-${y}-${z}`,
                x,
                y,
                z,
                color: isHollow ? '#94a3b8' : '#10b981',
                ghost: isHollow,
                label: isHollow ? '缺' : undefined,
              });
            }
          }
        }
        volA = 3 * 2 * 3; // 18
        volB = 1 * 2 * 2; // 4
        volTotal = 14;
        formulaA = '完整大長方體：3 × 2 × 3 = 18 cm³';
        formulaB = '中間挖空凹洞：1 × 2 × 2 = 4 cm³';
        formulaTotal = '體積 = 18 - 4 = 14 立方公分';
      } else {
        // Cut into 3 pieces or 2 side pillars + bottom
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              if (x === 1 && y >= 1) continue;
              const isSide = x !== 1;
              blocks.push({
                id: `u-${x}-${y}-${z}`,
                x,
                y,
                z,
                color: isSide ? '#3b82f6' : '#ec4899',
                group: isSide ? 'A' : 'B',
              });
            }
          }
        }
        volA = 2 * (1 * 2 * 3); // 12
        volB = 1 * 2 * 1; // 2
        volTotal = 14;
        formulaA = '左右兩根立柱：(1 × 2 × 3) × 2 = 12 cm³';
        formulaB = '中間底板：1 × 2 × 1 = 2 cm³';
        formulaTotal = '體積 = 12 + 2 = 14 立方公分';
      }
    } else {
      // 3-step stairs
      // Step 1: 3x1x2=6, Step 2: 2x1x2=4, Step 3: 1x1x2=2 => Total 12 cm³
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 2; z++) {
            const isPresent = y <= (2 - x);
            if (strategy === 'fill') {
              blocks.push({
                id: `st-${x}-${y}-${z}`,
                x,
                y,
                z,
                color: isPresent ? '#f59e0b' : '#94a3b8',
                ghost: !isPresent,
                label: !isPresent ? '補' : undefined,
              });
            } else if (isPresent) {
              const grp = y === 0 ? 'A' : y === 1 ? 'B' : 'C';
              const col = y === 0 ? '#3b82f6' : y === 1 ? '#10b981' : '#f59e0b';
              blocks.push({ id: `st-${x}-${y}-${z}`, x, y, z, color: col, group: grp });
            }
          }
        }
      }
      if (strategy === 'fill') {
        volA = 3 * 2 * 3; // 18
        volB = 6;
        volTotal = 12;
        formulaA = '補滿大方塊：3 × 2 × 3 = 18 cm³';
        formulaB = '減去缺少的積木：6 cm³';
        formulaTotal = '體積 = 18 - 6 = 12 立方公分';
      } else {
        volA = 3 * 2 * 1; // 6
        volB = 2 * 2 * 1 + 1 * 2 * 1; // 6
        volTotal = 12;
        formulaA = '第1層底座：3 × 2 × 1 = 6 cm³';
        formulaB = '第2層(4cm³) + 第3層(2cm³)';
        formulaTotal = '體積 = 6 + 4 + 2 = 12 立方公分';
      }
    }

    return { blocks, formulaA, formulaB, formulaTotal, volTotal };
  };

  const { blocks, formulaA, formulaB, formulaTotal, volTotal } = getShapeData();

  const handleRead = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      const text = strategy === 'fill'
        ? `這是補齊法：我們先把缺角的凹洞補起來，變成一個完整的大長方體，算完大長方體的體積後，再減掉剛才補上的缺角體積，答案就出來了！${formulaTotal}`
        : `這是切割法：我們拿一把神奇的雷射刀，把這個奇怪的形狀切成兩個規律的長方體A和B，分別算出體積後相加，答案就出來了！${formulaTotal}`;
      speakText(text, () => setIsReading(false));
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              單元四 · 解題絕招
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs font-semibold text-slate-500">國小四年級進階</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
            複合形體拆解：切割法 vs 補齊法
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            遇到長相奇特的形體別害怕！用「<span className="font-bold text-blue-600">切割相加</span>」或「<span className="font-bold text-amber-600">補齊相減</span>」，輕鬆拆解成簡單長方體！
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
        {/* Left: 3D Visualization */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
              <Puzzle className="w-4 h-4 text-amber-500" />
              <span>3D 切割與補齊動態展示</span>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {strategy === 'fill' ? '補齊法（大減小）' : '切割法（分段加）'}
            </span>
          </div>

          <div className="w-full h-[360px] sm:h-[400px] min-w-0">
            <Canvas3D
              blocks={blocks}
              colorMode="custom"
              showLabels={strategy === 'fill'}
              gridSize={{ x: 6, z: 5 }}
            />
          </div>

          {/* Dynamic Formula Display Box */}
          <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 space-y-2">
            <div className="text-xs font-bold text-amber-900">🧮 算式步驟拆解</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium text-slate-700">
              <div className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-xs">
                {formulaA}
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-amber-200 shadow-xs">
                {formulaB}
              </div>
            </div>
            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold">最終計算結果：</span>
              <span className="text-base sm:text-lg font-black text-amber-700 font-mono">
                {formulaTotal}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Strategy Switches */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-5">
            {/* Shape selection */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>1. 選擇複合形體造型</span>
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => {
                    playBlockAddSound();
                    setShapeType('l-shape');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    shapeType === 'l-shape'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  L 型柱體
                </button>
                <button
                  onClick={() => {
                    playBlockAddSound();
                    setShapeType('u-shape');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    shapeType === 'u-shape'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  凹字型拱門
                </button>
                <button
                  onClick={() => {
                    playBlockAddSound();
                    setShapeType('steps');
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    shapeType === 'steps'
                      ? 'border-amber-500 bg-amber-50 text-amber-900 shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  三階樓梯
                </button>
              </div>
            </div>

            {/* Strategy Selection */}
            <div>
              <h3 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5">
                <Scissors className="w-4 h-4 text-amber-500" />
                <span>2. 選擇解題策略</span>
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    playClickSound();
                    setStrategy('split-v');
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    strategy === 'split-v'
                      ? 'border-blue-500 bg-blue-50/80 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">切割法（直切，由上往下切）</h4>
                    <p className="text-xs text-slate-500">切成左邊高立柱 + 右邊低底座</p>
                  </div>
                  {strategy === 'split-v' && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </button>

                {shapeType === 'l-shape' && (
                  <button
                    onClick={() => {
                      playClickSound();
                      setStrategy('split-h');
                    }}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      strategy === 'split-h'
                        ? 'border-purple-500 bg-purple-50/80 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">切割法（橫切，水平切）</h4>
                      <p className="text-xs text-slate-500">切成上方小方塊 + 下方大長方底座</p>
                    </div>
                    {strategy === 'split-h' && <CheckCircle2 className="w-5 h-5 text-purple-600" />}
                  </button>
                )}

                <button
                  onClick={() => {
                    playClickSound();
                    setStrategy('fill');
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                    strategy === 'fill'
                      ? 'border-amber-500 bg-amber-50/80 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm">補齊法（填補缺角再減去）</h4>
                    <p className="text-xs text-slate-500">虛線補成完整大長方體，再扣掉缺角</p>
                  </div>
                  {strategy === 'fill' && <CheckCircle2 className="w-5 h-5 text-amber-600" />}
                </button>
              </div>
            </div>

            {/* Hint Box */}
            <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl text-xs text-sky-900 leading-relaxed">
              💡 <span className="font-bold">小朋友發現了嗎？</span>
              <br />
              不管用「直切」還是「橫切」，算出來的體積都是 <span className="font-bold text-sky-700">{volTotal} 立方公分</span>！選你覺得最好算的方法就可以囉！
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
            <span>前往單元五：自由建造實驗室</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
