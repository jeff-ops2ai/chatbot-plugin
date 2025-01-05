/*
  # Initial Schema Setup for ChatGPT Voice Plugin Manager

  1. New Tables
    - `user_profiles`
      - Extends Supabase auth.users
      - Stores additional user information
    - `chatbots`
      - Stores chatbot configurations
      - Links to user accounts
    - `chat_interactions`
      - Records chat history
      - Links to chatbots

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Secure API key storage
*/

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users NOT NULL,
  full_name text,
  company_name text,
  website_url text,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chatbots Table
CREATE TABLE IF NOT EXISTS public.chatbots (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  api_key text NOT NULL,
  model text DEFAULT 'gpt-3.5-turbo',
  language text DEFAULT 'en-US',
  welcome_message text,
  theme jsonb DEFAULT '{"primaryColor": "#2563eb", "backgroundColor": "#ffffff", "textColor": "#1f2937", "fontFamily": "Inter"}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Chat Interactions Table
CREATE TABLE IF NOT EXISTS public.chat_interactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  chatbot_id uuid REFERENCES public.chatbots NOT NULL,
  user_message text NOT NULL,
  bot_response text NOT NULL,
  timestamp timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_interactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Policies for chatbots
CREATE POLICY "Users can view own chatbots"
  ON public.chatbots
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create chatbots"
  ON public.chatbots
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chatbots"
  ON public.chatbots
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own chatbots"
  ON public.chatbots
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Policies for chat_interactions
CREATE POLICY "Users can view own chatbot interactions"
  ON public.chat_interactions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chat_interactions.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chat interactions for own chatbots"
  ON public.chat_interactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chatbots
      WHERE chatbots.id = chat_interactions.chatbot_id
      AND chatbots.user_id = auth.uid()
    )
  );

-- Functions
CREATE OR REPLACE FUNCTION public.handle_user_creation()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for creating user profile
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_creation();