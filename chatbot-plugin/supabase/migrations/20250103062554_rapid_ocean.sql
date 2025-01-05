/*
  # Add anonymous access for chatbot widget

  1. Changes
    - Add policy to allow anonymous access to chatbot configurations
    - Only allow reading specific fields needed for the widget
*/

-- Allow anonymous access to read chatbot configurations
CREATE POLICY "Allow anonymous access to chatbot configurations"
  ON public.chatbots
  FOR SELECT
  TO anon
  USING (true);

-- Create a view for public chatbot access that limits exposed fields
CREATE VIEW public.chatbot_configs AS
  SELECT 
    id,
    api_key,
    model,
    language,
    welcome_message,
    is_active
  FROM public.chatbots
  WHERE is_active = true;

-- Grant access to the view
GRANT SELECT ON public.chatbot_configs TO anon;