export class Logger {
  static log(module: string, message: string, data?: any) {
    this.output('log', module, message, data);
  }

  static warn(module: string, message: string, data?: any) {
    this.output('warn', module, message, data);
  }

  static error(module: string, message: string, data?: any) {
    this.output('error', module, message, data);
  }

  static debug(module: string, message: string, data?: any) {
    this.output('debug', module, message, data);
  }

  private static output(level: string, module: string, message: string, data?: any) {
    const timestamp = new Date().toISOString();
    const formattedData = data ? JSON.stringify(data, null, 2) : '';
    
    // Always log to console in production
    const logMessage = `[${timestamp}] [${module}] ${message}${formattedData ? '\n' + formattedData : ''}`;
    
    switch (level) {
      case 'error':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }
}