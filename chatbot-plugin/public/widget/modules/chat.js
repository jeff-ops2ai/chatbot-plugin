import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';

export class Chat {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.model = config.DEFAULT_MODEL;
    this.voice = config.DEFAULT_VOICE;
    this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_KEY);
    // ... rest of constructor remains the same ...
  }
  // ... rest of the class remains the same ...
} 