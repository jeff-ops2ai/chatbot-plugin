import { config } from './config.js';

(function() {
  const script = document.currentScript;
  const chatbotId = script.getAttribute('data-chatbot-id');
  
  if (!chatbotId) {
    console.error('Missing chatbot ID');
    return;
  }

  // Get Supabase config from meta tags
  const supabaseUrl = config.SUPABASE_URL;
  const supabaseKey = config.SUPABASE_KEY;

  console.log('🎙️ Initializing voice chat widget:', {
    chatbotId,
    supabaseUrl
  });

  // First fetch chatbot config
  fetch(
    `${supabaseUrl}/rest/v1/chatbots?select=*&id=eq.${chatbotId}`,
    {
      headers: {
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    }
  )
  .then(response => {
    if (!response.ok) throw new Error('Failed to fetch chatbot config');
    return response.json();
  })
  .then(([chatbot]) => {
    if (!chatbot) throw new Error('Chatbot not found');

    console.log('📱 Loaded chatbot config:', chatbot);

    // Add Supabase details to chatbot config
    const config = {
      ...chatbot,
      supabaseUrl,
      supabaseKey
    };

    // Create container
    let container = document.getElementById('voice-chat-widget');
    if (!container) {
      container = document.createElement('div');
      container.id = 'voice-chat-widget';
      document.body.appendChild(container);
    }

    // Load and initialize widget
    import('./widget/voice-chat-widget.js')
      .then(module => {
        console.log('🔧 Creating widget instance');
        new module.VoiceChatWidget(container, config);
      })
      .catch(error => {
        console.error('Failed to load widget:', error);
      });
  })
  .catch(error => {
    console.error('Failed to initialize widget:', error);
  });
})();
