// Common constants
export const LOG_MODULES = {
  AUDIO: 'AudioManager',
  SPEECH: 'SpeechManager',
  UI: 'WidgetUI',
  OPENAI: 'OpenAIClient',
  SUPABASE: 'SupabaseClient',
  WIDGET: 'VoiceChatWidget'
} as const;

export const ERRORS = {
  SPEECH_NOT_SUPPORTED: 'Speech recognition not supported in this browser',
  CONFIG_LOAD_FAILED: 'Failed to load chatbot configuration',
  CHATBOT_NOT_FOUND: 'Chatbot not found',
  PROMPTS_LOAD_FAILED: 'Failed to load prompts',
  OPENAI_API_ERROR: 'OpenAI API error',
  NO_RESPONSE: 'No response from OpenAI',
  SPEECH_GENERATION_FAILED: 'Failed to generate speech'
} as const;