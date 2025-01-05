/*
  # Add LLM roles support
  
  1. New Tables
    - `llm_providers`
      - `id` (uuid, primary key)
      - `name` (text) - e.g., "OpenAI", "Anthropic", etc.
      - `created_at` (timestamptz)
    
    - `llm_roles`
      - `id` (uuid, primary key)
      - `provider_id` (uuid, foreign key)
      - `name` (text) - e.g., "system", "user", "assistant"
      - `description` (text)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on both tables
    - Add policies for read access
*/

-- Create LLM providers table
CREATE TABLE IF NOT EXISTS public.llm_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create LLM roles table
CREATE TABLE IF NOT EXISTS public.llm_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid REFERENCES public.llm_providers NOT NULL,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(provider_id, name)
);

-- Enable RLS
ALTER TABLE public.llm_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.llm_roles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to llm_providers"
  ON public.llm_providers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow read access to llm_roles"
  ON public.llm_roles
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial data for OpenAI
INSERT INTO public.llm_providers (name) 
VALUES ('OpenAI')
ON CONFLICT (name) DO NOTHING;

-- Insert OpenAI roles
WITH provider AS (
  SELECT id FROM public.llm_providers WHERE name = 'OpenAI'
)
INSERT INTO public.llm_roles (provider_id, name, description)
VALUES 
  ((SELECT id FROM provider), 'system', 'Sets the behavior of the assistant'),
  ((SELECT id FROM provider), 'user', 'The end-user querying the assistant'),
  ((SELECT id FROM provider), 'assistant', 'The AI assistant responding to the user'),
  ((SELECT id FROM provider), 'function', 'Used for function calling capabilities')
ON CONFLICT (provider_id, name) DO NOTHING;

-- Insert Anthropic provider and roles
INSERT INTO public.llm_providers (name) 
VALUES ('Anthropic')
ON CONFLICT (name) DO NOTHING;

WITH provider AS (
  SELECT id FROM public.llm_providers WHERE name = 'Anthropic'
)
INSERT INTO public.llm_roles (provider_id, name, description)
VALUES 
  ((SELECT id FROM provider), 'human', 'The end-user querying Claude'),
  ((SELECT id FROM provider), 'assistant', 'Claude responding to the user')
ON CONFLICT (provider_id, name) DO NOTHING;