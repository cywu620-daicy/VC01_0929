import React, { useState } from 'react';
import { LearningTab } from '../types/volume';
import { Box, Layers, Eye, Puzzle, Hammer, Trophy, Volume2, VolumeX, Sparkles, BookOpen } from 'lucide-react';
import { toggleSound, getSoundStatus, playClickSound } from '../utils/audio';

interface NavbarProps {
  currentTab: LearningTab;
  onTabChange: (tab: LearningTab) => void;
  onOpenKnowledge: () => void;
  quizScore?: number;
}

const TABS: Array<{ id: LearningTab; label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = [
  { id: 'concept', label: '1. 認識體積', icon: Box, desc: '1 cm³ 是什麼？' },
  { id: 'formula', label: '2. 長寬高公式', icon: Layers, desc: '長 × 寬 × 高' },
  { id: 'hidden', label: '3. 透視隱藏積木', icon: Eye, desc: '別漏掉底下方塊' },
  { id: 'composite', label: '4. 複合形體拆解', icon: Puzzle, desc: '切割法與補齊法' },
  { id: 'builder', label: '5. 自由建造室', icon: Hammer, desc: '蓋積木算體積' },
  { id: 'quiz', label: '6. 冒險闖關', icon: Trophy, desc: '測驗與星級挑戰' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  onOpenKnowledge,
  quizScore = 0,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(getSoundStatus());

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundEnabled(newState);
    if (newState) playClickSound();
  };

  const handleTabClick = (tabId: LearningTab) => {
    playClickSound();
    onTabChange(tabId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/80 shadow-xs">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-white shadow-md shadow-amber-200">
            <Box className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-800">
                神奇體積小方塊
              </h1>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                四年級數學
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              動手玩 3D 積木 · 掌握立方公分與長方體體積公式
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Knowledge base button */}
          <button
            onClick={() => {
              playClickSound();
              onOpenKnowledge();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100/80 hover:bg-amber-200 rounded-xl transition-colors cursor-pointer"
            title="體積生活小百科"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span className="hidden md:inline">生活小百科</span>
          </button>

          {/* Sound toggle */}
          <button
            onClick={handleSoundToggle}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100'
                : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
            }`}
            title={soundEnabled ? '音效已開啟' : '音效已靜音'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Score display */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl shadow-xs font-bold text-xs sm:text-sm">
            <Sparkles className="w-4 h-4" />
            <span>★ {quizScore} 分</span>
          </div>
        </div>
      </div>

      {/* Learning Step Segmented Tabs */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 pb-2 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 min-w-max p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-amber-800 shadow-sm shadow-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
