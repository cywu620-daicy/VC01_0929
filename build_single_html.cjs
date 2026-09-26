const fs = require('fs');
const path = require('path');

console.log('Generating standalone index.html...');

const partsDir = path.join(__dirname, 'generator_parts');

const templateHtml = fs.readFileSync(path.join(partsDir, 'main_template.html'), 'utf8');
const stylesCss = fs.readFileSync(path.join(partsDir, 'styles.css'), 'utf8');
const iconsJs = fs.readFileSync(path.join(partsDir, 'icons.js'), 'utf8');
const audioJs = fs.readFileSync(path.join(partsDir, 'audio_and_speech.js'), 'utf8');
const confettiJs = fs.readFileSync(path.join(partsDir, 'confetti.js'), 'utf8');
const engineJs = fs.readFileSync(path.join(partsDir, 'engine_3d.js'), 'utf8');
const quizDataJs = fs.readFileSync(path.join(partsDir, 'quiz_data.js'), 'utf8');
const tabsLogicJs = fs.readFileSync(path.join(partsDir, 'tabs_logic.js'), 'utf8');

// Parse ICONS from iconsJs
const iconMatch = iconsJs.match(/const ICONS = {([\s\S]*?)};/);
let iconMap = {};
if (iconMatch) {
  // Execute in isolated function or eval to get object
  iconMap = eval(`({${iconMatch[1]}})`);
}

let resultHtml = templateHtml;

// Replace styles
resultHtml = resultHtml.replace('/* STYLES_PLACEHOLDER */', stylesCss);

// Replace icon placeholders in HTML
resultHtml = resultHtml
  .replace(/__ICON_BOX__/g, iconMap.box || '')
  .replace(/__ICON_LAYERS__/g, iconMap.layers || '')
  .replace(/__ICON_EYE__/g, iconMap.eye || '')
  .replace(/__ICON_PUZZLE__/g, iconMap.puzzle || '')
  .replace(/__ICON_HAMMER__/g, iconMap.hammer || '')
  .replace(/__ICON_TROPHY__/g, iconMap.trophy || '')
  .replace(/__ICON_VOLUME__/g, iconMap.volume || '')
  .replace(/__ICON_VOLUMEX__/g, iconMap.volumeX || '')
  .replace(/__ICON_BOOK__/g, iconMap.book || '')
  .replace(/__ICON_SPARKLES__/g, iconMap.sparkles || '')
  .replace(/__ICON_CHECK__/g, iconMap.check || '')
  .replace(/__ICON_ARROW_RIGHT__/g, iconMap.arrowRight || '')
  .replace(/__ICON_ZOOM_IN__/g, iconMap.zoomIn || '')
  .replace(/__ICON_ZOOM_OUT__/g, iconMap.zoomOut || '')
  .replace(/__ICON_ROTATE_CCW__/g, iconMap.rotateCcw || '')
  .replace(/__ICON_GRID__/g, iconMap.grid || '')
  .replace(/__ICON_PLUS__/g, iconMap.plus || '')
  .replace(/__ICON_TRASH__/g, iconMap.trash || '')
  .replace(/__ICON_HELP__/g, iconMap.help || '')
  .replace(/__ICON_CLOSE__/g, iconMap.close || '')
  .replace(/__ICON_DROPLET__/g, iconMap.droplet || '')
  .replace(/__ICON_LIGHTBULB__/g, iconMap.lightbulb || '');

// Combine all JS
const combinedJs = `
${iconsJs}

${audioJs}

${confettiJs}

${engineJs}

${quizDataJs}

${tabsLogicJs}
`;

resultHtml = resultHtml.replace('/* SCRIPTS_PLACEHOLDER */', combinedJs);

// Write to /index.html
fs.writeFileSync(path.join(__dirname, 'index.html'), resultHtml, 'utf8');

console.log('Successfully generated /index.html! File size:', resultHtml.length, 'bytes');
