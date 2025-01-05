import { Logger } from './logger';

export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(module: string, operation: string): void {
    const key = `${module}-${operation}`;
    this.timers.set(key, performance.now());
  }

  static end(module: string, operation: string): void {
    const key = `${module}-${operation}`;
    const startTime = this.timers.get(key);
    
    if (startTime) {
      const duration = performance.now() - startTime;
      Logger.debug(module, `${operation} completed in ${duration.toFixed(2)}ms`);
      this.timers.delete(key);
    }
  }
}