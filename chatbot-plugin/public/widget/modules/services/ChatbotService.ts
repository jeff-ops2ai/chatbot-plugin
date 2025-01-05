import { OpenAIService } from './OpenAIService';
import { Debug } from '../utils/debug';
import type { Chatbot, ChatMessage, ChatbotPrompt } from '../types';

export class ChatbotService {
  private openai: OpenAIService;
  private prompts: ChatbotPrompt[] = [];
  private context: ChatMessage[] = [];

  constructor(private chatbot: Chatbot) {
    this.openai = new OpenAIService(chatbot.api_key);
    Debug.init('ChatbotService initialized', {
      model: chatbot.model,
      voice: chatbot.voice,
      language: chatbot.language
    });
  }

  async initialize() {
    try {
      Debug.init('Fetching prompts from Supabase');
      
      // Fetch prompts from Supabase
      const response = await fetch(
        `${this.chatbot.supabaseUrl}/rest/v1/chatbot_prompts_view?chatbot_id=eq.${this.chatbot.id}&order=order.asc`,
        {
          headers: {
            'apikey': this.chatbot.supabaseKey,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.statusText}`);
      }

      const data = await response.json();
      this.prompts = data;
      
      Debug.prompt('Loaded prompts', this.prompts);
      
      // Initialize context with prompts
      this.context = this.prompts.map(p => ({
        role: p.role,
        content: p.content
      }));

      // Generate and speak initial greeting
      return this.generateGreeting();
    } catch (error) {
      Debug.error('Failed to initialize prompts', error);
      
      // Fallback to default system prompt
      this.context = [{
        role: 'system',
        content: 'You are a helpful voice assistant that specializes in clear and concise responses.'
      }];
      
      return this.generateGreeting();
    }
  }

  private async generateGreeting(): Promise<ArrayBuffer> {
    Debug.init('Generating greeting');
    
    // Add a specific greeting request to the context
    const messages = [
      ...this.context,
      { 
        role: 'user', 
        content: 'Please introduce yourself based on your system prompt and explain how you can help. Keep it brief and friendly.' 
      }
    ];

    Debug.prompt('Greeting context', messages);

    try {
      // Get chat completion for greeting
      const response = await this.openai.getChatCompletion(
        this.chatbot.model,
        messages
      );

      Debug.init('Generated greeting response:', response);

      // Add greeting to context
      this.context.push(
        { role: 'assistant', content: response }
      );

      // Generate speech from response
      return await this.openai.generateSpeech(
        this.chatbot.voice,
        response
      );
    } catch (error) {
      Debug.error('Error generating greeting', error);
      throw error;
    }
  }

  async processMessage(userMessage: string): Promise<ArrayBuffer> {
    Debug.init('Processing message', userMessage);
    
    try {
      // Get chat completion with full context
      const messages = [
        ...this.context,
        { role: 'user', content: userMessage }
      ];

      Debug.prompt('Message context', messages);

      const response = await this.openai.getChatCompletion(
        this.chatbot.model,
        messages
      );

      Debug.init('Got response', response);

      // Add the exchange to context
      this.context.push(
        { role: 'user', content: userMessage },
        { role: 'assistant', content: response }
      );

      // Generate speech from response
      return await this.openai.generateSpeech(
        this.chatbot.voice,
        response
      );
    } catch (error) {
      Debug.error('Error processing message', error);
      throw error;
    }
  }
}