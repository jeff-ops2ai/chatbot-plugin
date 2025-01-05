import { ChatbotService } from './services/ChatbotService';
import { AudioManager } from './audio';
import { SpeechManager } from './speech';
import { WidgetUI } from './ui';
import type { Chatbot } from './types';

export class VoiceChatWidget {
  private chatbotService: ChatbotService;
  private audio: AudioManager;
  private speech: SpeechManager;
  private ui: WidgetUI;
  private isListening = false;

  constructor(container: HTMLElement, chatbot: Chatbot) {
    console.log('🎙️ Initializing VoiceChatWidget');
    this.chatbotService = new ChatbotService(chatbot);
    this.audio = new AudioManager();
    this.speech = new SpeechManager(chatbot.language);
    this.ui = new WidgetUI(container);

    this.initialize();
  }

  private async initialize() {
    try {
      console.log('🎙️ Starting initialization');
      
      // Initialize audio context (needs user interaction)
      await this.audio.init();
      
      // Initialize chatbot and get greeting
      console.log('🎙️ Getting greeting message');
      const greetingAudio = await this.chatbotService.initialize();
      
      // Play greeting after a short delay
      setTimeout(async () => {
        try {
          console.log('🎙️ Playing greeting');
          await this.audio.playAudio(greetingAudio);
        } catch (error) {
          console.error('Failed to play greeting:', error);
        }
      }, 500);

      this.bindEvents();
      console.log('🎙️ Initialization complete');
    } catch (error) {
      console.error('Failed to initialize voice chat widget:', error);
    }
  }

  private bindEvents() {
    const button = this.ui.getButton();
    if (!button) return;

    button.addEventListener('mousedown', () => {
      if (!this.isListening) {
        this.startListening();
      }
    });

    button.addEventListener('mouseup', () => {
      if (this.isListening) {
        this.stopListening();
      }
    });

    button.addEventListener('mouseleave', () => {
      if (this.isListening) {
        this.stopListening();
      }
    });

    this.speech.onResult(async (transcript) => {
      try {
        console.log('🎙️ Speech detected:', transcript);
        const audioBuffer = await this.chatbotService.processMessage(transcript);
        await this.audio.playAudio(audioBuffer);
      } catch (error) {
        console.error('Error processing speech:', error);
      }
    });
  }

  private startListening() {
    this.isListening = true;
    this.ui.setButtonState(true);
    this.speech.start();
  }

  private stopListening() {
    this.isListening = false;
    this.ui.setButtonState(false);
    this.speech.stop();
  }
}