import type { ChatMessage } from '../types';

export class OpenAIService {
  constructor(private apiKey: string) {}

  async getChatCompletion(model: string, messages: ChatMessage[]): Promise<string> {
    console.log('🔄 Getting chat completion:', { model, messages });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to get chat completion');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async generateSpeech(voice: string, text: string): Promise<ArrayBuffer> {
    console.log('🔊 Generating speech:', { voice, text });

    const response = await fetch('https://api.openai.com/v1/audio/speech', {
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

    if (!response.ok) {
      const error = await response.json();
      console.error('OpenAI API error:', error);
      throw new Error('Failed to generate speech');
    }

    return response.arrayBuffer();
  }
}