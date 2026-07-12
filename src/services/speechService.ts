let activeUtterances: SpeechSynthesisUtterance[] = [];
let isQueueActive = false;

/**
 * Clean up text specifically for text-to-speech narration.
 * We want to strip code blocks, replace inline codes with readable text,
 * and strip raw markdown symbols to prevent them from being spelled out.
 */
export const cleanTextForSpeech = (text: string): string => {
  if (!text) return "";
  
  return text
    // Replace full multiline code blocks with a brief pleasant indicator
    .replace(/```[\s\S]*?```/g, " [showing code block] ")
    // Convert common code markers or inline codes to simple readable text
    .replace(/`([^`]+)`/g, "$1")
    // Clean emojis if necessary or keep them if they don't break speech
    // Strip markdown formatting symbols
    .replace(/[*#_~>+\-]/g, " ")
    // Clean multiple spaces
    .replace(/\s+/g, " ")
    .trim();
};

export const speak = (text: string, onEnd?: () => void) => {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech and empty active queue
  window.speechSynthesis.cancel();
  activeUtterances = [];
  isQueueActive = false;

  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) {
    if (onEnd) onEnd();
    return;
  }

  // Split into sentence-level chunks (approx max 150 chars or split by punctuation)
  // This completely bypasses Chrome's 15-second / 32k character freeze and truncation bug
  const segments = cleaned.match(/[^.!?\n]+[.!?\n]*/g) || [cleaned];
  const filteredSegments = segments
    .map(s => s.trim())
    .filter(s => s.length > 1);

  if (filteredSegments.length === 0) {
    if (onEnd) onEnd();
    return;
  }

  let index = 0;
  isQueueActive = true;

  const speakNext = () => {
    if (!isQueueActive) return;

    if (index >= filteredSegments.length) {
      isQueueActive = false;
      if (onEnd) onEnd();
      return;
    }

    const textToSpeak = filteredSegments[index];
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Dynamically retrieve high quality voices
    const voices = window.speechSynthesis.getVoices();
    
    // Select best candidate English voice
    const targetVoice = voices.find(v => 
      v.name.includes("Google UK English Female") ||
      v.name.includes("Google US English") ||
      v.name.includes("Samantha") ||
      v.name.includes("Zira") ||
      (v.lang.startsWith("en") && (v.name.includes("Female") || v.name.includes("Natural")))
    ) || voices.find(v => v.lang.startsWith("en")) || voices[0];

    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    // Settings optimized for a professional, calm narrator style
    utterance.pitch = 1.02; 
    utterance.rate = 0.98; // Slightly slow and articulate
    utterance.volume = 1.0;

    utterance.onend = () => {
      index++;
      speakNext();
    };

    utterance.onerror = (e) => {
      // If error occurs, keep progressing the queue safely
      console.warn("Speech synthesis utterance error:", e);
      index++;
      speakNext();
    };

    activeUtterances.push(utterance);
    window.speechSynthesis.speak(utterance);
  };

  speakNext();
};

export const stopSpeaking = () => {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    isQueueActive = false;
    window.speechSynthesis.cancel();
    activeUtterances = [];
  }
};
