import { Context } from '@netlify/edge-functions';
import { createClient } from '@supabase/supabase-js';

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);
  const chatbotId = url.pathname.split('/').pop();

  if (!chatbotId) {
    return new Response(
      JSON.stringify({ error: 'Missing chatbot ID' }), 
      { status: 400 }
    );
  }

  try {
    const supabase = createClient(
      process.env.VITE_SUPABASE_URL!,
      process.env.VITE_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase
      .from('chatbots')
      .select('id, api_key, model, voice, language')
      .eq('id', chatbotId)
      .single();

    if (error) throw error;
    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Chatbot not found' }), 
        { status: 404 }
      );
    }

    return new Response(
      JSON.stringify(data),
      { 
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}