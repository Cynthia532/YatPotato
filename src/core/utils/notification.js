/**
 * 通知工具 封装通知功能调用。
 */

import { NOTIFICATION_TYPES } from '../app/constants';

// 音频资源缓存
const audioCache = {
  success: null,
  warning: null,
  error: null
};

/**
 * 初始化音频
 */
const initAudio = () => {
  if (typeof window === 'undefined') return;

  audioCache.success = new Audio('/assets/sounds/success.mp3');
  audioCache.warning = new Audio('/assets/sounds/warning.mp3');
  audioCache.error = new Audio('/assets/sounds/error.mp3');
};

/**
 * 检查浏览器是否支持通知
 * @returns {boolean} - 是否支持
 */
const isNotificationSupported = () => {
  return typeof window !== 'undefined' && 'Notification' in window;
};

/**
 * 请求通知权限
 * @returns {Promise<string>} - 权限结果
 */
const requestPermission = async () => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  
  if (Notification.permission !== 'denied') {
    return await Notification.requestPermission();
  }
  
  return Notification.permission;
};

/**
 * 显示桌面通知
 * @param {string} title - 通知标题
 * @param {object} options - 通知选项
 * @param {string} options.body - 通知内容
 * @param {string} options.icon - 通知图标
 * @returns {Notification|null} - 通知对象
 */
const showBrowserNotification = (title, { body, icon } = {}) => {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }
  
  return new Notification(title, {
    body,
    icon: icon || '/assets/icons/notification-icon.png',
    silent: true, // 使用我们自己的音效
  });
};

/**
 * 播放通知音效
 * @param {string} type - 通知类型
 */
const playSound = (type) => {
  if (typeof window === 'undefined') return;
  
  // 初始化音频（如果需要）
  if (!audioCache.success) {
    initAudio();
  }
  
  let audio;
  switch (type) {
    case NOTIFICATION_TYPES.SUCCESS:
      audio = audioCache.success;
      break;
    case NOTIFICATION_TYPES.WARNING:
      audio = audioCache.warning;
      break;
    case NOTIFICATION_TYPES.ERROR:
      audio = audioCache.error;
      break;
    default:
      audio = audioCache.success;
  }
  
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.error('Failed to play notification sound:', err));
  }
};

/**
 * 显示Electron通知（通过预加载脚本暴露的API）
 * @param {string} title - 通知标题
 * @param {string} body - 通知内容
 */
const showElectronNotification = (title, body) => {
  if (typeof window !== 'undefined' && window.notification) {
    window.notification.show(title, body);
  }
};

/**
 * 显示通知（根据环境选择通知方式）
 * @param {string} title - 通知标题
 * @param {string} message - 通知内容
 * @param {object} options - 通知选项
 * @param {string} options.type - 通知类型
 * @param {boolean} options.playSound - 是否播放声音
 */
export const showNotification = async (title, message, options = {}) => {
  const { type = NOTIFICATION_TYPES.INFO, playSound: shouldPlaySound = true } = options;
  
  // 获取用户设置
  const config = typeof window !== 'undefined' && window.localStorage
    ? JSON.parse(localStorage.getItem('appConfig') || '{}')
    : {};
    
  const notificationSettings = config.notification || { sound: true, desktop: true };
  
  // 播放声音
  if (shouldPlaySound && notificationSettings.sound) {
    playSound(type);
  }
  
  // 显示通知
  if (notificationSettings.desktop) {
    // 首先尝试使用Electron通知
    if (typeof window !== 'undefined' && window.notification) {
      showElectronNotification(title, message);
    } 
    // 如果不在Electron环境中，使用浏览器通知
    else if (isNotificationSupported()) {
      // 请求权限（如果还没有）
      if (Notification.permission !== 'granted') {
        const permission = await requestPermission();
        if (permission !== 'granted') return;
      }
      
      showBrowserNotification(title, { body: message });
    }
  }
};

export default {
  showNotification,
  requestPermission,
  isNotificationSupported,
  playSound
};
