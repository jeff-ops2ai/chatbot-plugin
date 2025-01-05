import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config';
import { SupabaseLogger } from './utils/supabase-logger';
import { LOG_MODULES } from './utils/constants';
import type { ChatbotConfig, ChatbotPrompt } from './types';

export class SupabaseClient {
  private headers: HeadersInit;
  private readonly MODULE = LOG_MODULES.SUPABASE;

  constructor() {
    this.headers = {
      'apikey': SUPABASE_ANON_KEY,
      'Content-Type': 'application/json'
    };
    console.log(`🔌 [${this.MODULE}] Initialized Supabase client`);
  }

  async getChatbotConfig(chatbotId: string): Promise<ChatbotConfig> {
    console.log(`
╔════════════════════════════════════════╗
║         FETCHING CHATBOT CONFIG        ║
╚════════════════════════════════════════╝

Chatbot ID: ${chatbotId}
    `);

    const url = `${SUPABASE_URL}/rest/v1/chatbots?select=id,api_key,model,voice,language&id=eq.${chatbotId}`;
    
    try {
      const response = await fetch(url, { headers: this.headers });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch config: ${response.statusText}`);
      }

      const [config] = await response.json();
      
      if (!config) {
        throw new Error('Chatbot not found');
      }

      console.log(`
Config loaded successfully:
- Model: ${config.model}
- Voice: ${config.voice}
- Language: ${config.language}
- API Key: ${config.api_key.slice(0, 4)}...${config.api_key.slice(-4)}
      `);

      return config;
    } catch (error) {
      console.error(`[${this.MODULE}] Error fetching config:`, error);
      throw error;
    }
  }

  async getChatbotPrompts(chatbotId: string): Promise<ChatbotPrompt[]> {
    console.log(`
╔════════════════════════════════════════╗
║         FETCHING CHATBOT PROMPTS       ║
╚════════════════════════════════════════╝

Chatbot ID: ${chatbotId}
    `);

    const url = `${SUPABASE_URL}/rest/v1/chatbot_prompts_view?chatbot_id=eq.${chatbotId}&order=order.asc`;
    
    try {
      SupabaseLogger.logRequest(url, this.headers);
      
      const response = await fetch(url, { headers: this.headers });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.statusText}`);
      }

      const prompts = data.map((p: any) => ({
        role: p.role,
        content: p.content,
        order: p.order || 0
      }));

      console.log(`
Fetched ${prompts.length} prompts:
${prompts.map((p, i) => `
[${i}] Role: ${p.role}
    Content: ${p.content}
    Order: ${p.order}
`).join('\n')}
      `);

      return prompts;
    } catch (error) {
      console.error(`[${this.MODULE}] Error fetching prompts:`, error);
      throw error;
    }
  }
}