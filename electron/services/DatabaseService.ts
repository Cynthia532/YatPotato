import { Database } from 'sqlite3';
import path from 'path';
import { app } from 'electron';

interface DatabaseConfig {
  path: string;
  tables: {
    [key: string]: string;
  };
}

export class DatabaseService {
  private db: Database;
  private config: DatabaseConfig;

  constructor() {
    const userDataPath = app.getPath('userData');
    this.config = {
      path: path.join(userDataPath, 'yatpotato.db'),
      tables: {
        pomodoro_sessions: `
          CREATE TABLE IF NOT EXISTS pomodoro_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            start_time TEXT NOT NULL,
            end_time TEXT,
            duration INTEGER NOT NULL,
            type TEXT CHECK(type IN ('work', 'break')) NOT NULL,
            task_id INTEGER,
            completed BOOLEAN DEFAULT FALSE,
            FOREIGN KEY(task_id) REFERENCES tasks(id)
          )
        `,
        tasks: `
          CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            priority TEXT CHECK(priority IN ('low', 'medium', 'high')) NOT NULL,
            status TEXT CHECK(status IN ('todo', 'in-progress', 'completed')) NOT NULL,
            due_date TEXT,
            estimated_pomodoros INTEGER DEFAULT 1,
            completed_pomodoros INTEGER DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            tags TEXT
          )
        `
      }
    };
    this.db = new Database(this.config.path);
  }

  async initialize(): Promise<void> {
    await this.createTables();
  }

  private async createTables(): Promise<void> {
    const promises = Object.entries(this.config.tables).map(
      ([, sql]) => this.execute(sql)
    );
    await Promise.all(promises);
  }

  execute(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}