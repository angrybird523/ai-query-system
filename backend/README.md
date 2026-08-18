# 经管之星智能问答系统 - Python 后端

基于 FastAPI 的智能问答系统后端服务。

## 技术栈

- **FastAPI**：现代、快速的 Web 框架
- **Pydantic**：数据校验和序列化
- **Uvicorn**：ASGI 服务器

## 项目结构

```
backend/
├── app.py                  # 主入口文件
├── requirements.txt        # Python 依赖
├── services/
│   ├── __init__.py
│   └── chat_service.py     # 对话处理服务
├── data/
│   ├── __init__.py
│   └── mock_data.py        # 虚拟数据库
└── README.md              # 本文件
```

## 快速开始

### 1. 安装依赖

```bash
cd backend
pip install -r requirements.txt
```

### 2. 启动服务

```bash
python app.py
```

服务将在 `http://localhost:8000` 启动。

### 3. 测试接口

访问 `http://localhost:8000/docs` 查看自动生成的 API 文档。

使用 curl 测试：

```bash
curl -X POST http://localhost:8000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\": \"本月销售额是多少\"}"
```

## API 接口

### POST /api/chat

接收用户消息，返回 AI 回复。

**请求体：**
```json
{
  "message": "本月销售额是多少",
  "conversationId": "conv-001"
}
```

**响应：**
```json
{
  "reply": "根据查询，本月销售额为 100 万元...",
  "chartData": {
    "categories": ["产品线A", "产品线B"],
    "series": [
      {
        "name": "目标",
        "data": [80, 90]
      },
      {
        "name": "实际",
        "data": [100, 85]
      }
    ]
  },
  "meta": {
    "tokens": 150,
    "time": 0.5,
    "timestamp": "2026-08-11T17:50:00Z"
  }
}
```

### GET /api/health

健康检查接口。

**响应：**
```json
{
  "status": "ok",
  "message": "服务运行正常"
}
```

## 前端对接

修改 `src/app/api/chat/route.ts`，将请求转发到 Python 后端：

```typescript
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { message, conversationId } = await req.json();
    
    // 转发请求到 Python 后端
    const response = await fetch('http://localhost:8000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversationId,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('API 调用失败:', error);
    
    return NextResponse.json(
      {
        reply: '抱歉，服务暂时不可用，请稍后重试。',
        chartData: null,
        meta: { tokens: 0, time: 0, timestamp: new Date().toISOString() },
      },
      { status: 500 }
    );
  }
}
```

## 扩展指南

### 接入真实大模型

修改 `services/chat_service.py` 中的 `process_message` 函数：

```python
def process_message(self, message: str, conversation_id: Optional[str] = None) -> dict:
    # 调用通义千问 API
    import dashscope
    from dashscope import Generation
    
    response = Generation.call(
        model='qwen-turbo',
        messages=[{'role': 'user', 'content': message}]
    )
    
    return {
        "reply": response.output.text,
        "chartData": None,
        "meta": {"tokens": response.usage.total_tokens, "time": 0.5}
    }
```

### 接入真实数据库

修改 `data/mock_data.py`，替换为数据库查询：

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

engine = create_engine("mysql://user:pass@localhost/dbname")
Session = sessionmaker(bind=engine)

def query_data(self, message: str) -> dict:
    session = Session()
    # 执行数据库查询
    result = session.execute("SELECT ...")
    return result
```
