export interface Block {
  id: string;
  x: number; // width axis (0..W-1)
  y: number; // height axis (0..H-1, 0 is ground)
  z: number; // depth axis (0..D-1)
  color?: string;
  label?: string | number;
  highlighted?: boolean;
  group?: string; // e.g. 'A' or 'B' for composite decomposition
  ghost?: boolean; // for filling complementary hollow spaces
}

export type LearningTab =
  | 'concept'     // 1. 認識體積與 1 cm³
  | 'formula'     // 2. 長寬高公式可視化
  | 'hidden'      // 3. 透視眼與隱藏積木
  | 'composite'   // 4. 複合形體切割與補齊
  | 'builder'     // 5. 自由建造實驗室
  | 'quiz';       // 6. 闖關大冒險

export interface QuizQuestion {
  id: number;
  title: string;
  badge: string;
  category: 'count' | 'formula' | 'hidden' | 'composite';
  questionText: string;
  audioPrompt?: string;
  blocks: Block[];
  correctAnswer: number;
  unit: string;
  options: number[];
  hint: string;
  explanation: string;
  formulaStep?: string;
  recommendedView?: { rotX: number; rotY: number };
}
