"""
经管之星智能问答系统 - Python 后端主入口

基于 FastAPI 实现的对话服务 API
返回格式与前端 QueryResult 类型完全匹配
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from services.chat_service import ChatService

# 创建 FastAPI 应用
app = FastAPI(
    title="经管之星智能问答系统 API",
    description="智能问答系统后端服务",
    version="1.0.0"
)

# 配置 CORS（允许跨域）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化服务
chat_service = ChatService()


# ==================== 请求模型 ====================

class ChatRequest(BaseModel):
    """对话请求"""
    message: str
    conversationId: Optional[str] = None


# ==================== API 路由 ====================

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """
    对话接口

    接收用户消息，返回 AI 回复。
    返回格式：{ success, data: QueryResult }
    """
    # 调用服务处理消息
    result = chat_service.process_message(
        message=request.message,
        conversation_id=request.conversationId
    )

    return {
        "success": True,
        "data": result
    }


@app.get("/api/health")
async def health_check():
    """健康检查"""
    return {"status": "ok", "message": "经管之星后端服务运行正常"}


# ==================== 启动服务 ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
