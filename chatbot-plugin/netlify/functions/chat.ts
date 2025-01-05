import { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);

export const handler: Handler = async (event) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Get chatbot ID from path
  const chatbotId = event.path.split('/').pop();

  if (!chatbotId) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Missing chatbot ID' })
    };
  }

  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('id, api_key, model, voice, language')
      .eq('id', chatbotId)
      .single();

    if (error) throw error;
    if (!data) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Chatbot not found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};