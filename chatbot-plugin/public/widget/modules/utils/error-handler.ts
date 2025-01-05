import { Logger } from './logger';
import { toErrorWithMessage } from './types';
import type { ErrorWithMessage } from './types';

export class ErrorHandler {
  static handle(module: string, error: unknown, context?: string): ErrorWithMessage {
    const errorWithMessage = toErrorWithMessage(error);
    
    const logMessage = context 
      ? `${context}: ${errorWithMessage.message}`
      : errorWithMessage.message;
    
    Logger.error(module, logMessage, {
      stack: errorWithMessage.stack,
      context
    });

    return errorWithMessage;
  }

  static async handleAsync<T>(
    module: string,
    operation: () => Promise<T>,
    context?: string
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      throw this.handle(module, error, context);
    }
  }
}