// Speech recognition module
export class SpeechManager {
  constructor(language) {
    console.log('🎤 [SpeechManager] Initializing with language:', language);
    
    if (!('webkitSpeechRecognition' in window)) {
      console.error('🎤 [SpeechManager] Speech recognition not supported in this browser');
      throw new Error('Speech recognition not supported');
    }
    
    this.recognition = new webkitSpeechRecognition();
    this.setupRecognition(language);
    console.log('🎤 [SpeechManager] Initialized successfully');
  }

  setupRecognition(language) {
    console.log('🎤 [SpeechManager] Setting up recognition with config:', {
      language,
      continuous: false,
      interimResults: false
    });
    
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = language;

    this.recognition.onaudiostart = () => {
      console.log('🎤 [SpeechManager] Audio capture started');
    };

    this.recognition.onaudioend = () => {
      console.log('🎤 [SpeechManager] Audio capture ended');
    };

    this.recognition.onsoundstart = () => {
      console.log('🎤 [SpeechManager] Sound detected');
    };

    this.recognition.onsoundend = () => {
      console.log('🎤 [SpeechManager] Sound ended');
    };

    this.recognition.onspeechstart = () => {
      console.log('🎤 [SpeechManager] Speech started');
    };

    this.recognition.onspeechend = () => {
      console.log('🎤 [SpeechManager] Speech ended');
    };

    this.recognition.onerror = (event) => {
      console.error('🎤 [SpeechManager] Error:', event.error);
    };

    this.recognition.onnomatch = () => {
      console.warn('🎤 [SpeechManager] No speech was recognized');
    };
  }

  start() {
    console.log('🎤 [SpeechManager] Starting speech recognition');
    this.recognition.start();
  }

  stop() {
    console.log('🎤 [SpeechManager] Stopping speech recognition');
    this.recognition.stop();
  }

  onResult(callback) {
    console.log('🎤 [SpeechManager] Setting up result callback');
    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('🎤 [SpeechManager] Speech recognized:', transcript);
      callback(transcript);
    };
  }
}