/**
 * 文件名: route.ts
 * 功能描述: AI问答后端API路由，负责请求解析和响应封装。
 *           业务逻辑委托给 chat-service 服务层处理。
 * 主要导出: POST（处理聊天消息的API端点）
 */

import { NextResponse } from 'next/server';
import { processChatMessage } from '@/lib/services/chat-service';

/**
 * POST /api/chat
 * 接收用户消息，调用服务层处理，返回结构化查询结果
 *
 * @param request - HTTP请求，body包含 { message: string }
 * @returns JSON响应 { success: boolean, data?: QueryResult, error?: string }
 */
export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    // 调用服务层处理消息
    const result = await processChatMessage(message);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    // 错误信息提取
    const errorMessage = error instanceof Error ? error.message : '服务处理异常，请稍后重试';

    return NextResponse.json(
      { error: errorMessage },
      { status: errorMessage === '请输入有效的问题' ? 400 : 500 }
    );
  }
}
