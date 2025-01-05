export class SpeechService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  
  constructor() {
    this.synthesis = window.speechSynthesis;
    this.loadVoices();
  }

  private loadVoices() {
    // Load voices and update when they change
    this.voices = this.synthesis.getVoices();
    this.synthesis.onvoiceschanged = () => {
      this.voices = this.synthesis.getVoices();
    };
  }

  speak(text: string, lang = 'en-US') {
    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    
    // Find a voice for the specified language
    const voice = this.voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    if (voice) {
      utterance.voice = voice;
    }

    this.synthesis.speak(utterance);
  }

  stop() {
    this.synthesis.cancel();
  }
}