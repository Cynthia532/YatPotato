import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { TimerService } from './services/TimerService';
import { DatabaseService } from './services/DatabaseService';
import { WindowManager } from './services/WindowManager';

// 扩展全局类型
declare global {
  namespace NodeJS {
    interface Global {
      timerService: TimerService;
      dbService: DatabaseService;
      windowManager: WindowManager;
    }
  }
}

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  // 初始化服务
  global.dbService = new DatabaseService();
  global.timerService = new TimerService(global.dbService);
  global.windowManager = new WindowManager();

  await global.dbService.initialize();

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // 加载 React 应用
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:3000');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 窗口管理
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});