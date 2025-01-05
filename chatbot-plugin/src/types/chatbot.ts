export interface Chatbot {
  id: string;
  user_id: string;
  name: string;
  api_key: string;
  model: string;
  voice: string;
  language: string;
  created_at: string;
  updated_at: string;
}

export interface ChatbotPrompt {
  chatbot_id: string;
  role: string;
  content: string;
  order: number;
  created_at: string;
}