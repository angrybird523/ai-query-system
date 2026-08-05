# AGENTS.md

## 项目概览

经管之星 · AI 智能问数系统 —— 面向企业经营数据的智能问答分析平台。

## 技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI**: shadcn/ui + Tailwind CSS 4
- **包管理**: pnpm

## 目录结构

```
src/
├── app/
│   ├── api/chat/route.ts    # AI 问答 API (POST)
│   ├── layout.tsx            # 根布局
│   ├── page.tsx              # 首页入口
│   └── globals.css           # 全局样式
├── components/
│   ├── home-page.tsx         # 主页面容器（页面路由切换）
│   ├── sidebar.tsx           # 左侧导航栏（支持系统管理展开子菜单）
│   ├── chat-interface.tsx    # 对话界面（含欢迎页、消息列表、输入框）
│   └── app-config-page.tsx   # 应用配置页面（6个功能开关卡片）
├── lib/
│   ├── utils.ts              # 通用工具 (cn)
│   └── mock-data.ts          # 虚拟经营数据库 + 查询逻辑
└── server.ts                 # 自定义服务端入口
```

## 核心功能

1. **左侧导航**: 智能问数 / 系统管理（展开→应用配置）/ 反馈管理
2. **欢迎界面**: 大标题 + 副标题 + 推荐问题按钮
3. **对话交互**: 用户输入 → API 查询 → 返回数据表格 + 分析洞察
4. **应用配置**: 6 个功能开关卡片（开场白/问题建议/TTS/STT/模型配置/常问设置）
5. **虚拟数据库**: 4 城市 × 3 产品线 × 3 月份 = 36 条经营记录

## API 接口

| 路径 | 方法 | 说明 |
|------|------|------|
| /api/chat | POST | 接收 `{ message: string }`，返回 `{ success, data: { summary, table, insights } }` |

## 开发命令

```bash
pnpm dev          # 开发环境
pnpm build        # 生产构建
pnpm ts-check     # TypeScript 检查
pnpm lint         # ESLint 检查
```

## 设计规范

详见 `DESIGN.md`。主色 `#2563EB`，蓝白色调，简洁现代风格。
