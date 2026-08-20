/**
 * 文件名: route.ts
 * 功能描述: AI问答后端API路由，负责将请求转发到Python后端服务。
 *           Python后端地址：http://localhost:8000/api/chat
 * 主要导出: POST（处理聊天消息的API端点）
 */

import { NextResponse } from 'next/server';

/**
 * POST /api/chat
 * 接收用户消息，转发到Python后端处理，返回AI回复
 *
 * @param request - HTTP请求，body包含 { message: string, conversationId?: string }
 * @returns JSON响应 { success: boolean, data: QueryResult }
 */
export async function POST(request: Request) {
  try {
    const { message, conversationId } = await request.json();

    // 转发请求到 Python 后端（支持通过环境变量配置地址）
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/chat`, {
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
      throw new Error(`Python后端返回错误: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('API 调用失败:', error);

    // 返回与前端期望一致的错误格式
    return NextResponse.json({
      success: false,
      data: {
        summary: '抱歉，后端服务暂时不可用，请稍后重试。',
        insights: [],
        chartData: null,
        meta: {
          durationMs: 0,
          tokenCount: 0,
          timestamp: Date.now(),
        },
      },
    });
  }
}
