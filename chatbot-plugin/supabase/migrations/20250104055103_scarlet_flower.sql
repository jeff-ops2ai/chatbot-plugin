/*
  # Fix prompts setup

  1. Create Tables (if not exist)
    - llm_providers
    - llm_roles
    - chatbot_prompts

  2. Insert Data
    - Add OpenAI provider and roles
    - Add initial prompts for voice assistant

  3. Create Public View
    - Create view for accessing prompts
*/

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.llm_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.llm_providers NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(provider_id, name)
);

CREATE TABLE IF NOT EXISTS public.chatbot_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots NOT NULL,
  role_id uuid REFERENCES public.llm_roles NOT NULL,
  content text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Insert OpenAI provider if not exists
INSERT INTO public.llm_providers (name)
VALUES ('OpenAI')
ON CONFLICT (name) DO NOTHING;

-- Insert roles if not exist
WITH provider AS (
  SELECT id FROM public.llm_providers WHERE name = 'OpenAI'
)
INSERT INTO public.llm_roles (provider_id, name, description)
VALUES 
  ((SELECT id FROM provider), 'system', 'Sets the behavior of the assistant'),
  ((SELECT id FROM provider), 'user', 'The end-user querying the assistant'),
  ((SELECT id FROM provider), 'assistant', 'The AI assistant responding to the user')
ON CONFLICT (provider_id, name) DO NOTHING;

-- Insert prompts for the voice assistant
INSERT INTO public.chatbot_prompts (chatbot_id, role_id, content, "order")
VALUES 
  -- System prompt
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
  -- Assistant prompt
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

-- Create view for public access to prompts
CREATE OR REPLACE VIEW public.chatbot_prompts_view AS
SELECT 
  cp.chatbot_id,
  lr.name as role,
  cp.content,
  cp.order
FROM public.chatbot_prompts cp
JOIN public.llm_roles lr ON cp.role_id = lr.id
ORDER BY cp.order ASC;

-- Grant access to the view
GRANT SELECT ON public.chatbot_prompts_view TO anon;