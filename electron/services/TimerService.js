const { app, ipcMain } = require('electron');
const DatabaseService = require('./DatabaseService');
const WindowManager = require('./WindowManager');

/**
 * 番茄钟计时器服务
 */
class TimerService {
  constructor() {
    this.timer = null;
    this.startTime = null;
    this.remaining = 0;
    this.duration = 0;
    this.type = null;
    this.status = 'idle';
    this.pomodoroCount = 0;
    
    this.initEvents();
  }

  /**
   * 初始化IPC事件监听
   */
  initEvents() {
    // 处理计时器控制
    ipcMain.handle('timer-control', (event, action) => {
      switch (action.type) {
        case 'START':
          return this.startTimer(action.duration, action.timerType);
        case 'PAUSE':
          return this.pauseTimer();
        case 'RESUME':
          return this.resumeTimer();
        case 'STOP':
          return this.stopTimer();
        case 'RESET':
          return this.resetTimer();
        case 'GET_STATUS':
          return this.getTimerStatus();
        default:
          return { success: false, message: 'Unknown action' };
      }
    });
  }

  /**
   * 开始计时
   * @param {number} duration - 计时时长（秒）
   * @param {string} type - 计时类型 (work, shortBreak, longBreak)
   * @returns {object} - 操作结果
   */
  startTimer(duration, type) {
    try {
      // 清除现有计时器
      this.clearTimer();
      
      this.duration = duration;
      this.remaining = duration;
      this.type = type || 'work';
      this.startTime = Date.now();
      this.status = 'running';
      
      // 记录开始计时到数据库
      if (this.type === 'work') {
        DatabaseService.addPomodoroRecord({
          start_time: new Date(),
          duration: this.duration,
          status: 'started',
          type: this.type
        });
      }
      
      // 发送到渲染进程
      this.broadcastTimerUpdate();
      
      // 启动计时器
      this.timer = setInterval(() => {
        this.tick();
      }, 1000);
      
      return {
        success: true,
        message: 'Timer started',
        data: this.getTimerStatus()
      };
    } catch (error) {
      console.error('Failed to start timer:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 计时器滴答
   */
  tick() {
    const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
    this.remaining = Math.max(0, this.duration - elapsed);
    
    // 广播计时更新
    this.broadcastTimerUpdate();
    
    // 检查计时器是否已经完成
    if (this.remaining <= 0) {
      this.completeTimer();
    }
  }

  /**
   * 暂停计时器
   * @returns {object} - 操作结果
   */
  pauseTimer() {
    try {
      if (this.status !== 'running') {
        return { success: false, message: 'Timer is not running' };
      }
      
      // 清除计时器
      this.clearTimer();
      this.status = 'paused';
      
      // 广播状态更新
      this.broadcastTimerUpdate();
      
      return {
        success: true,
        message: 'Timer paused',
        data: this.getTimerStatus()
      };
    } catch (error) {
      console.error('Failed to pause timer:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 恢复计时器
   * @returns {object} - 操作结果
   */
  resumeTimer() {
    try {
      if (this.status !== 'paused') {
        return { success: false, message: 'Timer is not paused' };
      }
      
      this.startTime = Date.now() - ((this.duration - this.remaining) * 1000);
      this.status = 'running';
      
      // 启动计时器
      this.timer = setInterval(() => {
        this.tick();
      }, 1000);
      
      // 广播状态更新
      this.broadcastTimerUpdate();
      
      return {
        success: true,
        message: 'Timer resumed',
        data: this.getTimerStatus()
      };
    } catch (error) {
      console.error('Failed to resume timer:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 停止计时器
   * @returns {object} - 操作结果
   */
  stopTimer() {
    try {
      if (this.status === 'idle') {
        return { success: false, message: 'Timer is not active' };
      }
      
      // 清除计时器
      this.clearTimer();
      
      // 如果是工作计时器，记录到数据库
      if (this.type === 'work') {
        const completed = this.remaining <= 0;
        const actualDuration = this.duration - this.remaining;
        
        DatabaseService.updatePomodoroRecord({
          start_time: new Date(this.startTime),
          actual_duration: actualDuration,
          status: completed ? 'completed' : 'canceled',
          type: this.type
        });
      }
      
      // 重置状态
      this.resetTimer();
      
      return {
        success: true,
        message: 'Timer stopped',
        data: this.getTimerStatus()
      };
    } catch (error) {
      console.error('Failed to stop timer:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 重置计时器
   */
  resetTimer() {
    this.clearTimer();
    this.status = 'idle';
    this.remaining = 0;
    this.duration = 0;
    this.startTime = null;
    this.type = null;
    
    // 广播状态更新
    this.broadcastTimerUpdate();
    
    return {
      success: true,
      message: 'Timer reset',
      data: this.getTimerStatus()
    };
  }

  /**
   * 完成计时器
   */
  completeTimer() {
    // 清除计时器
    this.clearTimer();
    this.status = 'completed';
    this.remaining = 0;
    
    // 如果是工作计时器，增加番茄钟计数
    if (this.type === 'work') {
      this.pomodoroCount++;
      
      // 记录完成到数据库
      DatabaseService.updatePomodoroRecord({
        start_time: new Date(this.startTime),
        actual_duration: this.duration,
        status: 'completed',
        type: this.type
      });
    }
    
    // 广播状态更新
    this.broadcastTimerUpdate();
    
    // 发送通知
    this.sendTimerCompletionNotification();
  }

  /**
   * 获取计时器状态
   * @returns {object} - 计时器状态
   */
  getTimerStatus() {
    return {
      status: this.status,
      remaining: this.remaining,
      duration: this.duration,
      type: this.type,
      pomodoroCount: this.pomodoroCount
    };
  }

  /**
   * 发送计时器完成通知
   */
  sendTimerCompletionNotification() {
    const mainWindow = WindowManager.getMainWindow();
    if (mainWindow) {
      let title, body;
      
      if (this.type === 'work') {
        title = '工作时间结束';
        body = '休息一下吧！';
      } else if (this.type === 'shortBreak') {
        title = '短休息时间结束';
        body = '准备开始工作吧！';
      } else if (this.type === 'longBreak') {
        title = '长休息时间结束';
        body = '准备开始新的工作周期吧！';
      }
      
      // 发送通知到渲染进程
      mainWindow.webContents.send('timer-notification', { title, body });
      
      // 如果窗口不是焦点，显示原生通知
      if (!mainWindow.isFocused()) {
        const notification = new Notification({
          title,
          body,
          silent: false
        });
        
        notification.show();
        
        notification.on('click', () => {
          if (mainWindow) {
            if (mainWindow.isMinimized()) {
              mainWindow.restore();
            }
            mainWindow.focus();
          }
        });
      }
    }
  }

  /**
   * 广播计时器更新到渲染进程
   */
  broadcastTimerUpdate() {
    const mainWindow = WindowManager.getMainWindow();
    if (mainWindow) {
      mainWindow.webContents.send('timer-update', this.getTimerStatus());
    }
  }

  /**
   * 清除计时器
   */
  clearTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 处理Action请求
   * @param {object} action - 动作对象
   * @returns {object} - 操作结果
   */
  handleAction(action) {
    switch (action.type) {
      case 'START':
        return this.startTimer(action.duration, action.timerType);
      case 'PAUSE':
        return this.pauseTimer();
      case 'RESUME':
        return this.resumeTimer();
      case 'STOP':
        return this.stopTimer();
      case 'RESET':
        return this.resetTimer();
      case 'GET_STATUS':
        return { success: true, data: this.getTimerStatus() };
      default:
        return { success: false, message: 'Unknown action type' };
    }
  }
}

// 导出单例实例
module.exports = new TimerService();
