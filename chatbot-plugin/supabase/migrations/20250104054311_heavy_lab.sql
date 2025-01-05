/*
  # Add chatbot prompts for existing chatbot

  This migration adds initial prompts for the existing chatbot with system and assistant roles.
*/

-- Insert prompts for the existing chatbot
INSERT INTO public.chatbot_prompts (chatbot_id, role_id, content, "order")
VALUES 
  -- System prompt (order 0)
  (
    '34361081-5828-4f1d-bbca-2bd8087ed2f7',
    (
      SELECT llm_roles.id 
      FROM llm_roles 
      JOIN llm_providers ON llm_roles.provider_id = llm_providers.id
      WHERE llm_providers.name = 'OpenAI' AND llm_roles.name = 'system'
    ),
    'You are a helpful voice assistant that specializes in clear and concise responses. Keep your answers brief and to the point, as they will be spoken aloud. Use natural, conversational language and avoid technical jargon unless specifically asked.',
    0
  ),
  -- Assistant prompt (order 1)
  (
    '34361081-5828-4f1d-bbca-2bd8087ed2f7',
    (
      SELECT llm_roles.id 
      FROM llm_roles 
      JOIN llm_providers ON llm_roles.provider_id = llm_providers.id
      WHERE llm_providers.name = 'OpenAI' AND llm_roles.name = 'assistant'
    ),
    'I am a voice assistant ready to help you with any questions or tasks. I will keep my responses clear and concise.',
    1
  )
ON CONFLICT DO NOTHING;