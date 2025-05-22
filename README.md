# 🍅 YatPotato - 超级番茄钟工具

[![Electron Version](https://img.shields.io/badge/Electron-24.0-blue)](https://www.electronjs.org/)
[![React Version](https://img.shields.io/badge/React-18.2-blue)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Code Size](https://img.shields.io/github/languages/code-size/ouyangyipeng/YatPotato)](https://github.com/ouyangyipeng/YatPotato)
[![Top Language](https://img.shields.io/github/languages/top/ouyangyipeng/YatPotato)](https://github.com/ouyangyipeng/YatPotato)
[![Last Commit](https://img.shields.io/github/last-commit/ouyangyipeng/YatPotato)](https://github.com/ouyangyipeng/YatPotato/commits/main)

> 一个专注效率的跨平台桌面应用，集成番茄工作法、任务管理和时间追踪功能

![icon1](assets/icon/呀土豆.jpg)

## 🌟 核心功能

### 🕒 番茄钟系统

- 正/倒计时模式切换（25/5分钟周期）
- 自定义计时时长与休息间隔
- 完成统计与历史记录
- 系统通知与声音提醒

### 📝 智能待办清单

- 任务增删改查（支持Markdown）
- 优先级标签与分类管理
- 任务-番茄钟自动关联
- 到期提醒与进度追踪

### 🗓️ 时间管理

- 重要日期倒计时
- 周/月视图时间统计
- 专注数据可视化（热力图/趋势图）
- 数据导出（CSV/JSON）

## 🛠️ 技术栈

**核心框架**  

| 技术       | 用途         | 版本 |
| ---------- | ------------ | ---- |
| Electron   | 桌面应用框架 | 24.x |
| React      | 界面开发     | 18.x |
| TypeScript | 类型安全     | 5.x  |
| SQLite     | 本地存储     | 3.x  |

**关键依赖**  

- `electron-forge`: 应用打包工具
- `ant-design`: UI组件库
- `date-fns`: 日期处理
- `recharts`: 数据可视化

## 🚀 快速开始

### 开发环境

```bash
# 克隆仓库
git clone https://github.com/ouyangyipeng/YatPotato.git

# 安装依赖
npm install

# 启动开发模式
npm run dev

# 打包应用（生成在out目录）
npm run make
```

### 生产构建

```bash
# Windows
npm run package:win

# macOS
npm run package:mac

# Linux
npm run package:linux
```

## 📂 项目结构

```plaintext
YatPotato/
├── electron/                  # Electron 主进程代码
│   ├── main.ts                # 主进程入口 (TypeScript)
│   ├── preload.ts             # 预加载脚本 (TypeScript)
│   ├── services/
│   │   ├── TimerService.ts    # 计时器服务
│   │   ├── DatabaseService.ts # 数据库服务
│   │   └── WindowManager.ts   # 窗口管理
│   └── types/                # Electron 相关类型定义
│       └── electron.d.ts      # 扩展 Electron 类型
│
├── src/                       # 渲染进程代码 (React + TypeScript)
│   ├── core/
│   │   ├── app/
│   │   │   ├── config.ts     # 应用配置
│   │   │   └── constants.ts  # 常量定义
│   │   └── utils/
│   │       ├── timeFormatter.ts # 时间格式化工具
│   │       └── notification.ts  # 通知工具
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   └── styles.module.css
│   │   │   └── ProgressRing/
│   │   │       ├── index.tsx
│   │   │       └── styles.module.css
│   │   └── layout/
│   │       ├── Sidebar.tsx
│   │       └── MainLayout.tsx
│   ├── modules/
│   │   ├── pomodoro/
│   │   │   ├── components/
│   │   │   │   ├── TimerDisplay.tsx
│   │   │   │   └── ControlPanel.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTimer.ts
│   │   │   ├── types.ts      # 模块特定类型
│   │   │   └── index.tsx
│   │   ├── todo/
│   │   │   ├── components/
│   │   │   │   ├── TodoItem.tsx
│   │   │   │   └── AddTodoForm.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useTodos.ts
│   │   │   ├── types.ts
│   │   │   └── index.tsx
│   │   └── analytics/
│   │       ├── charts/
│   │       │   └── ProductivityChart.tsx
│   │       ├── hooks/
│   │       │   └── useAnalytics.ts
│   │       ├── types.ts
│   │       └── index.tsx
│   ├── services/
│   │   ├── database.ts       # 数据库操作封装
│   │   └── api/
│   │       ├── timerAPI.ts    # 计时器接口
│   │       └── types.ts      # API 相关类型
│   ├── styles/
│   │   ├── global.css         # 全局样式
│   │   ├── theme.css          # 主题变量 (CSS Variables)
│   │   └── mixins.css         # 通用样式类
│   ├── common/
│   │   ├── eventBus.ts        # 事件总线
│   │   ├── GlobalState.tsx    # 全局状态上下文
│   │   └── types.ts           # 公共类型定义
│   ├── router/                # 路由配置
│   │   └── index.tsx
│   ├── utils/
│   │   ├── helpers.ts        # 通用工具函数
│   │   └── validation.ts     # 验证工具
│   └── types/                # 全局类型定义
│       └── global.d.ts        # 全局类型扩展
│
├── assets/                   # 静态资源
├── database/                 # 数据库文件
└── types/                    # 项目类型定义
    └── vite-env.d.ts         # Vite 环境类型
```

## 🤝 参与贡献

1. Fork本仓库
2. 创建特性分支：

   ```bash
   git checkout -b feat/your-feature
   ```

3. 提交代码（遵循[Angular提交规范](https://www.conventionalcommits.org/)）
4. 发起Pull Request

**代码规范**  

- 组件命名：`PascalCase`
- TypeScript接口：`I`前缀（如`ITodoItem`）
- 样式类名：BEM命名法（`block__element--modifier`）

## 📄 文档体系

| 文档                               | 说明               |
| ---------------------------------- | ------------------ |
| [架构设计](./docs/ARCHITECTURE.md) | 系统架构与模块设计 |
| [接口规范](./docs/API.md)          | 模块间通信协议     |
| [测试指南](./docs/TESTING.md)      | 自动化测试方案     |
| [用户手册](./docs/MANUAL.md)       | 最终用户使用说明   |

## 📜 开源协议

[MIT License](LICENSE) - 自由使用、修改和分发，需保留原始授权声明

---

**Made with ❤️ by YatPotatoTeam**  
[![GitHub Issues](https://img.shields.io/github/issues/ouyangyipeng/YatPotato)](https://github.com/ouyangyipeng/YatPotato/issues)
[![GitHub Stars](https://img.shields.io/github/stars/ouyangyipeng/YatPotato)](https://github.com/ouyangyipeng/YatPotato/stargazers)
