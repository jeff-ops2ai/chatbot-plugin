-- Drop both views to start fresh
DROP VIEW IF EXISTS public.chatbot_prompts_public;
DROP VIEW IF EXISTS public.chatbot_prompts_view;

-- Create a single, clean view for prompts
CREATE VIEW public.chatbot_prompts_view AS
SELECT 
  cp.chatbot_id,
  lr.name as role,
  cp.content,
  cp.order,
  cp.created_at
FROM public.chatbot_prompts cp
JOIN public.llm_roles lr ON cp.role_id = lr.id
ORDER BY cp.order ASC, cp.created_at ASC;

-- Grant access to anonymous users
GRANT SELECT ON public.chatbot_prompts_view TO anon;

-- Ensure the base table policy exists
DROP POLICY IF EXISTS "Allow public access to prompts" ON public.chatbot_prompts;
CREATE POLICY "Allow public access to prompts"
  ON public.chatbot_prompts
  FOR SELECT
  TO anon
  USING (true);