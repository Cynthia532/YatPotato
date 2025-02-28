/**
 * 应用配置管理 提供默认设置和配置管理功能。
 */

// 默认配置
const defaultConfig = {
  pomodoro: {
    workDuration: 25 * 60, // 工作时长（秒）
    shortBreakDuration: 5 * 60, // 短休息时长（秒）
    longBreakDuration: 15 * 60, // 长休息时长（秒）
    longBreakInterval: 4, // 长休息间隔（次数）
    autoStartBreak: true, // 自动开始休息
    autoStartWork: false, // 自动开始工作
  },
  notification: {
    sound: true, // 声音提醒
    desktop: true, // 桌面通知
  },
  appearance: {
    theme: 'system', // 主题（system, light, dark）
    alwaysOnTop: false, // 窗口置顶
    showSeconds: true, // 显示秒数
  },
  todoList: {
    sortBy: 'priority', // 排序方式（priority, dueDate, createdAt）
    showCompleted: true, // 显示已完成任务
  }
};

// 从本地存储加载配置
const loadConfig = () => {
  try {
    const savedConfig = localStorage.getItem('appConfig');
    return savedConfig ? { ...defaultConfig, ...JSON.parse(savedConfig) } : defaultConfig;
  } catch (error) {
    console.error('Failed to load config:', error);
    return defaultConfig;
  }
};

// 保存配置到本地存储
const saveConfig = (config) => {
  try {
    localStorage.setItem('appConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Failed to save config:', error);
    return false;
  }
};

// 获取当前配置
const getConfig = () => {
  if (typeof window !== 'undefined') {
    return loadConfig();
  }
  return defaultConfig;
};

// 更新配置
const updateConfig = (path, value) => {
  const config = getConfig();
  const keys = path.split('.');
  
  let current = config;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!current[keys[i]]) current[keys[i]] = {};
    current = current[keys[i]];
  }
  
  current[keys[keys.length - 1]] = value;
  saveConfig(config);
  return config;
};

export default {
  defaultConfig,
  getConfig,
  updateConfig,
  saveConfig,
};
