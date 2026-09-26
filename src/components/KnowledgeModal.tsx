import React from 'react';
import { X, Sparkles, Box, Droplets, BookOpen, Lightbulb } from 'lucide-react';

interface KnowledgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeModal: React.FC<KnowledgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-amber-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">體積生活小百科 📖</h2>
              <p className="text-xs text-amber-100">國小四年級必備的空間魔法知識！</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Card 1: 1 cm³有多大？ */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex gap-4 items-start">
            <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm shrink-0">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                1 立方公分（1 cm³）到底有多大？
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                拿出一把尺量量看：長 1 公分、寬 1 公分、高 1 公分的正方體，體積就是 <span className="font-semibold text-amber-700">1 立方公分</span>。
                在生活中，常見的「小骰子🎲」、「一顆方糖🧂」或「大人的大拇指第一節」，大小就差不多是 1 立方公分喔！
              </p>
            </div>
          </div>

          {/* Card 2: 體積與容量的秘密通道 */}
          <div className="p-4 bg-sky-50/70 border border-sky-200/80 rounded-2xl flex gap-4 items-start">
            <div className="p-3 bg-sky-500 text-white rounded-2xl shadow-sm shrink-0">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                神奇等式：體積與毫升（mL）的秘密
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-2">
                如果把 1 立方公分的小空盒子裝滿水，倒進量筒裡量一量，正好就是 <span className="font-semibold text-sky-700">1 毫升 (mL)</span>！
              </p>
              <div className="p-2.5 bg-white rounded-xl border border-sky-200 text-xs font-mono text-sky-800 flex justify-around font-semibold">
                <span>1 立方公分 (cm³) = 1 毫升 (mL)</span>
                <span>·</span>
                <span>1000 立方公分 = 1 公升 (L)</span>
              </div>
            </div>
          </div>

          {/* Card 3: 體積守恆性 */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex gap-4 items-start">
            <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-sm shrink-0">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                體積守恆：形狀變了，體積會變嗎？
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                拿 12 塊一模一樣的積木，你可以排成細長的「長蛇」、也可以堆成方方的「樓梯」。形狀雖然完全不同，但因為積木數量都是 12 塊，所以他們的體積依然是 <span className="font-semibold text-emerald-700">12 立方公分</span>，完全相等！這叫作「體積守恆」。
              </p>
            </div>
          </div>

          {/* Card 4: 體積 vs 表面積 */}
          <div className="p-4 bg-purple-50/70 border border-purple-200/80 rounded-2xl flex gap-4 items-start">
            <div className="p-3 bg-purple-500 text-white rounded-2xl shadow-sm shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base mb-1">
                常見考題陷阱：體積 vs 表面積
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                很多四年級小朋友容易搞混喔！記住口訣：<br />
                📦 <span className="font-semibold text-purple-800">體積</span>：盒子肚子裡面能塞多少空間（單位是 cm³）。<br />
                🎁 <span className="font-semibold text-purple-800">表面積</span>：包裝紙要多大才能把外面全包起來（單位是 cm²）。
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold rounded-xl shadow-md transition-all cursor-pointer"
          >
            我學會了！開始探索 ✨
          </button>
        </div>
      </div>
    </div>
  );
};
