/*
  # Clean up redundant database views

  1. Changes
    - Drop redundant chatbot_prompts_public view
    - Update chatbot_prompts_view with improved columns and sorting
  
  2. Security
    - Maintain existing RLS policies
    - Keep anonymous access to the view
*/

-- Drop the redundant view
DROP VIEW IF EXISTS public.chatbot_prompts_public;

-- Recreate the main view with improved structure
CREATE OR REPLACE VIEW public.chatbot_prompts_view AS
SELECT 
  cp.chatbot_id,
  lr.name as role,
  cp.content,
  cp.order,
  cp.created_at,
  cp.updated_at
FROM public.chatbot_prompts cp
JOIN public.llm_roles lr ON cp.role_id = lr.id
ORDER BY cp.order ASC, cp.created_at ASC;

-- Ensure anonymous access is maintained
GRANT SELECT ON public.chatbot_prompts_view TO anon;