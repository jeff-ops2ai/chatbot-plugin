export class Debug {
  private static debugPanel: HTMLElement | null = null;
  private static isEnabled = true;

  static setDebugPanel(panel: HTMLElement) {
    this.debugPanel = panel;
  }

  static enable() {
    this.isEnabled = true;
    this.log('DEBUG', 'Debug logging enabled');
  }

  static disable() {
    this.isEnabled = false;
    this.log('DEBUG', 'Debug logging disabled');
  }

  static init(message: string, data?: any) {
    this.log('INIT', `🚀 ${message}`, data);
  }

  static prompt(message: string, data?: any) {
    this.log('PROMPT', `💭 ${message}`, data);
  }

  static api(message: string, data?: any) {
    this.log('API', `🔄 ${message}`, data);
  }

  static audio(message: string, data?: any) {
    this.log('AUDIO', `🔊 ${message}`, data);
  }

  static speech(message: string, data?: any) {
    this.log('SPEECH', `🎤 ${message}`, data);
  }

  static error(message: string, error: any) {
    this.log('ERROR', `❌ ${message}`, error);
    if (error?.stack) {
      this.log('STACK', error.stack);
    }
  }

  private static log(type: string, message: string, data?: any) {
    if (!this.isEnabled) return;

    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] [${type}] ${message}`;

    // Always log to console
    console.log(logMessage);
    if (data) {
      console.log(JSON.stringify(data, null, 2));
    }

    // Log to debug panel if available
    if (this.debugPanel) {
      const entry = document.createElement('div');
      entry.className = this.getLogClass(type);
      entry.innerHTML = `
        <span class="timestamp">${timestamp}</span>
        <span class="type">[${type}]</span>
        <span class="message">${message}</span>
        ${data ? `<pre class="data">${JSON.stringify(data, null, 2)}</pre>` : ''}
      `;
      this.debugPanel.appendChild(entry);
      this.debugPanel.scrollTop = this.debugPanel.scrollHeight;
    }
  }

  private static getLogClass(type: string): string {
    const baseClass = 'log-entry mb-2 font-mono text-sm';
    switch (type) {
      case 'ERROR':
        return `${baseClass} text-red-500`;
      case 'INIT':
        return `${baseClass} text-blue-500`;
      case 'API':
        return `${baseClass} text-purple-500`;
      case 'AUDIO':
        return `${baseClass} text-green-500`;
      case 'SPEECH':
        return `${baseClass} text-yellow-500`;
      default:
        return `${baseClass} text-gray-300`;
    }
  }
}