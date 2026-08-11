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
│   ├── api/chat/route.ts          # AI 问答 API（薄层，调用 service）
│   ├── layout.tsx                  # 根布局
│   ├── page.tsx                    # 首页入口
│   └── globals.css                 # 全局样式
├── types/
│   └── index.ts                    # 全局类型定义集中管理
├── components/
│   ├── home-page.tsx               # 主页面容器（路由切换 + 状态管理）
│   ├── layout/
│   │   └── sidebar.tsx             # 左侧导航栏（支持子菜单展开）
│   ├── chat/
│   │   ├── chat-interface.tsx      # 对话界面主组件（状态管理 + 布局）
│   │   ├── message-bubble.tsx      # 消息气泡（用户/AI，含操作栏）
│   │   ├── input-bar.tsx           # 底部输入框（文本 + 语音输入）
│   │   ├── history-panel.tsx       # 历史对话侧边栏面板
│   │   └── data-chart.tsx          # 数据可视化柱状图（纯SVG）
│   ├── config/
│   │   └── app-config-page.tsx     # 应用配置页面（6个功能开关卡片）
│   └── feedback/
│       └── reply-proof-page.tsx    # 回复校对页面（搜索+表格+分页+弹窗）
├── lib/
│   ├── data/
│   │   ├── mock-data.ts            # 虚拟经营数据库 + 查询引擎
│   │   └── history-data.ts         # 历史对话模拟数据
│   ├── services/
│   │   └── chat-service.ts         # 对话处理服务（业务逻辑层）
│   ├── utils/
│   │   ├── helpers.ts              # 通用辅助函数（cn 类名合并等）
│   │   └── speech.ts               # Web Speech API（TTS + STT）
│   └── utils.ts                    # shadcn/ui 依赖的 cn 函数（保留）
└── server.ts                       # 自定义服务端入口
```

## 核心功能

1. **左侧导航**: 智能问数 / 系统管理（展开→应用配置）/ 反馈管理（展开→回复校对）
2. **历史对话面板**: 点击智能问数展开，显示近30天对话记录，支持切换查看
3. **欢迎界面**: 大标题 + 副标题 + 推荐问题按钮
4. **对话交互**: 用户输入 → API 查询 → 返回数据表格 + 分析洞察
5. **语音功能**: TTS 朗读（AI回复下方喇叭按钮）+ STT 语音输入（麦克风按钮）
6. **应用配置**: 6 个功能开关卡片（开场白/问题建议/TTS/STT/模型配置/常问设置）
7. **回复校对**: 搜索过滤 + 数据表格 + 分页 + 反馈处理弹窗
8. **虚拟数据库**: 4 城市 × 3 产品线 × 3 月份 = 36 条经营记录

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
