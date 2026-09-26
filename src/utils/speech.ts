// Web Speech API for reading questions and explanations aloud to 4th grade students

let isSpeaking = false;

export function speakText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from symbols/markdown
  const clean = text.replace(/[*#_`]/g, '').replace(/\bcm³\b/gi, '立方公分');

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.rate = 0.95; // Slightly slower and clear for elementary school kids
  utterance.pitch = 1.1; // Friendly tone

  // Attempt to find a Traditional Chinese / Mandarin voice
  const voices = window.speechSynthesis.getVoices();
  const twVoice = voices.find(v => v.lang === 'zh-TW' || v.lang.includes('TW') || v.name.includes('Yating') || v.name.includes('Hanhan') || v.name.includes('Mei-Jia'));
  const zhVoice = voices.find(v => v.lang.startsWith('zh'));

  if (twVoice) {
    utterance.voice = twVoice;
  } else if (zhVoice) {
    utterance.voice = zhVoice;
  } else {
    utterance.lang = 'zh-TW';
  }

  utterance.onstart = () => {
    isSpeaking = true;
  };
  utterance.onend = () => {
    isSpeaking = false;
    onEnd?.();
  };
  utterance.onerror = () => {
    isSpeaking = false;
    onEnd?.();
  };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    isSpeaking = false;
  }
}

export function isCurrentlySpeaking() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking;
}
