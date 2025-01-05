/*
  # Add chatbots table with voice configuration

  1. New Tables
    - `chatbots` table if it doesn't exist
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `api_key` (text)
      - `model` (text)
      - `voice` (text)
      - `language` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS if not enabled
    - Add policies if they don't exist
*/

-- Create table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.chatbots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  api_key text NOT NULL,
  model text DEFAULT 'gpt-3.5-turbo',
  voice text DEFAULT 'alloy',
  language text DEFAULT 'en-US',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chatbots ENABLE ROW LEVEL SECURITY;

-- Create policies if they don't exist
DO $$ 
BEGIN
  -- Check and create select policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chatbots' 
    AND policyname = 'Users can view own chatbots'
  ) THEN
    CREATE POLICY "Users can view own chatbots"
      ON public.chatbots
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  -- Check and create insert policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chatbots' 
    AND policyname = 'Users can create own chatbots'
  ) THEN
    CREATE POLICY "Users can create own chatbots"
      ON public.chatbots
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  END IF;

  -- Check and create update policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'chatbots' 
    AND policyname = 'Users can update own chatbots'
  ) THEN
    CREATE POLICY "Users can update own chatbots"
      ON public.chatbots
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;
END $$;