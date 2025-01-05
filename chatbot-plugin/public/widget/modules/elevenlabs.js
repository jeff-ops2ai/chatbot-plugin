import { config } from '../config.js';

export class ElevenLabsClient {
  constructor() {
    this.apiKey = config.ELEVENLABS_API_KEY;
    this.voiceId = config.VOICE_ID;
  }

  async generateSpeech(text) {
    const response = await fetch(`${config.ELEVENLABS_API_URL}/text-to-speech/${this.voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) throw new Error('Failed to generate speech');
    return response.arrayBuffer();
  }
} 