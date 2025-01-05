import { config } from '../config.js';

export class Chat {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.model = config.DEFAULT_MODEL;
    this.voice = config.DEFAULT_VOICE;
    // ... rest of constructor remains the same ...
  }
  // ... rest of the class remains the same ...
} 