(function(window) {
  'use strict';

  // Configuration and constants
  const DEFAULT_CONFIG = {
    containerID: 'ai-voice-chat',
    serverURL: '/.netlify/functions/chat',
    position: 'bottom-right'
  };

  class VoiceChatWidget {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.recognition = null;
      this.synthesis = window.speechSynthesis;
      this.isListening = false;
      this.container = null;
      this.messageList = null;
      this.statusIndicator = null;
      
      this.init();
    }

    init() {
      this.createWidgetDOM();
      this.setupSpeechRecognition();
      this.bindEvents();
    }

    createWidgetDOM() {
      // Create container if it doesn't exist
      this.container = document.getElementById(this.config.containerID);
      if (!this.container) {
        this.container = document.createElement('div');
        this.container.id = this.config.containerID;
        document.body.appendChild(this.container);
      }

      // Add widget HTML
      this.container.innerHTML = `
        <div class="vc-container ${this.config.position}" style="
          position: fixed;
          ${this.getPositionStyles()}
          width: 300px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-family: system-ui, -apple-system, sans-serif;
          overflow: hidden;
          z-index: 9999;
        ">
          <div class="vc-header" style="
            padding: 12px;
            background: #4F46E5;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
          ">
            <span class="vc-title">AI Voice Assistant</span>
            <button class="vc-close" style="
              background: none;
              border: none;
              color: white;
              cursor: pointer;
              font-size: 20px;
              padding: 0;
            ">×</button>
          </div>
          <div class="vc-messages" style="
            height: 300px;
            overflow-y: auto;
            padding: 12px;
          "></div>
          <div class="vc-controls" style="
            padding: 12px;
            border-top: 1px solid #e5e7eb;
            display: flex;
            gap: 8px;
            align-items: center;
          ">
            <button class="vc-start" style="
              padding: 8px 16px;
              background: #4F46E5;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            ">Start</button>
            <button class="vc-stop" style="
              padding: 8px 16px;
              background: #DC2626;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              display: none;
            ">Stop</button>
            <span class="vc-status" style="
              margin-left: 8px;
              font-size: 14px;
              color: #6B7280;
            ">Click Start to begin</span>
          </div>
        </div>
      `;

      // Get DOM elements
      this.messageList = this.container.querySelector('.vc-messages');
      this.statusIndicator = this.container.querySelector('.vc-status');
    }

    getPositionStyles() {
      switch (this.config.position) {
        case 'bottom-right':
          return 'bottom: 20px; right: 20px;';
        case 'bottom-left':
          return 'bottom: 20px; left: 20px;';
        case 'top-right':
          return 'top: 20px; right: 20px;';
        case 'top-left':
          return 'top: 20px; left: 20px;';
        default:
          return 'bottom: 20px; right: 20px;';
      }
    }

    setupSpeechRecognition() {
      if (!('webkitSpeechRecognition' in window)) {
        this.updateStatus('Speech recognition not supported in this browser');
        return;
      }

      const SpeechRecognition = window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;

      this.recognition.onstart = () => {
        this.isListening = true;
        this.updateStatus('Listening...');
        this.toggleControls(true);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.updateStatus('Click Start to begin');
        this.toggleControls(false);
      };

      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        this.addMessage('user', transcript);
        this.getAIResponse(transcript);
      };

      this.recognition.onerror = (event) => {
        this.updateStatus(`Error: ${event.error}`);
        this.toggleControls(false);
      };
    }

    async getAIResponse(message) {
      try {
        this.updateStatus('Getting response...');
        
        const response = await fetch(this.config.serverURL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message })
        });

        if (!response.ok) throw new Error('Server error');
        
        const data = await response.json();
        this.addMessage('assistant', data.response);
        this.speak(data.response);
      } catch (error) {
        this.updateStatus('Error getting response');
        this.addMessage('system', 'Sorry, there was an error processing your request.');
      }
    }

    speak(text) {
      this.synthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      this.synthesis.speak(utterance);
    }

    addMessage(type, text) {
      const messageDiv = document.createElement('div');
      messageDiv.style.cssText = `
        margin: 8px 0;
        padding: 8px 12px;
        border-radius: 4px;
        max-width: 85%;
        ${type === 'user' ? 'margin-left: auto; background: #4F46E5; color: white;' :
          type === 'assistant' ? 'background: #F3F4F6;' :
          'background: #FEE2E2; color: #991B1B;'}
      `;
      messageDiv.textContent = text;
      this.messageList.appendChild(messageDiv);
      this.messageList.scrollTop = this.messageList.scrollHeight;
    }

    updateStatus(text) {
      this.statusIndicator.textContent = text;
    }

    toggleControls(isListening) {
      const startButton = this.container.querySelector('.vc-start');
      const stopButton = this.container.querySelector('.vc-stop');
      startButton.style.display = isListening ? 'none' : 'block';
      stopButton.style.display = isListening ? 'block' : 'none';
    }

    bindEvents() {
      const startButton = this.container.querySelector('.vc-start');
      const stopButton = this.container.querySelector('.vc-stop');
      const closeButton = this.container.querySelector('.vc-close');

      startButton.addEventListener('click', () => {
        if (!this.isListening && this.recognition) {
          this.recognition.start();
        }
      });

      stopButton.addEventListener('click', () => {
        if (this.isListening && this.recognition) {
          this.recognition.stop();
          this.synthesis.cancel();
        }
      });

      closeButton.addEventListener('click', () => {
        if (this.isListening && this.recognition) {
          this.recognition.stop();
        }
        this.synthesis.cancel();
        this.container.remove();
      });
    }
  }

  // Expose to global scope
  window.VoiceChatWidget = VoiceChatWidget;
})(window);