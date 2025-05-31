# 习惯养成追踪应用

一个基于 Expo 和 Appwrite 构建的习惯养成追踪应用，帮助用户建立和维护良好的习惯。

## 功能特点

- 📱 用户认证系统
- ✅ 习惯追踪管理
- 🔥 连续打卡统计
- 🏆 习惯排行榜
- 📊 数据可视化
- 🌐 云端数据同步

## 技术栈

- **前端框架**: Expo (React Native)
- **后端服务**: Appwrite
- **状态管理**: React Context
- **UI 组件**: React Native Paper
- **图标**: Expo Vector Icons

## 项目结构

my-expo/
├── app/ # 应用主目录
│ ├── layout.tsx # 应用布局配置
│ ├── auth.tsx # 认证页面
│ └── (tabs)/ # 标签页面
│ ├── index.tsx # 主页（今日习惯）
│ ├── streaks.tsx # 习惯统计页
│ └── add-habit.tsx # 添加习惯页
│
├── hooks/ # 自定义 Hooks
│ ├── useAuth.ts # 认证相关 Hook
│ └── useHabitData.ts # 习惯数据管理 Hook
│
├── lib/ # 工具库
│ ├── appwrite.ts # Appwrite 配置
│ └── auth-context.tsx # 认证上下文
│
└── types/ # 类型定义
└── database.type.ts # 数据库类型定义

## 主要功能模块

### 认证系统 (auth.tsx)

- 用户注册
- 用户登录
- 会话管理

### 习惯管理 (index.tsx)

- 查看今日待完成习惯
- 左滑删除习惯
- 右滑完成习惯
- 实时同步状态

### 习惯统计 (streaks.tsx)

- 显示习惯连续打卡天数
- 最佳连续记录
- 总完成次数
- 排行榜系统

### 添加习惯 (add-habit.tsx)

- 创建新习惯
- 设置习惯频率（每日/每周/每月）
- 添加习惯描述
