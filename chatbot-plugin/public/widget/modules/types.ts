export interface Chatbot {
  id: string;
  api_key: string;
  model: string;
  voice: string;
  language: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export interface ChatbotPrompt {
  chatbot_id: string;
  role: string;
  content: string;
  order: number;
}

export interface ChatMessage {
  role: string;
  content: string;
}

export interface WidgetConfig {
  chatbot: Chatbot;
  container: HTMLElement;
}