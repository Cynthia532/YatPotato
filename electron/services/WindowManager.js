const { BrowserWindow, screen } = require('electron');
const path = require('path');

/**
 * 窗口管理服务
 */
class WindowManager {
  constructor() {
    this.windows = new Map(); // 存储所有创建的窗口
    this.mainWindow = null;
  }

  /**
   * 创建主窗口
   * @param {Object} options - 窗口配置选项
   * @returns {BrowserWindow} - 创建的窗口实例
   */
  createMainWindow(options = {}) {
    // 如果主窗口已存在，则返回已有实例
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      return this.mainWindow;
    }

    // 合并默认配置与传入配置
    const defaultOptions = {
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        enableRemoteModule: false,
      },
    };

    const windowOptions = { ...defaultOptions, ...options };

    // 创建浏览器窗口
    const window = new BrowserWindow(windowOptions);
    
    // 设置窗口ID
    const windowId = 'main-window';
    
    // 存储窗口引用
    this.windows.set(windowId, window);
    this.mainWindow = window;

    // 设置窗口居中
    this.centerWindow(window);
    
    // 窗口准备好后显示
    window.once('ready-to-show', () => {
      window.show();
    });

    // 窗口关闭时移除引用
    window.on('closed', () => {
      this.windows.delete(windowId);
      if (windowId === 'main-window') {
        this.mainWindow = null;
      }
    });

    return window;
  }

  /**
   * 创建子窗口
   * @param {string} id - 窗口唯一标识
   * @param {Object} options - 窗口配置选项
   * @returns {BrowserWindow} - 创建的窗口实例
   */
  createChildWindow(id, options = {}) {
    // 如果已存在同ID窗口，关闭旧窗口
    if (this.windows.has(id)) {
      const existingWindow = this.windows.get(id);
      if (!existingWindow.isDestroyed()) {
        existingWindow.focus();
        return existingWindow;
      }
    }

    // 默认选项
    const defaultOptions = {
      parent: this.mainWindow,
      modal: false,
      show: false,
      webPreferences: {
        preload: path.join(__dirname, '../preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      },
    };

    const windowOptions = { ...defaultOptions, ...options };
    const window = new BrowserWindow(windowOptions);
    
    // 存储窗口引用
    this.windows.set(id, window);
    
    // 设置窗口居中
    this.centerWindow(window);
    
    // 窗口准备好后显示
    window.once('ready-to-show', () => {
      window.show();
    });
    
    // 窗口关闭时移除引用
    window.on('closed', () => {
      this.windows.delete(id);
    });

    return window;
  }

  /**
   * 获取窗口实例
   * @param {string} id - 窗口ID
   * @returns {BrowserWindow|null} - 窗口实例或null
   */
  getWindow(id) {
    return this.windows.get(id) || null;
  }

  /**
   * 获取主窗口
   * @returns {BrowserWindow|null} - 主窗口实例或null
   */
  getMainWindow() {
    return this.mainWindow;
  }

  /**
   * 关闭窗口
   * @param {string} id - 窗口ID
   */
  closeWindow(id) {
    const window = this.windows.get(id);
    if (window && !window.isDestroyed()) {
      window.close();
    }
  }

  /**
   * 关闭所有窗口
   */
  closeAllWindows() {
    this.windows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
  }

  /**
   * 将窗口居中显示
   * @param {BrowserWindow} window - 窗口实例
   */
  centerWindow(window) {
    const { width, height } = window.getBounds();
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;
    
    const x = Math.floor((screenWidth - width) / 2);
    const y = Math.floor((screenHeight - height) / 2);
    
    window.setBounds({ x, y, width, height });
  }
}

// 导出单例实例
module.exports = new WindowManager();
