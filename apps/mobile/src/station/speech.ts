import * as Speech from 'expo-speech';

/** Persian voice request; installed voices differ per device, so the platform may fall back to its default. */
const LANGUAGE = 'fa-IR';

/** Reads a lesson line aloud (restarts if it is already speaking). Never throws: audio is a help, not a gate. */
export function speakFa(text: string): void {
  try {
    void Speech.stop();
    Speech.speak(text, { language: LANGUAGE });
  } catch {
    // Speech engine unavailable: the line stays readable in the bubble.
  }
}

export function stopSpeaking(): void {
  try {
    void Speech.stop();
  } catch {
    // Nothing to stop.
  }
}
