import { Debug } from './utils/debug';

export class WidgetUI {
  constructor(container) {
    this.container = container;
    this.debugPanel = null;
    this.render();
    this.initializeDebugPanel();
    Debug.init('Widget UI initialized');
  }

  render() {
    this.container.innerHTML = `
      <div class="voice-chat-container" style="
        position: fixed;
        bottom: 20px;
        right: 20px;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 16px;
        z-index: 10000;
      ">
        <!-- Debug Panel -->
        <div class="debug-panel" style="
          width: 400px;
          background: rgba(0, 0, 0, 0.95);
          border: 1px solid #333;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
          margin-bottom: 16px;
          display: flex;
          flex-direction: column;
          opacity: 0.95;
          transition: all 0.3s ease;
        ">
          <div style="
            padding: 8px 12px;
            background: #1a1a1a;
            border-bottom: 1px solid #333;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-radius: 8px 8px 0 0;
          ">
            <span style="color: #fff; font-family: system-ui, -apple-system, sans-serif; font-size: 12px;">Debug Console</span>
            <div>
              <button class="debug-toggle" style="
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 12px;
                padding: 2px 6px;
                margin-right: 4px;
              ">Debug: ON</button>
              <button class="minimize-logs" style="
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 12px;
                padding: 2px 6px;
                margin-right: 4px;
              ">_</button>
              <button class="clear-logs" style="
                background: none;
                border: none;
                color: #666;
                cursor: pointer;
                font-family: system-ui, -apple-system, sans-serif;
                font-size: 12px;
                padding: 2px 6px;
              ">Clear</button>
            </div>
          </div>
          <div class="debug-content" style="
            flex: 1;
            overflow-y: auto;
            padding: 12px;
            color: #fff;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            max-height: 300px;
          "></div>
        </div>

        <!-- Voice Button -->
        <button id="voice-chat-button" style="
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: #2563eb;
          color: white;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
        ">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" y1="19" x2="12" y2="23"/>
            <line x1="8" y1="23" x2="16" y2="23"/>
          </svg>
        </button>
      </div>
    `;

    this.debugPanel = this.container.querySelector('.debug-content');
    Debug.setDebugPanel(this.debugPanel);

    // Add debug toggle handler
    const debugToggle = this.container.querySelector('.debug-toggle');
    let debugEnabled = true;
    debugToggle.addEventListener('click', () => {
      debugEnabled = !debugEnabled;
      debugToggle.textContent = `Debug: ${debugEnabled ? 'ON' : 'OFF'}`;
      if (debugEnabled) {
        Debug.enable();
      } else {
        Debug.disable();
      }
    });

    // Add clear logs button handler
    const clearButton = this.container.querySelector('.clear-logs');
    clearButton.addEventListener('click', () => {
      if (this.debugPanel) {
        this.debugPanel.innerHTML = '';
      }
    });

    // Add minimize button handler
    const minimizeButton = this.container.querySelector('.minimize-logs');
    const debugPanel = this.container.querySelector('.debug-panel');
    let isMinimized = false;

    minimizeButton.addEventListener('click', () => {
      isMinimized = !isMinimized;
      if (isMinimized) {
        debugPanel.style.height = '32px';
        minimizeButton.textContent = '□';
        this.debugPanel.style.display = 'none';
      } else {
        debugPanel.style.height = 'auto';
        minimizeButton.textContent = '_';
        this.debugPanel.style.display = 'block';
      }
    });
  }

  getButton() {
    return this.container.querySelector('#voice-chat-button');
  }

  setButtonState(isActive) {
    const button = this.getButton();
    if (button) {
      button.style.background = isActive ? '#1d4ed8' : '#2563eb';
      button.style.transform = isActive ? 'scale(0.95)' : 'scale(1)';
    }
  }
}