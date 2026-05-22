// Lightweight wrapper around the Web Speech API SpeechSynthesis.
// Works offline on iOS/Android/desktop, no API key needed.

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve([]);
      return;
    }
    const v = window.speechSynthesis.getVoices();
    if (v.length) {
      cachedVoices = v;
      resolve(v);
      return;
    }
    const handler = () => {
      cachedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener("voiceschanged", handler);
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", handler);
    // Fallback timeout
    setTimeout(() => resolve(cachedVoices), 800);
  });
}

function pickVoice(lang: string): SpeechSynthesisVoice | null {
  const list = cachedVoices.length ? cachedVoices : window.speechSynthesis.getVoices();
  if (!list.length) return null;
  const lower = lang.toLowerCase();
  return (
    list.find((v) => v.lang.toLowerCase() === lower) ||
    list.find((v) => v.lang.toLowerCase().startsWith(lower.split("-")[0])) ||
    list.find((v) => v.default) ||
    list[0]
  );
}

export function isSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export async function speak(text: string, opts: { lang?: string; rate?: number; pitch?: number; volume?: number; interrupt?: boolean } = {}): Promise<void> {
  if (!isSpeechSupported()) return;
  const { lang = "en-US", rate = 1, pitch = 1, volume = 1, interrupt = true } = opts;
  await loadVoices();
  if (interrupt) window.speechSynthesis.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(lang);
    if (voice) u.voice = voice;
    u.lang = lang;
    u.rate = rate;
    u.pitch = pitch;
    u.volume = volume;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (!isSpeechSupported()) return;
  window.speechSynthesis.cancel();
}
