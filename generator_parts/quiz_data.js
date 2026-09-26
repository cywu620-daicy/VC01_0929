// 10 國小四年級核心體積試題
const QUIZ_QUESTIONS = [
  {
    id: 1,
    title: '第 1 關：基礎積木數數看',
    badge: '基礎暖身',
    questionText: '請觀察 3D 形體，每個小積木是 1 立方公分，這個形體的體積是多少立方公分？',
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
    questionText: '這個長方體長 4 公分、寬 3 公分、高 2 公分，請算出它的體積是多少？',
    blocks: (() => {
      const b = [];
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
    questionText: '邊長 3 公分的正方體，它的體積是多少立方公分？',
    blocks: (() => {
      const b = [];
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
    questionText: '觀察這個階梯造型，別被正面的外觀騙了！請問全部總共有多少立方公分？',
    blocks: (() => {
      const b = [];
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 2; z++) {
          b.push({ id: `q4-0-${x}-${z}`, x, y: 0, z, color: '#3b82f6' });
        }
      }
      for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
          b.push({ id: `q4-1-${x}-${z}`, x, y: 1, z, color: '#10b981' });
        }
      }
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
    questionText: '這是一個 L 型複合長方體，運用切割法或補齊法，它的體積是多少？',
    blocks: (() => {
      const b = [];
      for (let x = 0; x < 2; x++) {
        for (let y = 0; y < 3; y++) {
          b.push({ id: `q5-p-${x}-${y}`, x, y, z: 0, color: '#3b82f6' });
        }
      }
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
    questionText: '一個長 5 公分、寬 4 公分、高 3 公分的禮盒，體積是多少立方公分？',
    blocks: (() => {
      const b = [];
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
    questionText: '這座拱門造型體積是多少？（提示：可用大長方體減去中間挖空的洞）',
    blocks: (() => {
      const b = [];
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          if (x === 1 && y >= 1) continue;
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
    questionText: '用 16 塊 1 立方公分的小積木，排成一條細長的長條，它的體積是多少？',
    blocks: (() => {
      const b = [];
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
    questionText: '外圈 3×3 底座被高高堆起，請仔細算算看這個實心立方體一共有多少立方公分？',
    blocks: (() => {
      const b = [];
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
    questionText: '一個長 4、寬 3、高 3 的大長方體，如果在頂層拿掉 3 個積木，現在體積是多少？',
    blocks: (() => {
      const b = [];
      for (let y = 0; y < 3; y++) {
        for (let z = 0; z < 3; z++) {
          for (let x = 0; x < 4; x++) {
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
