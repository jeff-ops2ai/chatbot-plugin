import { LOG_MODULES } from './constants';

export class SupabaseLogger {
  private static formatHeaders(headers: HeadersInit): string {
    const headerObj = headers instanceof Headers ? 
      Object.fromEntries(headers.entries()) : 
      headers;
    
    return JSON.stringify({
      ...headerObj,
      apikey: '[REDACTED]'
    }, null, 2);
  }

  private static formatData(data: any): string {
    try {
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return String(data);
    }
  }

  static logRequest(url: string, headers: HeadersInit) {
    console.log(`
🔵 [${LOG_MODULES.SUPABASE}] Making request:
URL: ${url}
Headers: ${this.formatHeaders(headers)}
    `);
  }

  static logResponse(response: Response, data: any) {
    console.log(`
🟢 [${LOG_MODULES.SUPABASE}] Received response:
Status: ${response.status} (${response.statusText})
Headers: ${this.formatHeaders(response.headers)}
Data: ${this.formatData(data)}
    `);
  }

  static logError(error: any) {
    console.error(`
🔴 [${LOG_MODULES.SUPABASE}] Error:
Message: ${error.message}
Stack: ${error.stack}
    `);
  }
}