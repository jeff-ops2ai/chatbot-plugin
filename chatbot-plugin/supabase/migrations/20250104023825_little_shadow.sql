/*
  # Add voice column to chatbots table

  1. Changes
    - Add `voice` column to `chatbots` table to store the selected voice URI
    - Make it nullable since not all chatbots will have a custom voice
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chatbots' AND column_name = 'voice'
  ) THEN
    ALTER TABLE public.chatbots 
    ADD COLUMN voice text;
  END IF;
END $$;