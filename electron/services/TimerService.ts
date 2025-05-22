import { ipcMain } from 'electron';
import { DatabaseService } from './DatabaseService';

export enum TimerType {
  WORK = 'work',
  SHORT_BREAK = 'short_break',
  LONG_BREAK = 'long_break'
}

export interface PomodoroSession {
  id?: number;
  startTime: string;
  endTime?: string;
  duration: number;
  type: TimerType;
  taskId?: number;
  completed: boolean;
}

export interface TimerSettings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartNext: boolean;
}

export class TimerService {
  private currentTimer: NodeJS.Timeout | null = null;
  private currentSession: PomodoroSession | null = null;
  private sessionCount = 0;
  private settings: TimerSettings = {
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartNext: true
  };

  constructor(private dbService: DatabaseService) {
    this.setupIpcHandlers();
  }

  private setupIpcHandlers() {
    ipcMain.handle('timer:start-work', async (_, taskId?: number) => {
      return this.startWorkSession(taskId);
    });

    ipcMain.handle('timer:start-break', async (_, isLongBreak: boolean) => {
      return this.startBreakSession(isLongBreak);
    });

    ipcMain.handle('timer:stop', async () => {
      return this.stopCurrentSession();
    });

    ipcMain.handle('timer:get-settings', async () => {
      return this.settings;
    });

    ipcMain.handle('timer:update-settings', async (_, newSettings: Partial<TimerSettings>) => {
      Object.assign(this.settings, newSettings);
      return this.settings;
    });
  }

  async startWorkSession(taskId?: number): Promise<PomodoroSession> {
    await this.stopCurrentSession();

    const session: PomodoroSession = {
      startTime: new Date().toISOString(),
      duration: this.settings.workDuration,
      type: TimerType.WORK,
      taskId,
      completed: false
    };

    this.currentSession = session;
    this.startCountdown(this.settings.workDuration * 60);

    // 保存到数据库
    const result = await this.dbService.query<{ id: number }>(
      'INSERT INTO pomodoro_sessions (start_time, duration, type, task_id, completed) VALUES (?, ?, ?, ?, ?) RETURNING id',
      [session.startTime, session.duration, session.type, session.taskId, session.completed]
    );

    session.id = result[0].id;
    return session;
  }

  async startBreakSession(isLongBreak: boolean): Promise<PomodoroSession> {
    await this.stopCurrentSession();

    const breakType = isLongBreak ? TimerType.LONG_BREAK : TimerType.SHORT_BREAK;
    const duration = isLongBreak ? this.settings.longBreakDuration : this.settings.shortBreakDuration;

    const session: PomodoroSession = {
      startTime: new Date().toISOString(),
      duration,
      type: breakType,
      completed: false
    };

    this.currentSession = session;
    this.startCountdown(duration * 60);

    // 保存到数据库
    const result = await this.dbService.query<{ id: number }>(
      'INSERT INTO pomodoro_sessions (start_time, duration, type, completed) VALUES (?, ?, ?, ?) RETURNING id',
      [session.startTime, session.duration, session.type, session.completed]
    );

    session.id = result[0].id;
    return session;
  }

  private startCountdown(seconds: number) {
    this.currentTimer = setTimeout(async () => {
      if (this.currentSession) {
        this.currentSession.completed = true;
        this.currentSession.endTime = new Date().toISOString();
        
        await this.dbService.execute(
          'UPDATE pomodoro_sessions SET end_time = ?, completed = ? WHERE id = ?',
          [this.currentSession.endTime, true, this.currentSession.id]
        );

        this.sessionCount++;
        this.currentSession = null;
        
        // 发送通知
        // 自动开始下一个计时器（如果设置允许）
      }
    }, seconds * 1000);
  }

  async stopCurrentSession(): Promise<void> {
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }

    if (this.currentSession) {
      this.currentSession.endTime = new Date().toISOString();
      await this.dbService.execute(
        'UPDATE pomodoro_sessions SET end_time = ? WHERE id = ?',
        [this.currentSession.endTime, this.currentSession.id]
      );
      this.currentSession = null;
    }
  }
}