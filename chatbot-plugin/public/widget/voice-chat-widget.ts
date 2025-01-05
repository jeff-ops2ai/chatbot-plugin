import { OpenAIClient } from './modules/OpenAIClient';
import { SupabaseClient } from './modules/SupabaseClient';
import { AudioManager } from './modules/audio';
import { SpeechManager } from './modules/speech';
import { WidgetUI } from './modules/ui';
import { VoiceChatWidget } from './modules/VoiceChatWidget';

(async function() {
  const script = document.currentScript as HTMLScriptElement;
  const chatbotId = script.getAttribute('data-chatbot-id');
  
  if (!chatbotId) {
    console.error('Missing chatbot ID');
    return;
  }

  try {
    const supabase = new SupabaseClient();
    
    // Get chatbot configuration and prompts
    const [config, prompts] = await Promise.all([
      supabase.getChatbotConfig(chatbotId),
      supabase.getChatbotPrompts(chatbotId)
    ]);

    // Initialize OpenAI client with prompts
    const openai = new OpenAIClient(config.api_key);
    await openai.initialize(prompts);

    // Create container
    const container = document.createElement('div');
    container.id = 'voice-chat-widget';
    document.body.appendChild(container);

    // Initialize components
    const audio = new AudioManager();
    const speech = new SpeechManager(config.language);
    const ui = new WidgetUI(container);

    // Initialize widget
    new VoiceChatWidget(container, {
      config,
      openai,
      audio,
      speech,
      ui
    });
  } catch (error) {
    console.error('Failed to initialize voice chat widget:', error);
  }
})();