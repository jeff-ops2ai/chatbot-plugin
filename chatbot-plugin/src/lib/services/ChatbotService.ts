import { supabase } from '../supabase';
import { getChatCompletion, generateSpeech } from '../api/openai';
import type { Chatbot, ChatbotPrompt } from '../../types/chatbot';

export class ChatbotService {
  private chatbot: Chatbot;
  private prompts: ChatbotPrompt[] = [];

  constructor(chatbot: Chatbot) {
    this.chatbot = chatbot;
  }

  async initialize() {
    const { data, error } = await supabase
      .from('chatbot_prompts_view')
      .select('*')
      .eq('chatbot_id', this.chatbot.id)
      .order('order');

    if (error) throw error;
    this.prompts = data || [];

    console.log('Initialized chatbot with prompts:', this.prompts);
  }

  async processMessage(userMessage: string): Promise<ArrayBuffer> {
    // Prepare messages array with prompts and user message
    const messages = [
      ...this.prompts.map(p => ({
        role: p.role,
        content: p.content
      })),
      { role: 'user', content: userMessage }
    ];

    // Get chat completion
    const response = await getChatCompletion(
      this.chatbot.api_key,
      this.chatbot.model,
      messages
    );

    // Generate speech from response
    return generateSpeech(
      this.chatbot.api_key,
      this.chatbot.voice,
      response
    );
  }
}