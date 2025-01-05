import { supabase } from './supabase';

export async function testSupabase() {
  try {
    const { data, error } = await supabase
      .from('chatbots')
      .select('id')
      .limit(1);
      
    console.log('🔥 SUPABASE TEST MESSAGE:', { data, error });
    return { data, error };
  } catch (err) {
    console.error('Supabase test error:', err);
    return { data: null, error: err };
  }
}