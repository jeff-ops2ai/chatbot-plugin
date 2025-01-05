/*
  # Add prompts view and policies

  1. Create Tables
    - Create chatbot_prompts table if it doesn't exist
    - Add necessary columns and constraints

  2. Create View
    - Create view for easier access to prompts with role information
    - Include proper joins with llm_roles and providers

  3. Security
    - Grant appropriate access to anonymous users
    - Add policies for secure access
*/

-- First ensure the chatbot_prompts table exists
CREATE TABLE IF NOT EXISTS public.chatbot_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots NOT NULL,
  role_id uuid REFERENCES public.llm_roles NOT NULL,
  content text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create the view
CREATE OR REPLACE VIEW public.chatbot_prompts_public AS
SELECT 
  cp.chatbot_id,
  lr.name as role,
  cp.content,
  cp.order
FROM public.chatbot_prompts cp
JOIN public.llm_roles lr ON cp.role_id = lr.id
ORDER BY cp.order ASC;

-- Grant access to anonymous users
GRANT SELECT ON public.chatbot_prompts_public TO anon;

-- Create policy for anonymous access to the base table
CREATE POLICY "Allow public access to prompts"
  ON public.chatbot_prompts
  FOR SELECT
  TO anon
  USING (true);