# 经管之星 - 智能问答系统

面向企业经营数据管理的智能问答系统，用户可通过自然语言查询经营数据，系统返回分析结果与可视化图表。

## 功能模块

- **智能问数对话**：自然语言提问，返回数据分析结论、数据表格和可视化图表
- **对话历史管理**：支持多轮对话、历史记录切换与持久化
- **应用配置**：系统参数配置管理
- **回复校对**：AI 回复内容的人工审核与反馈

## 技术栈

- **前端**：React + Next.js（App Router）+ TypeScript + Tailwind CSS
- **后端**：Python + FastAPI
- **数据**：虚拟 Mock 数据库（演示用）

## 快速启动

### 后端

```bash
cd backend
pip install -r requirements.txt
python app.py
```

后端运行在 `http://localhost:8000`

### 前端

```bash
pnpm install
pnpm exec next dev
```

前端运行在 `http://localhost:3000`
