/**
 * 应用常量定义 包含应用中使用的各种常量。
 */

// 计时器状态
export const TIMER_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
};

// 计时器类型
export const TIMER_TYPE = {
  WORK: 'work',
  SHORT_BREAK: 'shortBreak',
  LONG_BREAK: 'longBreak',
};

// 任务状态
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

// 任务优先级
export const TASK_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

// 事件类型
export const EVENT_TYPES = {
  TIMER_START: 'timer_start',
  TIMER_PAUSE: 'timer_pause',
  TIMER_RESUME: 'timer_resume',
  TIMER_STOP: 'timer_stop',
  TIMER_COMPLETE: 'timer_complete',
  TASK_ADD: 'task_add',
  TASK_UPDATE: 'task_update',
  TASK_REMOVE: 'task_remove',
  TASK_COMPLETE: 'task_complete',
};

// 通知类型
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

// 本地存储键
export const STORAGE_KEYS = {
  APP_CONFIG: 'appConfig',
  TASKS: 'tasks',
  POMODORO_HISTORY: 'pomodoroHistory',
  STATS: 'stats',
};

// 路由路径
export const ROUTES = {
  HOME: '/',
  POMODORO: '/pomodoro',
  TODO: '/todo',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings',
};

// 主题
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

// API端点
export const API_ENDPOINTS = {
  TIMER: '/api/timer',
  TASKS: '/api/tasks',
  STATS: '/api/stats',
};
