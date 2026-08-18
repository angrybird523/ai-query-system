# 经管之星 - 智能问答系统

基于通义千问大模型的企业经营数据智能问答系统，支持自然语言提问，返回结构化分析结果（摘要、表格、图表、洞察建议）。

## 技术栈

- **前端**：Next.js + TypeScript + Tailwind CSS
- **后端**：Python FastAPI + 通义千问 API（模型：qwen-turbo，通过 OpenAI 兼容模式调用）

## 功能

- 自然语言查询经营数据，AI 返回文字摘要 + 数据表格 + 可视化图表
- 多轮对话与历史记录持久化
- 应用配置管理
- AI 回复人工审核与反馈

## 启动

```bash
# 后端（端口 8000）
cd backend && pip install -r requirements.txt && python app.py

# 前端（端口 3000）
pnpm install && pnpm exec next dev
```
