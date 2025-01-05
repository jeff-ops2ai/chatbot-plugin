/*
  # Add public access policy for chat interactions

  1. Changes
    - Add policy to allow anonymous users to create chat interactions
    - This is needed for the widget to work without authentication

  2. Security
    - Policy allows only creation of chat interactions
    - No read/update/delete access is granted
*/

-- Allow anonymous users to create chat interactions
CREATE POLICY "Allow anonymous chat interaction creation"
  ON public.chat_interactions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Grant insert permission to anonymous users
GRANT INSERT ON public.chat_interactions TO anon;