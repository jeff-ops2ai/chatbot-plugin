class VoiceChatWidget {
  constructor(chatbotId) {
    this.chatbotId = chatbotId;
    this.container = null;
    this.client = null;
    this.recognition = null;
    this.audioContext = null;
    this.config = null;
    
    this.init();
  }

  async init() {
    try {
      // Get configuration
      const response = await fetch(`/api/chatbots/${this.chatbotId}`);
      if (!response.ok) throw new Error('Failed to load configuration');
      
      this.config = await response.json();
      
      // Initialize components
      this.container = document.createElement('div');
      this.container.id = 'voice-chat-widget';
      document.body.appendChild(this.container);
      
      this.recognition = new webkitSpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = this.config.language;
      
      this.audioContext = new AudioContext();
      
      // Render UI and bind events
      this.render();
      this.bindEvents();
    } catch (error) {
      console.error('Failed to initialize widget:', error);
    }
  }

  async handleSpeech(transcript) {
    try {
      // Get AI response
      const completion = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [{ role: 'user', content: transcript }]
        })
      });

      if (!completion.ok) throw new Error('Failed to get AI response');
      
      const data = await completion.json();
      const response = data.choices[0].message.content;

      // Convert to speech
      const speech = await fetch('https://api.openai.com/v1/audio/speech', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.api_key}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'tts-1',
          voice: this.config.voice,
          input: response
        })
      });

      if (!speech.ok) throw new Error('Failed to generate speech');

      // Play audio
      const arrayBuffer = await speech.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);
      source.start(0);
    } catch (error) {
      console.error('Error processing speech:', error);
    }
  }

  render() {
    this.container.innerHTML = `
      <button id="voice-chat-button" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #2563eb;
        color: white;
        border: none;
        cursor: pointer;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
          <line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>
    `;
  }

  bindEvents() {
    const button = this.container.querySelector('#voice-chat-button');
    if (!button) return;

    button.addEventListener('mousedown', () => {
      button.style.background = '#1d4ed8';
      button.style.transform = 'scale(0.95)';
      this.recognition.start();
    });

    button.addEventListener('mouseup', () => {
      button.style.background = '#2563eb';
      button.style.transform = 'scale(1)';
      this.recognition.stop();
    });

    button.addEventListener('mouseleave', () => {
      button.style.background = '#2563eb';
      button.style.transform = 'scale(1)';
      this.recognition.stop();
    });

    this.recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      this.handleSpeech(transcript);
    };
  }
}

// Initialize widget when script loads
(function() {
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  
  if (!chatbotId) {
    console.error('Missing chatbot ID');
    return;
  }

  new VoiceChatWidget(chatbotId);
})();