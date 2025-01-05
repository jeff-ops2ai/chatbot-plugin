// Audio handling module
export class AudioManager {
  constructor() {
    this.context = null;
    console.log('🎵 [AudioManager] Initialized');
  }

  async init() {
    console.log('🎵 [AudioManager] Initializing AudioContext');
    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      console.log('🎵 [AudioManager] Created new AudioContext');
    }
    
    if (this.context.state === 'suspended') {
      console.log('🎵 [AudioManager] Resuming suspended AudioContext');
      await this.context.resume();
      console.log('🎵 [AudioManager] AudioContext resumed successfully');
    }
    
    console.log('🎵 [AudioManager] Initialization complete');
    return this.context;
  }

  async playAudio(arrayBuffer) {
    console.log('🎵 [AudioManager] Starting audio playback');
    await this.init();
    
    console.log('🎵 [AudioManager] Decoding audio data');
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    
    console.log('🎵 [AudioManager] Creating audio source');
    const source = this.context.createBufferSource();
    source.buffer = audioBuffer;
    
    console.log('🎵 [AudioManager] Connecting audio source to destination');
    source.connect(this.context.destination);
    
    console.log('🎵 [AudioManager] Starting audio playback');
    source.start(0);
    
    source.onended = () => {
      console.log('🎵 [AudioManager] Audio playback completed');
    };
  }

  stop() {
    if (this.context) {
      console.log('🎵 [AudioManager] Stopping all audio');
      this.context.close().then(() => {
        console.log('🎵 [AudioManager] AudioContext closed');
        this.context = null;
      });
    }
  }
}