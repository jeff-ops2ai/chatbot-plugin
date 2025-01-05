import { config } from '../config.js';

// API communication module
export class APIClient {
  constructor() {
    this.apiKey = config.OPENAI_API_KEY;
  }

  async getChatCompletion(message, model) {
    const response = await fetch(`${config.OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: message }]
      })
    });

    if (!response.ok) throw new Error('Failed to get AI response');
    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateSpeech(text, voice) {
    const response = await fetch(`${config.OPENAI_API_URL}/audio/speech`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'tts-1',
        voice,
        input: text
      })
    });

    if (!response.ok) throw new Error('Failed to generate speech');
    return response.arrayBuffer();
  }
}