/**
 * 时间格式化工具，提供各种时间显示格式转换函数。
 */

/**
 * 将秒数转换为 MM:SS 格式
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间字符串
 */
export const formatTimeMMSS = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 将秒数转换为 HH:MM:SS 格式
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间字符串
 */
export const formatTimeHHMMSS = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '00:00:00';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * 将秒数转换为友好文本格式
 * @param {number} seconds - 秒数
 * @returns {string} - 格式化后的时间字符串
 */
export const formatTimeFriendly = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0 分钟';
  
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours} 小时 ${mins > 0 ? `${mins} 分钟` : ''}`;
  }
  return `${mins} 分钟`;
};

/**
 * 将日期对象格式化为 YYYY-MM-DD 格式
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date) => {
  if (!date || !(date instanceof Date)) return '';
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * 将日期对象格式化为 YYYY-MM-DD HH:MM:SS 格式
 * @param {Date} date - 日期对象
 * @returns {string} - 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => {
  if (!date || !(date instanceof Date)) return '';
  
  const dateStr = formatDate(date);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  
  return `${dateStr} ${hours}:${minutes}:${seconds}`;
};

/**
 * 将日期对象格式化为相对时间（例如：刚刚、5分钟前等）
 * @param {Date} date - 日期对象
 * @returns {string} - 相对时间字符串
 */
export const formatRelativeTime = (date) => {
  if (!date || !(date instanceof Date)) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return '刚刚';
  
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分钟前`;
  }
  
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}小时前`;
  }
  
  if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}天前`;
  }
  
  const months = Math.floor(diffInSeconds / 2592000);
  return `${months}个月前`;
};

export default {
  formatTimeMMSS,
  formatTimeHHMMSS,
  formatTimeFriendly,
  formatDate,
  formatDateTime,
  formatRelativeTime
};
