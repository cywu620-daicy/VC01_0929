import React, { useState } from 'react';
import { LearningTab } from './types/volume';
import { Navbar } from './components/Navbar';
import { KnowledgeModal } from './components/KnowledgeModal';
import { ConceptIntro } from './components/modules/ConceptIntro';
import { FormulaExplorer } from './components/modules/FormulaExplorer';
import { HiddenBlocks } from './components/modules/HiddenBlocks';
import { CompositeShapes } from './components/modules/CompositeShapes';
import { FreeBuilder } from './components/modules/FreeBuilder';
import { AdventureQuiz } from './components/modules/AdventureQuiz';
import { playClickSound } from './utils/audio';

export default function App() {
  const [currentTab, setCurrentTab] = useState<LearningTab>('concept');
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  const handleScoreUpdate = (newScore: number) => {
    setQuizScore(newScore);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70 text-slate-800">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={tab => setCurrentTab(tab)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        quizScore={quizScore}
      />

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentTab === 'concept' && (
          <ConceptIntro onGoNext={() => setCurrentTab('formula')} />
        )}
        {currentTab === 'formula' && (
          <FormulaExplorer onGoNext={() => setCurrentTab('hidden')} />
        )}
        {currentTab === 'hidden' && (
          <HiddenBlocks onGoNext={() => setCurrentTab('composite')} />
        )}
        {currentTab === 'composite' && (
          <CompositeShapes onGoNext={() => setCurrentTab('builder')} />
        )}
        {currentTab === 'builder' && (
          <FreeBuilder onGoNext={() => setCurrentTab('quiz')} />
        )}
        {currentTab === 'quiz' && (
          <AdventureQuiz
            onScoreUpdate={handleScoreUpdate}
            onRestartAll={() => setCurrentTab('concept')}
          />
        )}
      </main>

      {/* Real Life Trivia Modal */}
      <KnowledgeModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white/70 py-6 text-center text-xs text-slate-500 space-y-1">
        <p className="font-semibold text-slate-700">
          🌟 神奇體積小方塊 · 國小四年級數學互動學習樂園
        </p>
        <p className="text-slate-400">
          依據國小四年級數學「體積」課綱核心概念設計 · 支援 3D 自由旋轉、分層展開、X光透視與生活小百科
        </p>
      </footer>
    </div>
  );
}
