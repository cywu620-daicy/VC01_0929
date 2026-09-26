// Interactive Logic for all 6 tabs

let currentTab = 'concept';
let quizScore = 0;
let tabRenderers = {};

function switchTab(tabId) {
  playClickSound();
  stopSpeaking();
  currentTab = tabId;

  // Update tabs UI
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.tab-pane').forEach(pane => {
    pane.classList.toggle('active', pane.id === `tab-${tabId}`);
  });

  // Trigger resize and draw for the active tab's canvas
  setTimeout(() => {
    if (tabRenderers[tabId] && tabRenderers[tabId].resize) {
      tabRenderers[tabId].resize();
    }
  }, 30);
}

// Global Sound Toggle
function initSoundToggle() {
  const btn = document.getElementById('btn-sound-toggle');
  btn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btn.classList.toggle('sound-active', soundEnabled);
    btn.innerHTML = soundEnabled ? ICONS.volume : ICONS.volumeX;
    btn.title = soundEnabled ? '音效已開啟' : '音效已靜音';
    if (soundEnabled) playClickSound();
  });
}

// Knowledge Modal
function initKnowledgeModal() {
  const modal = document.getElementById('knowledge-modal');
  const btnOpen = document.getElementById('btn-open-knowledge');
  const btnClose = document.getElementById('btn-close-knowledge');
  const btnOk = document.getElementById('btn-modal-ok');

  const open = () => { playClickSound(); modal.classList.add('open'); };
  const close = () => { playClickSound(); modal.classList.remove('open'); };

  btnOpen.addEventListener('click', open);
  btnClose.addEventListener('click', close);
  btnOk.addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
}

// ---------------- TAB 1: 認識體積 ----------------
function initTabConcept() {
  const container = document.getElementById('canvas-concept');
  let currentShape = 'single';

  function getBlocks(shape) {
    const list = [];
    if (shape === 'single') {
      list.push({ id: 'b-0', x: 0, y: 0, z: 0, color: '#3b82f6', label: '1' });
    } else if (shape === 'line') {
      for (let i = 0; i < 12; i++) {
        list.push({ id: `b-${i}`, x: i, y: 0, z: 0, color: '#3b82f6', label: i + 1 });
      }
    } else if (shape === 'flat') {
      let count = 1;
      for (let x = 0; x < 4; x++) {
        for (let z = 0; z < 3; z++) {
          list.push({ id: `b-${x}-${z}`, x, y: 0, z, color: '#10b981', label: count++ });
        }
      }
    } else if (shape === 'box') {
      let count = 1;
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 3; x++) {
          for (let z = 0; z < 2; z++) {
            list.push({ id: `b-${x}-${y}-${z}`, x, y, z, color: y === 0 ? '#3b82f6' : '#f59e0b', label: count++ });
          }
        }
      }
    } else if (shape === 'stairs') {
      let count = 1;
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 2; z++) {
          list.push({ id: `b-0-${x}-${z}`, x, y: 0, z, color: '#ec4899', label: count++ });
        }
      }
      for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
          list.push({ id: `b-1-${x}-${z}`, x, y: 1, z, color: '#8b5cf6', label: count++ });
        }
      }
      for (let z = 0; z < 2; z++) {
        list.push({ id: `b-2-0-${z}`, x: 0, y: 2, z, color: '#f59e0b', label: count++ });
      }
    }
    return list;
  }

  const renderer = new BlockRenderer3D(container, {
    blocks: getBlocks('single'),
    showDimensions: true,
    dimensionValues: { length: 1, width: 1, height: 1 },
    showLabels: true,
    colorMode: 'layer',
    gridSize: { x: 6, z: 6 }
  });
  tabRenderers['concept'] = renderer;

  // Preset Buttons
  document.querySelectorAll('.btn-concept-shape').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlockAddSound();
      currentShape = btn.dataset.shape;
      document.querySelectorAll('.btn-concept-shape').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const blocks = getBlocks(currentShape);
      const isSingle = currentShape === 'single';
      renderer.setOptions({
        blocks,
        showDimensions: isSingle,
        dimensionValues: isSingle ? { length: 1, width: 1, height: 1 } : null,
        showLabels: currentShape !== 'line',
        gridSize: { x: currentShape === 'line' ? 14 : 6, z: 6 }
      });

      const count = blocks.length;
      document.getElementById('concept-count-val').textContent = count;
      document.getElementById('concept-result-val').textContent = count;
      document.getElementById('concept-result-formula').textContent = `1 cm³ × ${count} 個 = ${count} cm³`;
    });
  });

  // Reading button
  const btnRead = document.getElementById('btn-read-concept');
  let isReading = false;
  btnRead.addEventListener('click', () => {
    if (isReading) {
      stopSpeaking();
      isReading = false;
      btnRead.classList.remove('reading');
      btnRead.querySelector('span').textContent = '小老師語音導讀';
    } else {
      isReading = true;
      btnRead.classList.add('reading');
      btnRead.querySelector('span').textContent = '正在朗讀中...';
      const text = currentShape === 'single'
        ? '長1公分、寬1公分、高1公分的正方體，它所佔有的空間大小就是1立方公分。我們用立方公分作為測量體積的標準單位。'
        : '看！這四種形體雖然外觀完全不一樣，但它們全部都是由12個1立方公分的小積木組合而成的。所以它們的體積都是12立方公分！這告訴我們：形狀改變，體積不會改變！';
      speakText(text, null, () => {
        isReading = false;
        btnRead.classList.remove('reading');
        btnRead.querySelector('span').textContent = '小老師語音導讀';
      });
    }
  });

  // Next tab
  document.getElementById('btn-next-concept').addEventListener('click', () => switchTab('formula'));
}

// ---------------- TAB 2: 長寬高公式 ----------------
function initTabFormula() {
  const container = document.getElementById('canvas-formula');
  let length = 4;
  let width = 3;
  let height = 2;
  let isCube = false;
  let activeStep = 3;

  function generateBlocks() {
    const list = [];
    let count = 1;
    for (let y = 0; y < height; y++) {
      for (let z = 0; z < width; z++) {
        for (let x = 0; x < length; x++) {
          let hl = false;
          if (activeStep === 1) hl = (y === 0 && z === 0);
          else if (activeStep === 2) hl = (y === 0);
          list.push({ id: `f-${x}-${y}-${z}`, x, y, z, label: count++, highlighted: hl });
        }
      }
    }
    return list;
  }

  const renderer = new BlockRenderer3D(container, {
    blocks: generateBlocks(),
    showDimensions: true,
    dimensionValues: { length, width, height },
    colorMode: 'layer',
    gridSize: { x: 7, z: 6 }
  });
  tabRenderers['formula'] = renderer;

  function update() {
    const blocks = generateBlocks();
    renderer.setOptions({
      blocks,
      dimensionValues: { length, width, height },
      gridSize: { x: Math.max(6, length + 2), z: Math.max(6, width + 2) }
    });

    const baseArea = length * width;
    const total = length * width * height;

    document.getElementById('f-val-len').textContent = `${length} cm`;
    document.getElementById('f-val-wid').textContent = `${width} cm`;
    document.getElementById('f-val-hei').textContent = `${height} cm`;

    document.getElementById('formula-calc-len').textContent = length;
    document.getElementById('formula-calc-wid').textContent = width;
    document.getElementById('formula-calc-hei').textContent = height;
    document.getElementById('formula-calc-total').textContent = total;

    document.getElementById('formula-step-info').textContent = `每層有 ${baseArea} 塊 × 堆了 ${height} 層`;
    document.getElementById('f-explain-len').textContent = length;
    document.getElementById('f-explain-wid').textContent = width;
    document.getElementById('f-explain-base').textContent = `${length} × ${width} = ${baseArea}`;
    document.getElementById('f-explain-hei').textContent = height;
    document.getElementById('f-explain-total').textContent = `${baseArea} × ${height} = ${total}`;
  }

  // Sliders
  const sLen = document.getElementById('slider-len');
  const sWid = document.getElementById('slider-wid');
  const sHei = document.getElementById('slider-hei');

  sLen.addEventListener('input', (e) => {
    playBlockAddSound();
    length = parseInt(e.target.value);
    if (isCube) {
      width = length;
      height = length;
      sWid.value = width;
      sHei.value = height;
    }
    update();
  });

  sWid.addEventListener('input', (e) => {
    playBlockAddSound();
    width = parseInt(e.target.value);
    update();
  });

  sHei.addEventListener('input', (e) => {
    playBlockAddSound();
    height = parseInt(e.target.value);
    update();
  });

  // Cube Toggle
  const btnCube = document.getElementById('btn-toggle-cube');
  btnCube.addEventListener('click', () => {
    playClickSound();
    isCube = !isCube;
    btnCube.classList.toggle('active-preset', isCube);
    btnCube.textContent = isCube ? '已鎖定為正方體' : '切換為正方體';
    document.getElementById('container-slider-wid').style.display = isCube ? 'none' : 'block';
    document.getElementById('container-slider-hei').style.display = isCube ? 'none' : 'block';
    document.getElementById('slider-len-title').textContent = isCube ? '正方體邊長' : '長（Length）';
    if (isCube) {
      width = length;
      height = length;
    }
    update();
  });

  // Step buttons
  document.querySelectorAll('.btn-formula-step').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      activeStep = parseInt(btn.dataset.step);
      document.querySelectorAll('.btn-formula-step').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      update();
    });
  });

  // Reading button
  const btnRead = document.getElementById('btn-read-formula');
  let isReading = false;
  btnRead.addEventListener('click', () => {
    if (isReading) {
      stopSpeaking();
      isReading = false;
      btnRead.classList.remove('reading');
      btnRead.querySelector('span').textContent = '語音聽解說';
    } else {
      isReading = true;
      btnRead.classList.add('reading');
      btnRead.querySelector('span').textContent = '正在解說...';
      const total = length * width * height;
      const text = isCube
        ? `正方體的體積公式是：邊長乘以邊長乘以邊長。邊長是${length}公分，所以體積是：${length}乘${length}乘${length}，等於${total}立方公分！`
        : `長方體的體積公式是：長乘以寬乘以高。長${length}公分，寬${width}公分，高${height}公分。體積就是：${length}乘${width}乘${height}，等於${total}立方公分！`;
      speakText(text, null, () => {
        isReading = false;
        btnRead.classList.remove('reading');
        btnRead.querySelector('span').textContent = '語音聽解說';
      });
    }
  });

  // Next tab
  document.getElementById('btn-next-formula').addEventListener('click', () => switchTab('hidden'));
}

// ---------------- TAB 3: 透視隱藏積木 ----------------
function initTabHidden() {
  const container = document.getElementById('canvas-hidden');
  let modelType = 'corner';
  let showHighlight = false;

  function getBlocks() {
    const list = [];
    let hidden = 0;
    let visible = 0;

    if (modelType === 'corner') {
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const isCorner = (x === 0 && z === 0);
          list.push({
            id: `h-0-${x}-${z}`, x, y: 0, z,
            color: isCorner ? '#f59e0b' : '#3b82f6',
            highlighted: showHighlight && isCorner,
            label: isCorner ? '藏' : undefined
          });
          if (isCorner) hidden++; else visible++;
        }
      }
      list.push({ id: 'h-1-0-0', x: 0, y: 1, z: 0, color: '#f59e0b', highlighted: showHighlight, label: '藏' });
      hidden++;
      list.push({ id: 'h-1-1-0', x: 1, y: 1, z: 0, color: '#3b82f6' });
      list.push({ id: 'h-1-0-1', x: 0, y: 1, z: 1, color: '#3b82f6' });
      visible += 2;
      list.push({ id: 'h-2-0-0', x: 0, y: 2, z: 0, color: '#ec4899', label: '頂' });
      visible++;
    } else if (modelType === 'podium') {
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 3; z++) {
          const isCenter = (x === 1 && z === 1);
          list.push({
            id: `h-0-${x}-${z}`, x, y: 0, z,
            color: isCenter ? '#f59e0b' : '#10b981',
            highlighted: showHighlight && isCenter,
            label: isCenter ? '藏' : undefined
          });
          if (isCenter) hidden++; else visible++;
        }
      }
      list.push({ id: 'h-1-1-1', x: 1, y: 1, z: 1, color: '#f59e0b', highlighted: showHighlight, label: '藏' });
      hidden++;
      list.push({ id: 'h-2-1-1', x: 1, y: 2, z: 1, color: '#ec4899', label: '頂' });
      visible++;
    } else {
      for (let x = 0; x < 3; x++) {
        for (let z = 0; z < 2; z++) {
          const isUnder = (z === 0 && x < 2);
          list.push({
            id: `h-0-${x}-${z}`, x, y: 0, z,
            color: isUnder ? '#f59e0b' : '#6366f1',
            highlighted: showHighlight && isUnder,
            label: isUnder ? '藏' : undefined
          });
          if (isUnder) hidden++; else visible++;
        }
      }
      for (let x = 0; x < 2; x++) {
        for (let z = 0; z < 2; z++) {
          const isUnder = (z === 0 && x === 0);
          list.push({
            id: `h-1-${x}-${z}`, x, y: 1, z,
            color: isUnder ? '#f59e0b' : '#8b5cf6',
            highlighted: showHighlight && isUnder,
            label: isUnder ? '藏' : undefined
          });
          if (isUnder) hidden++; else visible++;
        }
      }
      list.push({ id: 'h-2-0-0', x: 0, y: 2, z: 0, color: '#ec4899' });
      list.push({ id: 'h-2-0-1', x: 0, y: 2, z: 1, color: '#ec4899' });
      visible += 2;
    }
    return { list, hidden, visible };
  }

  const { list, hidden, visible } = getBlocks();
  const renderer = new BlockRenderer3D(container, {
    blocks: list,
    colorMode: 'layer',
    showLabels: showHighlight,
    allowLayerExplode: true,
    allowXRay: true,
    gridSize: { x: 5, z: 5 }
  });
  tabRenderers['hidden'] = renderer;

  function update() {
    const data = getBlocks();
    renderer.setOptions({
      blocks: data.list,
      showLabels: showHighlight
    });
    document.getElementById('hidden-visible-val').textContent = `${data.visible} 個`;
    document.getElementById('hidden-hidden-val').textContent = `+${data.hidden} 個`;
    document.getElementById('hidden-total-val').textContent = `${data.list.length} cm³`;
  }

  // Model switch buttons
  document.querySelectorAll('.btn-hidden-model').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlockAddSound();
      modelType = btn.dataset.model;
      document.querySelectorAll('.btn-hidden-model').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      update();
    });
  });

  // Highlight toggle
  const btnHighlight = document.getElementById('btn-toggle-hidden-hl');
  btnHighlight.addEventListener('click', () => {
    playClickSound();
    showHighlight = !showHighlight;
    btnHighlight.classList.toggle('active-preset', showHighlight);
    btnHighlight.textContent = showHighlight ? '已標記隱藏積木' : '標記隱藏積木 (藏)';
    update();
  });

  // Reading button
  const btnRead = document.getElementById('btn-read-hidden');
  let isReading = false;
  btnRead.addEventListener('click', () => {
    if (isReading) {
      stopSpeaking();
      isReading = false;
      btnRead.classList.remove('reading');
      btnRead.querySelector('span').textContent = '聽小老師解說';
    } else {
      isReading = true;
      btnRead.classList.add('reading');
      btnRead.querySelector('span').textContent = '正在解說...';
      const msg = '很多同學算體積時，常常只數眼睛看得到的表面積木，卻忘記了：上面的積木不可能漂浮在空中，下方一定有隱藏積木在支撐！開啟X光透視眼或滑動分層展開，就能抓出所有隱藏積木喔！';
      speakText(msg, null, () => {
        isReading = false;
        btnRead.classList.remove('reading');
        btnRead.querySelector('span').textContent = '聽小老師解說';
      });
    }
  });

  // Next tab
  document.getElementById('btn-next-hidden').addEventListener('click', () => switchTab('composite'));
}

// ---------------- TAB 4: 複合形體拆解 ----------------
function initTabComposite() {
  const container = document.getElementById('canvas-composite');
  let shape = 'l-shape';
  let strategy = 'split-v';

  function getCompositeData() {
    const blocks = [];
    let fA = '', fB = '', fTotal = '';

    if (shape === 'l-shape') {
      if (strategy === 'split-v') {
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
        fA = '左長方體 A：2 × 2 × 3 = 12 cm³';
        fB = '右長方體 B：2 × 2 × 1 = 4 cm³';
        fTotal = '體積 = 12 + 4 = 16 立方公分';
      } else if (strategy === 'split-h') {
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
        fA = '上方小正方體 A：2 × 2 × 2 = 8 cm³';
        fB = '下方大底座 B：4 × 2 × 1 = 8 cm³';
        fTotal = '體積 = 8 + 8 = 16 立方公分';
      } else {
        for (let x = 0; x < 4; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              const isMissing = x >= 2 && y >= 1;
              blocks.push({
                id: `blk-${x}-${y}-${z}`, x, y, z,
                color: isMissing ? '#94a3b8' : '#3b82f6',
                ghost: isMissing,
                label: isMissing ? '缺' : undefined
              });
            }
          }
        }
        fA = '補齊後大長方體：4 × 2 × 3 = 24 cm³';
        fB = '減去缺角部分：2 × 2 × 2 = 8 cm³';
        fTotal = '體積 = 24 - 8 = 16 立方公分';
      }
    } else if (shape === 'u-shape') {
      if (strategy === 'fill') {
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              const isHollow = x === 1 && y >= 1;
              blocks.push({
                id: `u-${x}-${y}-${z}`, x, y, z,
                color: isHollow ? '#94a3b8' : '#10b981',
                ghost: isHollow,
                label: isHollow ? '缺' : undefined
              });
            }
          }
        }
        fA = '完整大長方體：3 × 2 × 3 = 18 cm³';
        fB = '中間挖空凹洞：1 × 2 × 2 = 4 cm³';
        fTotal = '體積 = 18 - 4 = 14 立方公分';
      } else {
        for (let x = 0; x < 3; x++) {
          for (let y = 0; y < 3; y++) {
            for (let z = 0; z < 2; z++) {
              if (x === 1 && y >= 1) continue;
              const isSide = x !== 1;
              blocks.push({ id: `u-${x}-${y}-${z}`, x, y, z, color: isSide ? '#3b82f6' : '#ec4899' });
            }
          }
        }
        fA = '左右兩根立柱：(1 × 2 × 3) × 2 = 12 cm³';
        fB = '中間底板：1 × 2 × 1 = 2 cm³';
        fTotal = '體積 = 12 + 2 = 14 立方公分';
      }
    } else {
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          for (let z = 0; z < 2; z++) {
            const isPresent = y <= (2 - x);
            if (strategy === 'fill') {
              blocks.push({
                id: `st-${x}-${y}-${z}`, x, y, z,
                color: isPresent ? '#f59e0b' : '#94a3b8',
                ghost: !isPresent,
                label: !isPresent ? '補' : undefined
              });
            } else if (isPresent) {
              const col = y === 0 ? '#3b82f6' : y === 1 ? '#10b981' : '#f59e0b';
              blocks.push({ id: `st-${x}-${y}-${z}`, x, y, z, color: col });
            }
          }
        }
      }
      if (strategy === 'fill') {
        fA = '補滿大方塊：3 × 2 × 3 = 18 cm³';
        fB = '減去缺少的積木：6 cm³';
        fTotal = '體積 = 18 - 6 = 12 立方公分';
      } else {
        fA = '第1層底座：3 × 2 × 1 = 6 cm³';
        fB = '第2層(4cm³) + 第3層(2cm³)';
        fTotal = '體積 = 6 + 4 + 2 = 12 立方公分';
      }
    }
    return { blocks, fA, fB, fTotal };
  }

  const renderer = new BlockRenderer3D(container, {
    blocks: getCompositeData().blocks,
    colorMode: 'custom',
    showLabels: false,
    gridSize: { x: 6, z: 5 }
  });
  tabRenderers['composite'] = renderer;

  function update() {
    const data = getCompositeData();
    renderer.setOptions({
      blocks: data.blocks,
      showLabels: strategy === 'fill'
    });
    document.getElementById('comp-formula-a').textContent = data.fA;
    document.getElementById('comp-formula-b').textContent = data.fB;
    document.getElementById('comp-formula-total').textContent = data.fTotal;
    document.getElementById('comp-strategy-label').textContent = strategy === 'fill' ? '補齊法（大減小）' : '切割法（分段加）';
  }

  // Shape buttons
  document.querySelectorAll('.btn-comp-shape').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlockAddSound();
      shape = btn.dataset.shape;
      document.querySelectorAll('.btn-comp-shape').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      const btnH = document.getElementById('btn-comp-strat-h');
      if (shape !== 'l-shape' && strategy === 'split-h') {
        strategy = 'split-v';
        document.querySelectorAll('.btn-comp-strat').forEach(b => b.classList.remove('selected'));
        document.querySelector('.btn-comp-strat[data-strat="split-v"]').classList.add('selected');
      }
      btnH.style.display = shape === 'l-shape' ? 'flex' : 'none';
      update();
    });
  });

  // Strategy buttons
  document.querySelectorAll('.btn-comp-strat').forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound();
      strategy = btn.dataset.strat;
      document.querySelectorAll('.btn-comp-strat').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      update();
    });
  });

  // Read button
  const btnRead = document.getElementById('btn-read-composite');
  let isReading = false;
  btnRead.addEventListener('click', () => {
    if (isReading) {
      stopSpeaking();
      isReading = false;
      btnRead.classList.remove('reading');
      btnRead.querySelector('span').textContent = '聽小老師解說';
    } else {
      isReading = true;
      btnRead.classList.add('reading');
      btnRead.querySelector('span').textContent = '正在解說...';
      const text = strategy === 'fill'
        ? '這是補齊法：我們先把缺角的凹洞補起來，變成一個完整的大長方體，算完大長方體的體積後，再減掉剛才補上的缺角體積，答案就出來了！'
        : '這是切割法：我們拿一把雷射刀，把奇怪的形狀切成兩個規律的長方體，分別算出體積後相加，答案就出來了！';
      speakText(text, null, () => {
        isReading = false;
        btnRead.classList.remove('reading');
        btnRead.querySelector('span').textContent = '聽小老師解說';
      });
    }
  });

  // Next tab
  document.getElementById('btn-next-composite').addEventListener('click', () => switchTab('builder'));
}

// ---------------- TAB 5: 自由建造室 ----------------
function initTabBuilder() {
  const container = document.getElementById('canvas-builder');
  let blocks = [
    { id: 'b0', x: 2, y: 0, z: 2, color: '#3b82f6' },
    { id: 'b1', x: 2, y: 1, z: 2, color: '#10b981' },
    { id: 'b2', x: 3, y: 0, z: 2, color: '#3b82f6' }
  ];
  let selectedColor = '#3b82f6';
  let toolMode = 'build';

  const PRESETS = {
    heart: [
      { x: 2, y: 0, z: 2, color: '#ec4899' }, { x: 1, y: 1, z: 2, color: '#ec4899' },
      { x: 2, y: 1, z: 2, color: '#ec4899' }, { x: 3, y: 1, z: 2, color: '#ec4899' },
      { x: 0, y: 2, z: 2, color: '#ec4899' }, { x: 1, y: 2, z: 2, color: '#ec4899' },
      { x: 2, y: 2, z: 2, color: '#ec4899' }, { x: 3, y: 2, z: 2, color: '#ec4899' },
      { x: 4, y: 2, z: 2, color: '#ec4899' }, { x: 0, y: 3, z: 2, color: '#ec4899' },
      { x: 1, y: 3, z: 2, color: '#ec4899' }, { x: 3, y: 3, z: 2, color: '#ec4899' },
      { x: 4, y: 3, z: 2, color: '#ec4899' }
    ],
    puppy: [
      { x: 1, y: 0, z: 1, color: '#f59e0b' }, { x: 3, y: 0, z: 1, color: '#f59e0b' },
      { x: 1, y: 0, z: 3, color: '#f59e0b' }, { x: 3, y: 0, z: 3, color: '#f59e0b' },
      { x: 1, y: 1, z: 1, color: '#f59e0b' }, { x: 2, y: 1, z: 1, color: '#f59e0b' },
      { x: 3, y: 1, z: 1, color: '#f59e0b' }, { x: 1, y: 1, z: 2, color: '#f59e0b' },
      { x: 2, y: 1, z: 2, color: '#f59e0b' }, { x: 3, y: 1, z: 2, color: '#f59e0b' },
      { x: 1, y: 1, z: 3, color: '#f59e0b' }, { x: 2, y: 1, z: 3, color: '#f59e0b' },
      { x: 3, y: 1, z: 3, color: '#f59e0b' }, { x: 1, y: 2, z: 1, color: '#f59e0b' },
      { x: 2, y: 2, z: 1, color: '#f59e0b' }, { x: 1, y: 3, z: 1, color: '#b45309' },
      { x: 2, y: 3, z: 1, color: '#b45309' }, { x: 2, y: 2, z: 3, color: '#b45309' }
    ],
    castle: [
      { x: 1, y: 0, z: 1, color: '#3b82f6' }, { x: 2, y: 0, z: 1, color: '#3b82f6' }, { x: 3, y: 0, z: 1, color: '#3b82f6' },
      { x: 1, y: 0, z: 2, color: '#3b82f6' }, { x: 2, y: 0, z: 2, color: '#3b82f6' }, { x: 3, y: 0, z: 2, color: '#3b82f6' },
      { x: 1, y: 0, z: 3, color: '#3b82f6' }, { x: 2, y: 0, z: 3, color: '#3b82f6' }, { x: 3, y: 0, z: 3, color: '#3b82f6' },
      { x: 1, y: 1, z: 1, color: '#60a5fa' }, { x: 3, y: 1, z: 1, color: '#60a5fa' },
      { x: 2, y: 1, z: 2, color: '#60a5fa' }, { x: 1, y: 1, z: 3, color: '#60a5fa' },
      { x: 3, y: 1, z: 3, color: '#60a5fa' }, { x: 1, y: 2, z: 1, color: '#93c5fd' },
      { x: 3, y: 2, z: 1, color: '#93c5fd' }, { x: 1, y: 2, z: 3, color: '#93c5fd' },
      { x: 3, y: 2, z: 3, color: '#93c5fd' }
    ],
    robot: [
      { x: 1, y: 0, z: 2, color: '#475569' }, { x: 3, y: 0, z: 2, color: '#475569' },
      { x: 1, y: 1, z: 2, color: '#64748b' }, { x: 3, y: 1, z: 2, color: '#64748b' },
      { x: 1, y: 2, z: 2, color: '#06b6d4' }, { x: 2, y: 2, z: 2, color: '#06b6d4' },
      { x: 3, y: 2, z: 2, color: '#06b6d4' }, { x: 1, y: 3, z: 2, color: '#06b6d4' },
      { x: 2, y: 3, z: 2, color: '#06b6d4' }, { x: 3, y: 3, z: 2, color: '#06b6d4' },
      { x: 0, y: 3, z: 2, color: '#38bdf8' }, { x: 4, y: 3, z: 2, color: '#38bdf8' },
      { x: 2, y: 4, z: 2, color: '#f59e0b' }
    ]
  };

  const renderer = new BlockRenderer3D(container, {
    blocks,
    colorMode: 'custom',
    gridSize: { x: 6, z: 6 },
    allowLayerExplode: true,
    emptyText: '點擊地板格線放第一顆積木！',
    onEmptyGridClick: (gx, gz) => {
      if (toolMode === 'delete') return;
      const exists = blocks.some(b => b.x === gx && b.y === 0 && b.z === gz);
      if (!exists) {
        playBlockAddSound();
        blocks.push({ id: `b-${Date.now()}-${Math.random()}`, x: gx, y: 0, z: gz, color: selectedColor });
        update();
      }
    },
    onBlockClick: (block, faceName) => {
      if (toolMode === 'delete') {
        playBlockRemoveSound();
        blocks = blocks.filter(b => b.id !== block.id);
        update();
        return;
      }
      let nx = block.x, ny = block.y, nz = block.z;
      if (faceName === 'top') ny += 1;
      else if (faceName === 'bottom') ny -= 1;
      else if (faceName === 'front') nz += 1;
      else if (faceName === 'back') nz -= 1;
      else if (faceName === 'right') nx += 1;
      else if (faceName === 'left') nx -= 1;

      if (nx < 0 || nx > 5 || nz < 0 || nz > 5 || ny < 0 || ny > 5) return;
      if (blocks.some(b => b.x === nx && b.y === ny && b.z === nz)) return;

      playBlockAddSound();
      blocks.push({ id: `b-${Date.now()}-${Math.random()}`, x: nx, y: ny, z: nz, color: selectedColor });
      update();
    }
  });
  tabRenderers['builder'] = renderer;

  function update() {
    renderer.setBlocks(blocks);
    document.getElementById('builder-total-badge').textContent = `${blocks.length} cm³`;

    // Layer stats
    const stats = {};
    blocks.forEach(b => { stats[b.y] = (stats[b.y] || 0) + 1; });
    const statsContainer = document.getElementById('builder-layer-stats');
    const layers = Object.keys(stats).sort((a,b) => Number(a)-Number(b));
    if (layers.length === 0) {
      statsContainer.innerHTML = '<span style="color:#94a3b8">尚未放置積木</span>';
    } else {
      statsContainer.innerHTML = layers.map(l =>
        `<span style="padding:4px 8px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-weight:700">第 ${Number(l)+1} 層：<b style="color:#d97706">${stats[l]}</b> 個</span>`
      ).join('');
    }
  }

  // Tool mode toggle
  const btnBuild = document.getElementById('btn-tool-build');
  const btnDelete = document.getElementById('btn-tool-delete');
  btnBuild.addEventListener('click', () => {
    playClickSound();
    toolMode = 'build';
    btnBuild.className = 'btn-toggle-feature active';
    btnDelete.className = 'btn-toggle-feature';
  });
  btnDelete.addEventListener('click', () => {
    playClickSound();
    toolMode = 'delete';
    btnDelete.className = 'btn-toggle-feature active';
    btnBuild.className = 'btn-toggle-feature';
  });

  // Clear all
  document.getElementById('btn-builder-clear').addEventListener('click', () => {
    playBlockRemoveSound();
    blocks = [];
    update();
  });

  // Palette dots
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      playClickSound();
      selectedColor = dot.dataset.color;
      document.querySelectorAll('.color-dot').forEach(d => d.classList.remove('active'));
      dot.classList.add('active');
      toolMode = 'build';
      btnBuild.className = 'btn-toggle-feature active';
      btnDelete.className = 'btn-toggle-feature';
    });
  });

  // Preset buttons
  document.querySelectorAll('.btn-preset-card').forEach(btn => {
    btn.addEventListener('click', () => {
      playBlockAddSound();
      const pKey = btn.dataset.preset;
      if (PRESETS[pKey]) {
        blocks = PRESETS[pKey].map((b, idx) => ({ ...b, id: `p-${idx}` }));
        update();
      }
    });
  });

  // Next tab
  document.getElementById('btn-next-builder').addEventListener('click', () => switchTab('quiz'));
  update();
}

// ---------------- TAB 6: 冒險闖關大挑戰 ----------------
function initTabQuiz() {
  const container = document.getElementById('canvas-quiz');
  let currentIdx = 0;
  let selectedOption = null;
  let isAnswered = false;
  let showHint = false;

  const renderer = new BlockRenderer3D(container, {
    blocks: QUIZ_QUESTIONS[0].blocks,
    colorMode: 'layer',
    allowLayerExplode: true,
    allowXRay: true,
    gridSize: { x: 6, z: 6 }
  });
  tabRenderers['quiz'] = renderer;

  function renderQuestion() {
    const q = QUIZ_QUESTIONS[currentIdx];
    renderer.setBlocks(q.blocks);

    document.getElementById('quiz-badge').textContent = q.badge;
    document.getElementById('quiz-step-info').textContent = `第 ${currentIdx + 1} / ${QUIZ_QUESTIONS.length} 題`;
    document.getElementById('quiz-progress-bar').style.width = `${((currentIdx + 1) / QUIZ_QUESTIONS.length) * 100}%`;
    document.getElementById('quiz-question-title').textContent = `${q.title}：${q.questionText}`;

    // Options
    const optContainer = document.getElementById('quiz-options-container');
    optContainer.innerHTML = '';
    q.options.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 'btn-quiz-opt';
      btn.innerHTML = `<span class="opt-val">${opt}</span><span class="opt-unit">${q.unit}</span>`;
      btn.addEventListener('click', () => handleOptionSelect(opt));
      optContainer.appendChild(btn);
    });

    document.getElementById('quiz-feedback-box').style.display = 'none';
    document.getElementById('quiz-hint-card').style.display = 'none';
    document.getElementById('btn-next-question').style.display = 'none';
    showHint = false;
    isAnswered = false;
    selectedOption = null;
  }

  function handleOptionSelect(opt) {
    if (isAnswered) return;
    isAnswered = true;
    selectedOption = opt;
    const q = QUIZ_QUESTIONS[currentIdx];
    const isCorrect = (opt === q.correctAnswer);

    // Style option buttons
    const optButtons = document.querySelectorAll('.btn-quiz-opt');
    optButtons.forEach(btn => {
      btn.disabled = true;
      const val = parseInt(btn.querySelector('.opt-val').textContent);
      if (val === q.correctAnswer) {
        btn.classList.add('opt-correct');
      } else if (val === opt) {
        btn.classList.add('opt-wrong');
      } else {
        btn.classList.add('opt-dim');
      }
    });

    const feedback = document.getElementById('quiz-feedback-box');
    feedback.style.display = 'block';

    if (isCorrect) {
      playSuccessSound();
      quizScore += 10;
      document.getElementById('quiz-score-display').textContent = `目前得分：${quizScore} 分`;
      document.getElementById('header-quiz-score').textContent = `★ ${quizScore} 分`;
      launchConfetti(80);
      feedback.className = 'callout-box callout-blue';
      feedback.innerHTML = `
        <div style="font-weight:900;margin-bottom:6px;color:#065f46">🎉 太棒了！答對了！+10分</div>
        <div>${q.explanation}</div>
        <div style="margin-top:6px;font-family:monospace;font-weight:800;color:#047857">📐 算式：${q.formulaStep}</div>
      `;
    } else {
      playIncorrectSound();
      feedback.className = 'callout-box callout-amber';
      feedback.innerHTML = `
        <div style="font-weight:900;margin-bottom:6px;color:#b45309">哎呀差一點點！正確答案是 ${q.correctAnswer} ${q.unit}</div>
        <div>${q.explanation}</div>
        <div style="margin-top:6px;font-family:monospace;font-weight:800;color:#92400e">📐 算式：${q.formulaStep}</div>
      `;
    }

    const nextBtn = document.getElementById('btn-next-question');
    nextBtn.style.display = 'flex';
    nextBtn.querySelector('span').textContent = (currentIdx < QUIZ_QUESTIONS.length - 1) ? '前進下一關！' : '查看最終榮譽成績';
  }

  // Next Question Button
  document.getElementById('btn-next-question').addEventListener('click', () => {
    playClickSound();
    if (currentIdx < QUIZ_QUESTIONS.length - 1) {
      currentIdx++;
      renderQuestion();
    } else {
      // Completed all!
      showCompletionScreen();
    }
  });

  // Hint Toggle
  document.getElementById('btn-toggle-quiz-hint').addEventListener('click', () => {
    playClickSound();
    showHint = !showHint;
    const card = document.getElementById('quiz-hint-card');
    card.style.display = showHint ? 'block' : 'none';
    card.textContent = `💡 解題提示：${QUIZ_QUESTIONS[currentIdx].hint}`;
  });

  // Read Question
  const btnRead = document.getElementById('btn-read-quiz');
  let isReading = false;
  btnRead.addEventListener('click', () => {
    if (isReading) {
      stopSpeaking();
      isReading = false;
      btnRead.classList.remove('reading');
      btnRead.querySelector('span').textContent = '讀題目';
    } else {
      isReading = true;
      btnRead.classList.add('reading');
      btnRead.querySelector('span').textContent = '朗讀中';
      const q = QUIZ_QUESTIONS[currentIdx];
      const text = `${q.title}。${q.questionText}`;
      speakText(text, null, () => {
        isReading = false;
        btnRead.classList.remove('reading');
        btnRead.querySelector('span').textContent = '讀題目';
      });
    }
  });

  function showCompletionScreen() {
    launchConfetti(150);
    document.getElementById('quiz-stage-area').style.display = 'none';
    const compScreen = document.getElementById('quiz-completion-screen');
    compScreen.style.display = 'block';

    const starCount = quizScore >= 90 ? 3 : quizScore >= 60 ? 2 : 1;
    document.getElementById('quiz-stars-display').innerHTML = [1, 2, 3].map(s =>
      `<span style="color:${s <= starCount ? '#f59e0b' : '#cbd5e1'};margin:0 4px">★</span>`
    ).join('');

    document.getElementById('quiz-final-score').textContent = quizScore;
    document.getElementById('quiz-final-comment').textContent = quizScore >= 90
      ? '太神了！滿分級別的空間立體思維！'
      : '很棒的表現！多練習幾次會更熟練喔！';
  }

  // Restart Quiz
  document.getElementById('btn-quiz-retry').addEventListener('click', () => {
    playClickSound();
    currentIdx = 0;
    quizScore = 0;
    document.getElementById('quiz-score-display').textContent = `目前得分：0 分`;
    document.getElementById('header-quiz-score').textContent = `★ 0 分`;
    document.getElementById('quiz-stage-area').style.display = 'block';
    document.getElementById('quiz-completion-screen').style.display = 'none';
    renderQuestion();
  });

  document.getElementById('btn-quiz-review').addEventListener('click', () => {
    switchTab('concept');
  });

  renderQuestion();
}

// Bind Floating 3D Controls
function bindCanvasControls() {
  document.querySelectorAll('.canvas-frame').forEach(frame => {
    const tabName = frame.dataset.tab;
    const getR = () => tabRenderers[tabName];

    // Presets
    frame.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
        const r = getR();
        if (r) {
          playClickSound();
          r.setPreset(btn.dataset.view);
          frame.querySelectorAll('.btn-preset').forEach(b => b.classList.remove('active-preset'));
          btn.classList.add('active-preset');
        }
      });
    });

    // Zoom & Reset
    const btnZoomIn = frame.querySelector('.btn-zoom-in');
    const btnZoomOut = frame.querySelector('.btn-zoom-out');
    const btnReset = frame.querySelector('.btn-reset-view');

    if (btnZoomIn) btnZoomIn.addEventListener('click', () => {
      const r = getR();
      if (r) { playClickSound(); r.zoom = Math.min(2.3, r.zoom + 0.15); r.draw(); }
    });
    if (btnZoomOut) btnZoomOut.addEventListener('click', () => {
      const r = getR();
      if (r) { playClickSound(); r.zoom = Math.max(0.6, r.zoom - 0.15); r.draw(); }
    });
    if (btnReset) btnReset.addEventListener('click', () => {
      const r = getR();
      if (r) { playClickSound(); r.resetView(); }
    });

    // X-Ray Toggle
    const btnXRay = frame.querySelector('.btn-toggle-xray');
    if (btnXRay) btnXRay.addEventListener('click', () => {
      const r = getR();
      if (r) {
        playClickSound();
        r.isXRay = !r.isXRay;
        btnXRay.classList.toggle('active', r.isXRay);
        btnXRay.querySelector('.xray-text').textContent = r.isXRay ? '透視眼 開' : '透視眼 關';
        r.draw();
      }
    });

    // Grid Toggle
    const btnGrid = frame.querySelector('.btn-toggle-grid');
    if (btnGrid) btnGrid.addEventListener('click', () => {
      const r = getR();
      if (r) {
        playClickSound();
        r.showGrid = !r.showGrid;
        btnGrid.classList.toggle('active', r.showGrid);
        r.draw();
      }
    });

    // Layer Explode Slider
    const rangeExplode = frame.querySelector('.range-explode');
    if (rangeExplode) rangeExplode.addEventListener('input', (e) => {
      const r = getR();
      if (r) {
        r.explodeGap = parseFloat(e.target.value);
        const label = frame.querySelector('.explode-val-label');
        if (label) label.textContent = r.explodeGap > 0 ? `${(r.explodeGap * 10).toFixed(0)}格` : '合';
        r.draw();
      }
    });
  });
}

// Application Startup
document.addEventListener('DOMContentLoaded', () => {
  // Nav tabs listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  initSoundToggle();
  initKnowledgeModal();

  initTabConcept();
  initTabFormula();
  initTabHidden();
  initTabComposite();
  initTabBuilder();
  initTabQuiz();

  bindCanvasControls();
});
