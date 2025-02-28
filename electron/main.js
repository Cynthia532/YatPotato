// electron/main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const WindowManager = require('./services/WindowManager');
const DatabaseService = require('./services/DatabaseService');

// 初始化数据库
DatabaseService.initialize();

let mainWindow;

function createWindow() {
    mainWindow = WindowManager.createMainWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // 加载应用（开发环境使用Vite服务器，生产环境使用打包文件）
    if (process.env.NODE_ENV === 'development') {
        mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
    }

    // 窗口关闭事件处理
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// 应用准备就绪
app.whenReady().then(createWindow);

// 退出应用
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// IPC通信处理
ipcMain.handle('show-notification', (_, { title, body }) => {
    new Notification({ title, body }).show();
});

ipcMain.handle('toggle-always-on-top', (_, flag) => {
    mainWindow.setAlwaysOnTop(flag);
});

// 开发环境热重载
if (process.env.NODE_ENV === 'development') {
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, '../../node_modules', '.bin', 'electron')
    });
}