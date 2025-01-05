import { Logger } from './utils/logger';
import { ErrorHandler } from './utils/error-handler';
import { PerformanceMonitor } from './utils/performance';
import { LOG_MODULES, ERRORS } from './utils/constants';
import type { ChatCompletionMessage } from './types';

export class OpenAIClient {
  private apiKey: string;
  private context: ChatCompletionMessage[] = [];
  private readonly MODULE = LOG_MODULES.OPENAI;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async initialize(prompts: ChatCompletionMessage[]) {
    console.log(`
=================================================================
                    OPENAI CLIENT INITIALIZED                    
=================================================================

Loaded ${prompts.length} prompts:
${prompts.map((p, i) => `
PROMPT ${i + 1}:
  Role: ${p.role}
  Content: ${p.content}
`).join('\n')}
-----------------------------------------------------------------
`);
    
    this.context = prompts;
  }

  async sendMessage(message: string): Promise<string> {
    PerformanceMonitor.start(this.MODULE, 'sendMessage');

    // Add user message to context
    this.context.push({ role: 'user', content: message });

    console.log(`
=================================================================
                    SENDING MESSAGE TO OPENAI                    
=================================================================

USER MESSAGE: "${message}"

FULL CONVERSATION CONTEXT:
${this.context.map((msg, i) => `
MESSAGE ${i + 1}:
  Role: ${msg.role}
  Content: ${msg.content}
`).join('\n')}
-----------------------------------------------------------------
`);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: this.context,
          temperature: 0.7,
          max_tokens: 150
        })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`
=================================================================
                    OPENAI API ERROR                    
=================================================================

Status: ${response.status}
Error: ${JSON.stringify(error, null, 2)}
-----------------------------------------------------------------
`);
        throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const reply = data.choices[0]?.message?.content;

      if (!reply) {
        throw new Error(ERRORS.NO_RESPONSE);
      }

      console.log(`
=================================================================
                    RECEIVED OPENAI RESPONSE                    
=================================================================

RESPONSE: "${reply}"
-----------------------------------------------------------------
`);

      // Add assistant response to context
      this.context.push({ role: 'assistant', content: reply });
      
      PerformanceMonitor.end(this.MODULE, 'sendMessage');
      return reply;
    } catch (error) {
      throw ErrorHandler.handle(this.MODULE, error, 'Failed to send message');
    }
  }

  async generateSpeech(text: string, voice: string): Promise<ArrayBuffer> {
    console.log(`
=================================================================
                    GENERATING SPEECH                    
=================================================================

Text: "${text}"
Voice: ${voice}
-----------------------------------------------------------------
`);

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
      throw new Error(ERRORS.SPEECH_GENERATION_FAILED);
    }

    return response.arrayBuffer();
  }
}