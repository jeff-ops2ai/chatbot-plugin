/*
  # Add chatbot prompts support
  
  1. New Tables
    - `chatbot_prompts`
      - `id` (uuid, primary key)
      - `chatbot_id` (uuid, foreign key)
      - `role_id` (uuid, foreign key)
      - `content` (text)
      - `order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Security
    - Enable RLS
    - Add policies for CRUD operations
*/

-- Create chatbot prompts table
CREATE TABLE IF NOT EXISTS public.chatbot_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chatbot_id uuid REFERENCES public.chatbots NOT NULL,
  role_id uuid REFERENCES public.llm_roles NOT NULL,
  content text NOT NULL,
  "order" integer DEFAULT 0,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.chatbot_prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own chatbot prompts"
  ON public.chatbot_prompts
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_prompts.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create prompts for own chatbots"
  ON public.chatbot_prompts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_prompts.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update prompts for own chatbots"
  ON public.chatbot_prompts
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_prompts.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete prompts for own chatbots"
  ON public.chatbot_prompts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chatbot_prompts.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );