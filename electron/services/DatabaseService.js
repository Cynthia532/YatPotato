const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

/**
 * 数据库服务
 */
class DatabaseService {
    constructor() {
        this.db = null;
        this.dbPath = '';
        this.initialized = false;
    }

    /**
     * 初始化数据库
     */
    initialize() {
        try {
            // 确保数据目录存在
            const userDataPath = app.getPath('userData');
            const dbDir = path.join(userDataPath, 'database');
      
            if (!fs.existsSync(dbDir)) {
                fs.mkdirSync(dbDir, { recursive: true });
            }
      
            // 设置数据库路径
            this.dbPath = path.join(dbDir, 'yatpotato.db');
      
            // 连接数据库
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Database connection error:', err.message);
                    return;
                }
                console.log('Connected to the database');
        
                // 创建表结构
                this.createTables();
            });
      
            this.initialized = true;
        } catch (error) {
            console.error('Failed to initialize database:', error);
        }
    }

    /**
     * 创建数据表
     */
    createTables() {
        // 番茄钟记录表
        this.db.run(`
      CREATE TABLE IF NOT EXISTS pomodoro_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_time DATETIME NOT NULL,
        duration INTEGER NOT NULL,
        actual_duration INTEGER,
        type TEXT NOT NULL,
        status TEXT NOT NULL,
        task_id INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
        // 待办事项表
        this.db.run(`
      CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        content TEXT NOT NULL,
        priority TEXT,
        due_date DATETIME,
        is_completed BOOLEAN DEFAULT 0,
        completed_at DATETIME,
        pomodoro_estimate INTEGER DEFAULT 1,
        pomodoro_actual INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
        // 用户设置表
        this.db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
        // 统计数据表
        this.db.run(`
      CREATE TABLE IF NOT EXISTS statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE UNIQUE NOT NULL,
        pomodoro_completed INTEGER DEFAULT 0,
        pomodoro_cancelled INTEGER DEFAULT 0,
        total_work_minutes INTEGER DEFAULT 0,
        total_break_minutes INTEGER DEFAULT 0,
        tasks_completed INTEGER DEFAULT 0,
        tasks_added INTEGER DEFAULT 0
      )
    `);
    }

    /**
     * 添加番茄钟记录
     * @param {Object} record - 番茄钟记录
     * @returns {Promise<number>} - 插入的记录ID
     */
    addPomodoroRecord(record) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            const { start_time, duration, type, status, task_id = null, notes = '' } = record;
      
            this.db.run(
                `INSERT INTO pomodoro_records (start_time, duration, type, status, task_id, notes)
         VALUES (?, ?, ?, ?, ?, ?)`,
                [start_time, duration, type, status, task_id, notes],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
        });
    }

    /**
     * 更新番茄钟记录
     * @param {Object} record - 番茄钟记录
     * @returns {Promise<boolean>} - 更新是否成功
     */
    updatePomodoroRecord(record) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            const { start_time, actual_duration, status, notes } = record;
      
            const startTimeStr = start_time instanceof Date
                ? start_time.toISOString()
                : start_time;
      
            // 查找最近的记录来更新
            this.db.run(
                `UPDATE pomodoro_records 
         SET actual_duration = ?, status = ?, notes = ?
         WHERE start_time = ? 
         OR (start_time <= datetime(?, '+10 seconds') AND start_time >= datetime(?, '-10 seconds'))
         ORDER BY id DESC LIMIT 1`,
                [actual_duration, status, notes || '', startTimeStr, startTimeStr, startTimeStr],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.changes > 0);
                    }
                }
            );
        });
    }

    /**
     * 获取番茄钟记录
     * @param {Object} options - 查询选项
     * @returns {Promise<Array>} - 番茄钟记录数组
     */
    getPomodoroRecords(options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            const { limit = 100, offset = 0, startDate, endDate, status, type } = options;
      
            let query = `SELECT * FROM pomodoro_records WHERE 1=1`;
            const params = [];
      
            if (startDate) {
                query += ` AND start_time >= ?`;
                params.push(startDate instanceof Date ? startDate.toISOString() : startDate);
            }
      
            if (endDate) {
                query += ` AND start_time <= ?`;
                params.push(endDate instanceof Date ? endDate.toISOString() : endDate);
            }
      
            if (status) {
                query += ` AND status = ?`;
                params.push(status);
            }
      
            if (type) {
                query += ` AND type = ?`;
                params.push(type);
            }
      
            query += ` ORDER BY start_time DESC LIMIT ? OFFSET ?`;
            params.push(limit, offset);
      
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 添加待办事项
     * @param {Object} todo - 待办事项
     * @returns {Promise<number>} - 插入的记录ID
     */
    addTodo(todo) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            const { content, priority = 'medium', due_date = null, pomodoro_estimate = 1 } = todo;
      
            this.db.run(
                `INSERT INTO todos (content, priority, due_date, pomodoro_estimate)
         VALUES (?, ?, ?, ?)`,
                [content, priority, due_date, pomodoro_estimate],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(this.lastID);
                    }
                }
            );
      
            // 更新统计信息
            this.updateDailyStatistic('tasks_added', 1);
        });
    }

    /**
     * 更新待办事项
     * @param {number} id - 待办事项ID
     * @param {Object} updates - 更新数据
     * @returns {Promise<boolean>} - 更新是否成功
     */
    updateTodo(id, updates) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            const fields = [];
            const values = [];
      
            // 构建更新字段
            Object.entries(updates).forEach(([key, value]) => {
                if (key !== 'id') {
                    fields.push(`${key} = ?`);
                    values.push(value);
                }
            });
      
            // 添加更新时间
            fields.push('updated_at = CURRENT_TIMESTAMP');
      
            // 如果完成状态改变为true，更新完成时间
            if (updates.is_completed === 1 || updates.is_completed === true) {
                fields.push('completed_at = CURRENT_TIMESTAMP');
                // 更新统计信息
                this.updateDailyStatistic('tasks_completed', 1);
            }
      
            values.push(id);
      
            const query = `UPDATE todos SET ${fields.join(', ')} WHERE id = ?`;
      
            this.db.run(query, values, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * 获取待办事项列表
     * @param {Object} options - 查询选项
     * @returns {Promise<Array>} - 待办事项数组
     */
    getTodos(options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            const { limit = 100, offset = 0, showCompleted = true, sortBy = 'priority' } = options;
      
            let query = `SELECT * FROM todos`;
            const params = [];
      
            if (!showCompleted) {
                query += ` WHERE is_completed = 0`;
            }
      
            // 排序
            switch (sortBy) {
                case 'dueDate':
                    query += ` ORDER BY due_date IS NULL, due_date ASC`;
                    break;
                case 'createdAt':
                    query += ` ORDER BY created_at DESC`;
                    break;
                case 'priority':
                default:
                    query += ` ORDER BY 
            CASE priority 
              WHEN 'urgent' THEN 1 
              WHEN 'high' THEN 2 
              WHEN 'medium' THEN 3 
              WHEN 'low' THEN 4 
              ELSE 5 
            END`;
                    break;
            }
      
            query += ` LIMIT ? OFFSET ?`;
            params.push(limit, offset);
      
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * 删除待办事项
     * @param {number} id - 待办事项ID
     * @returns {Promise<boolean>} - 删除是否成功
     */
    deleteTodo(id) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            this.db.run(`DELETE FROM todos WHERE id = ?`, [id], function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes > 0);
                }
            });
        });
    }

    /**
     * 保存设置
     * @param {string} key - 设置键
     * @param {string} value - 设置值
     * @returns {Promise<boolean>} - 保存是否成功
     */
    saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
      
            this.db.run(
                `INSERT INTO settings (key, value) VALUES (?, ?)
         ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
                [key, value, value],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    }

    /**
     * 获取设置
     * @param {string} key - 设置键
     * @returns {Promise<string>} - 设置值
     */
    getSetting(key) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
        
            this.db.get(`SELECT value FROM settings WHERE key = ?`, [key], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row ? row.value : null);
                }
            });
        });
    }

    /**
     * 保存统计数据
     * @param {Object} data - 统计数据
     * @returns {Promise<boolean>} - 保存是否成功
     */
    saveStatistic(data) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
        
            const { date, ...stats } = data;
        
            this.db.run(
                `INSERT INTO statistics (date, ${Object.keys(stats).join(', ')})
             VALUES (?, ${Object.keys(stats).map(() => '?').join(', ')})
             ON CONFLICT(date) DO UPDATE SET ${Object.keys(stats).map(key => `${key} = ?`).join(', ')}`,
                [date, ...Object.values(stats), ...Object.values(stats)],
                function (err) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(true);
                    }
                }
            );
        });
    }

    /**
     * 获取统计数据
     * @param {Object} options - 查询选项
     * @returns {Promise<Array>} - 统计数据数组
     */
    getStatistics(options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                return reject(new Error('Database not initialized'));
            }
        
            const { startDate, endDate } = options;
        
            let query = `SELECT * FROM statistics WHERE 1=1`;
            const params = [];
        
            if (startDate) {
                query += ` AND date >= ?`;
                params.push(startDate instanceof Date ? startDate.toISOString() : startDate);
            }
        
            if (endDate) {
                query += ` AND date <= ?`;
                params.push(endDate instanceof Date ? endDate.toISOString() : endDate);
            }
        
            query += ` ORDER BY date ASC`;
        
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }
}
