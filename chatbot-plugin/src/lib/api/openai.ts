import type { ChatbotPrompt } from '../../types/chatbot';

interface ChatMessage {
  role: string;
  content: string;
}

export async function getChatCompletion(apiKey: string, model: string, messages: ChatMessage[]) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
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
    throw new Error('Failed to get chat completion');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateSpeech(apiKey: string, voice: string, text: string): Promise<ArrayBuffer> {
  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice,
      input: text
    })
  });

  if (!response.ok) {
    throw new Error('Failed to generate speech');
  }

  return response.arrayBuffer();
}