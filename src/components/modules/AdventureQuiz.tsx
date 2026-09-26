import React, { useState } from 'react';
import { Canvas3D } from '../Canvas3D';
import { Block, QuizQuestion } from '../../types/volume';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle, XCircle, HelpCircle, Volume2, Sparkles, ArrowRight, RotateCcw, Award } from 'lucide-react';
import { speakText, stopSpeaking } from '../../utils/speech';
import { playSuccessSound, playIncorrectSound, playClickSound } from '../../utils/audio';

// 10 Curriculum-aligned quiz questions for Grade 4
const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    title: '第 1 關：基礎積木數數看',
    badge: '基礎暖身',
    category: 'count',
    questionText: '請觀察左邊的 3D 形體，每個小積木是 1 立方公分，這個形體的體積是多少立方公分？',
    audioPrompt: '請觀察左邊的3D形體，每個小積木是1立方公分，這個形體的體積是多少立方公分？',
    blocks: [
      { id: 'q1-1', x: 0, y: 0, z: 0, color: '#3b82f6', label: 1 },
      { id: 'q1-2', x: 1, y: 0, z: 0, color: '#3b82f6', label: 2 },
      { id: 'q1-3', x: 2, y: 0, z: 0, color: '#3b82f6', label: 3 },
      { id: 'q1-4', x: 0, y: 0, z: 1, color: '#3b82f6', label: 4 },
      { id: 'q1-5', x: 1, y: 0, z: 1, color: '#3b82f6', label: 5 },
      { id: 'q1-6', x: 0, y: 1, z: 0, color: '#ec4899', label: 6 },
      { id: 'q1-7', x: 1, y: 1, z: 0, color: '#ec4899', label: 7 },
    ],
    correctAnswer: 7,
    unit: '立方公分',
    options: [5, 6, 7, 8],
    hint: '底層有 5 塊，上面第 2 層有 2 塊，加起來共有幾塊呢？',
    explanation: '底層有 5 塊積木，第二層有 2 塊積木，5 + 2 = 7 個小積木。每個小積木是 1 立方公分，所以總體積是 7 立方公分！',
    formulaStep: '5 (底層) + 2 (上層) = 7 立方公分',
  },
  {
    id: 2,
    title: '第 2 關：長方體魔法公式',
    badge: '公式計算',
    category: 'formula',
    questionText: '這個長方體長 4 公分、寬 3 公分、高 2 公分，請算出它的體積是多少？',
    audioPrompt: '這個長方體長4公分、寬3公分、高2公分，請算出它的體積是多少？',
    blocks: (() => {
      const b: Block[] = [];
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 3; z++) {
          for (let x = 0; x < 4; x++) {
            b.push({ id: `q2-${x}-${y}-${z}`, x, y, z, color: y === 0 ? '#3b82f6' : '#10b981' });
          }
        }
      }
      return b;
    })(),
    correctAnswer: 24,
    unit: '立方公分',
    options: [18, 20, 24, 28],
    hint: '長方體體積公式：長 × 寬 × 高。一層有 4 × 3 = 12 個，堆了 2 層！',
    explanation: '長方體的體積 = 長 × 寬 × 高 = 4 × 3 × 2 = 24 立方公分！',
    formulaStep: '4 × 3 × 2 = 24 立方公分',
  },
  {
    id: 3,
    title: '第 3 關：正方體的體積',
    badge: '公式計算',
    category: 'formula',
    questionText: '邊長 3 公分的正方體，它的體積是多少立方公分？',
    audioPrompt: '邊長3公分的正方體，它的體積是多少立方公分？',
    blocks: (() => {
      const b: Block[] = [];
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          for (let x = 0; x < 3; x++) {
            b.push({ id: `q3-${x}-${y}-${z}`, x, y, z });
          }
        }
      }
      return b;
    })(),
    correctAnswer: 27,
    unit: '立方公分',
    options: [9, 18, 24, 27],
    hint: '正方體每個邊都一樣長，體積公式是：邊長 × 邊長 × 邊長！',
    explanation: '正方體的體積 = 邊長 × 邊長 × 邊長 = 3 × 3 × 3 = 27 立方公分！注意不是 3 × 3 喔！',
    formulaStep: '3 × 3 × 3 = 27 立方公分',
  },
  {
    id: 4,
    title: '第 4 關：小心隱藏積木！',
    badge: '空間盲區',
    category: 'hidden',
    questionText: '觀察這個階梯造型，別被正面的外觀騙了！請問全部總共有多少立方公分？',
    audioPrompt: '觀察這個階梯造型，別被正面的外觀騙了！請問全部總共有多少立方公分？',
    blocks: (() => {
      const b: Block[] = [];
      // 3x2 base
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 2; z++) {
          b.push({ id: `q4-0-${x}-${z}`, x, y: 0, z, color: '#3b82f6' });
        }
      }
      // layer 1: 2x2
      for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
          b.push({ id: `q4-1-${x}-${z}`, x, y: 1, z, color: '#10b981' });
        }
      }
      // layer 2: 1x2
      for (let z = 0; z < 2; z++) {
        b.push({ id: `q4-2-0-${z}`, x: 0, y: 2, z, color: '#ec4899' });
      }
      return b;
    })(),
    correctAnswer: 12,
    unit: '立方公分',
    options: [9, 10, 11, 12],
    hint: '你可以拖曳旋轉 3D 視角，或用「分層法」來算：第 1 層有 6 塊、第 2 層有 4 塊、第 3 層有 2 塊！',
    explanation: '最高的那兩塊積木下方，藏著看不見的底層積木在支撐！分層計算：第1層有6個 + 第2層有4個 + 第3層有2個 = 12 立方公分！',
    formulaStep: '6 (第1層) + 4 (第2層) + 2 (第3層) = 12 立方公分',
  },
  {
    id: 5,
    title: '第 5 關：複合形體 L 型柱',
    badge: '切割法解題',
    category: 'composite',
    questionText: '這是一個 L 型複合長方體，運用切割法或補齊法，它的體積是多少？',
    audioPrompt: '這是一個L型複合長方體，運用切割法或補齊法，它的體積是多少？',
    blocks: (() => {
      const b: Block[] = [];
      // Left high pillar: 2 x 3 x 1
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 3; y++) {
          b.push({ id: `q5-p-${x}-${y}`, x, y, z: 0, color: '#3b82f6' });
        }
      }
      // Right low base: 2 x 1 x 1
      for (let x = 2; x < 4; x++) {
        b.push({ id: `q5-f-${x}`, x, y: 0, z: 0, color: '#ec4899' });
      }
      return b;
    })(),
    correctAnswer: 8,
    unit: '立方公分',
    options: [6, 7, 8, 10],
    hint: '由左往右直切：左邊立柱有 2 × 3 = 6 塊，右邊底座有 2 塊，合起來是多少呢？',
    explanation: '利用切割法：左邊長方體 2 × 1 × 3 = 6 立方公分，右邊長方體 2 × 1 × 1 = 2 立方公分。6 + 2 = 8 立方公分！',
    formulaStep: '6 (左柱) + 2 (右座) = 8 立方公分',
  },
  {
    id: 6,
    title: '第 6 關：大長方體體積探險',
    badge: '公式計算',
    category: 'formula',
    questionText: '一個長 5 公分、寬 4 公分、高 3 公分的禮盒，體積是多少立方公分？',
    audioPrompt: '一個長5公分、寬4公分、高3公分的禮盒，體積是多少立方公分？',
    blocks: (() => {
      const b: Block[] = [];
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 4; z++) {
          for (let x = 0; x < 5; x++) {
            b.push({ id: `q6-${x}-${y}-${z}`, x, y, z });
          }
        }
      }
      return b;
    })(),
    correctAnswer: 60,
    unit: '立方公分',
    options: [45, 50, 60, 75],
    hint: '體積公式：長 × 寬 × 高 = 5 × 4 × 3',
    explanation: '底層面積是 5 × 4 = 20，再乘上高 3 層：20 × 3 = 60 立方公分！',
    formulaStep: '5 × 4 × 3 = 60 立方公分',
  },
  {
    id: 7,
    title: '第 7 關：凹字型拱門體積',
    badge: '補齊法挑戰',
    category: 'composite',
    questionText: '這座拱門造型體積是多少？（提示：可用大長方體減去中間挖空的洞）',
    audioPrompt: '這座拱門造型體積是多少？提示：可用大長方體減去中間挖空的洞。',
    blocks: (() => {
      const b: Block[] = [];
      // 3x3x1 arch, missing center x=1, y>=1
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (x === 1 && y >= 1) continue; // hole
          b.push({ id: `q7-${x}-${y}`, x, y, z: 0, color: '#8b5cf6' });
        }
      }
      return b;
    })(),
    correctAnswer: 7,
    unit: '立方公分',
    options: [5, 6, 7, 9],
    hint: '完整 3×3 是 9 塊，中間挖掉了 2 塊，剩下幾塊呢？',
    explanation: '完整的大正方形有 3 × 3 = 9 塊，中間挖空了 2 塊積木，9 - 2 = 7 立方公分！',
    formulaStep: '9 (完整) - 2 (挖空) = 7 立方公分',
  },
  {
    id: 8,
    title: '第 8 關：體積守恆神探',
    badge: '概念思維',
    category: 'count',
    questionText: '用 16 塊 1 立方公分的小積木，排成一條細長的長條，它的體積是多少？',
    audioPrompt: '用16塊1立方公分的小積木，排成一條細長的長條，它的體積是多少？',
    blocks: (() => {
      const b: Block[] = [];
      for (let x = 0; x < 8; x++) {
        b.push({ id: `q8-${x}-0`, x, y: 0, z: 0, color: '#f59e0b' });
        b.push({ id: `q8-${x}-1`, x, y: 1, z: 0, color: '#f59e0b' });
      }
      return b;
    })(),
    correctAnswer: 16,
    unit: '立方公分',
    options: [8, 12, 16, 24],
    hint: '體積守恆性：不管形狀排成怎樣，只要積木數量不變，體積就是積木的總數！',
    explanation: '因為用了 16 塊 1 立方公分的積木，不論排成何種形狀，總體積始終是 16 立方公分！',
    formulaStep: '1 cm³ × 16 塊 = 16 立方公分',
  },
  {
    id: 9,
    title: '第 9 關：透視中心隱藏柱',
    badge: '空間盲區',
    category: 'hidden',
    questionText: '外圈 3×3 底座被高高堆起，請仔細算算看這個實心立方體一共有多少立方公分？',
    audioPrompt: '外圈3乘3底座被高高堆起，請仔細算算看這個實心立方體一共有多少立方公分？',
    blocks: (() => {
      const b: Block[] = [];
      // 3x2x3 block
      for (let y = 0; y < 2; y++) {
        for (let z = 0; z < 3; z++) {
          for (let x = 0; x < 3; x++) {
            b.push({ id: `q9-${x}-${y}-${z}`, x, y, z, color: y === 0 ? '#3b82f6' : '#ec4899' });
          }
        }
      }
      return b;
    })(),
    correctAnswer: 18,
    unit: '立方公分',
    options: [12, 15, 18, 20],
    hint: '長 3、寬 3、高 2，利用長方體公式：長 × 寬 × 高！',
    explanation: '長 3 公分 × 寬 3 公分 × 高 2 公分 = 18 立方公分。被包在中間的積木也要算進去喔！',
    formulaStep: '3 × 3 × 2 = 18 立方公分',
  },
  {
    id: 10,
    title: '第 10 關：終極小學霸挑戰！',
    badge: '全能大考驗',
    category: 'composite',
    questionText: '一個長 4、寬 3、高 3 的大長方體，如果在頂層拿掉 3 個積木，現在體積是多少？',
    audioPrompt: '一個長4、寬3、高3的大長方體，如果在頂層拿掉3個積木，現在體積是多少？',
    blocks: (() => {
      const b: Block[] = [];
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          for (let x = 0; x < 4; x++) {
            // Remove 3 blocks at y=2, x=0, z=0..2
            if (y === 2 && x === 0) continue;
            b.push({ id: `q10-${x}-${y}-${z}`, x, y, z });
          }
        }
      }
      return b;
    })(),
    correctAnswer: 33,
    unit: '立方公分',
    options: [30, 33, 36, 39],
    hint: '先算原本大長方體的體積：4 × 3 × 3 = 36，再扣掉拿走的 3 塊！',
    explanation: '原本完整體積是 4 × 3 × 3 = 36 立方公分。拿掉了 3 塊積木，所以剩下的體積是 36 - 3 = 33 立方公分！太厲害了！',
    formulaStep: '36 (原本全部) - 3 (拿掉) = 33 立方公分',
  },
];

interface AdventureQuizProps {
  onScoreUpdate: (newScore: number) => void;
  onRestartAll: () => void;
}

export const AdventureQuiz: React.FC<AdventureQuizProps> = ({ onScoreUpdate, onRestartAll }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);

  const currentQ = QUIZ_QUESTIONS[currentIndex];

  const handleSelect = (option: number) => {
    if (isAnswered) return;
    playClickSound();
    setSelectedOption(option);
    setIsAnswered(true);

    if (option === currentQ.correctAnswer) {
      playSuccessSound();
      const newScore = score + 10;
      setScore(newScore);
      onScoreUpdate(newScore);
      // Trigger festive confetti
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.7 },
      });
    } else {
      playIncorrectSound();
    }
  };

  const handleNextQuestion = () => {
    playClickSound();
    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
      setShowHint(false);
    } else {
      // Completed all 10 questions
      setIsComplete(true);
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
      });
    }
  };

  const handleRestartQuiz = () => {
    playClickSound();
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setShowHint(false);
    setScore(0);
    onScoreUpdate(0);
    setIsComplete(false);
  };

  const handleRead = () => {
    if (isReading) {
      stopSpeaking();
      setIsReading(false);
    } else {
      setIsReading(true);
      const text = `${currentQ.title}。${currentQ.questionText}`;
      speakText(text, () => setIsReading(false));
    }
  };

  // Completion Screen
  if (isComplete) {
    const starCount = score >= 90 ? 3 : score >= 60 ? 2 : 1;
    return (
      <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
          <Trophy className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
            闖關大獲全勝！
          </span>
          <h2 className="text-3xl font-black text-slate-800">
            恭喜獲得「四年級體積小大師」榮譽勳章！🎖️
          </h2>
          <p className="text-slate-600">
            你已經掌握了 1 立方公分、長寬高公式、隱藏積木透視與複合形體切割法！
          </p>
        </div>

        {/* Stars */}
        <div className="flex justify-center gap-2 text-3xl">
          {[1, 2, 3].map(s => (
            <span key={s} className={s <= starCount ? 'text-amber-400 scale-110' : 'text-slate-200'}>
              ★
            </span>
          ))}
        </div>

        {/* Score Card */}
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 inline-block max-w-sm w-full">
          <div className="text-sm font-semibold text-slate-500">最終獲得積分</div>
          <div className="text-4xl font-black text-amber-700 font-mono mt-1">
            {score} <span className="text-lg font-bold text-slate-600">/ 100 分</span>
          </div>
          <div className="text-xs text-amber-800 font-medium mt-2">
            {score >= 90 ? '太神了！滿分級別的空間立體思維！' : '很棒的表現！多練習幾次會更熟練喔！'}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            onClick={handleRestartQuiz}
            className="px-6 py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>再挑戰一次</span>
          </button>
          <button
            onClick={onRestartAll}
            className="px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all cursor-pointer"
          >
            回到單元一複習
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = selectedOption === currentQ.correctAnswer;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Quiz Progress & Question Header */}
      <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
              {currentQ.badge}
            </span>
            <span className="text-xs font-semibold text-slate-400">
              第 {currentIndex + 1} / {QUIZ_QUESTIONS.length} 題
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRead}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isReading ? 'bg-amber-500 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span>{isReading ? '朗讀中' : '讀題目'}</span>
            </button>
            <div className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1.5 rounded-xl">
              目前得分：{score} 分
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-slate-800 pt-1">
          {currentQ.title}：{currentQ.questionText}
        </h2>
      </div>

      {/* Main Stage Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 3D Visualization */}
        <div className="lg:col-span-7 min-w-0 bg-white rounded-3xl p-4 sm:p-6 border border-amber-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">
              3D 模型檢視（可旋轉視角、開透視眼）
            </span>
            <button
              onClick={() => {
                playClickSound();
                setShowHint(!showHint);
              }}
              className="flex items-center gap-1 text-xs font-semibold text-amber-700 hover:underline cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? '收起提示' : '解題小錦囊'}</span>
            </button>
          </div>

          <div className="w-full h-[360px] sm:h-[400px] min-w-0">
            <Canvas3D
              blocks={currentQ.blocks}
              colorMode="layer"
              allowLayerExplode={true}
              allowXRay={true}
              gridSize={{ x: 6, z: 6 }}
            />
          </div>

          {/* Hint Card */}
          {showHint && (
            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 animate-in fade-in">
              💡 <span className="font-bold">解題提示：</span>
              {currentQ.hint}
            </div>
          )}
        </div>

        {/* Right: Options & Explanation */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">
              請選擇正確答案：
            </h3>

            {/* Option Buttons */}
            <div className="grid grid-cols-2 gap-3">
              {currentQ.options.map(opt => {
                const isThisSelected = selectedOption === opt;
                const isThisCorrect = opt === currentQ.correctAnswer;

                let btnStyle = 'border-slate-200 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 text-slate-800';

                if (isAnswered) {
                  if (isThisCorrect) {
                    btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400 font-bold';
                  } else if (isThisSelected) {
                    btnStyle = 'border-rose-500 bg-rose-50 text-rose-900 line-through';
                  } else {
                    btnStyle = 'border-slate-100 bg-slate-50 text-slate-400 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt}
                    disabled={isAnswered}
                    onClick={() => handleSelect(opt)}
                    className={`p-4 rounded-2xl border text-center transition-all cursor-pointer ${btnStyle}`}
                  >
                    <span className="text-xl sm:text-2xl font-black block font-mono">
                      {opt}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {currentQ.unit}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Post-Answer Feedback */}
            {isAnswered && (
              <div
                className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
                  isCorrect
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-amber-50 border-amber-200 text-amber-950'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm mb-1.5">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                      <span>太棒了！答對了！+10分 🎉</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-rose-500" />
                      <span>哎呀差一點點！正確答案是 {currentQ.correctAnswer} {currentQ.unit}</span>
                    </>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-slate-700">
                  {currentQ.explanation}
                </p>

                {currentQ.formulaStep && (
                  <div className="mt-2 pt-2 border-t border-slate-200 text-xs font-mono font-bold text-amber-800">
                    📐 算式：{currentQ.formulaStep}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Next Button */}
          {isAnswered && (
            <button
              onClick={handleNextQuestion}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-2xl shadow-md shadow-amber-200 transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer text-base"
            >
              <span>
                {currentIndex < QUIZ_QUESTIONS.length - 1 ? '前進下一關！' : '查看最終榮譽成績'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
