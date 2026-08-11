/**
 * 文件名: chat-service.ts
 * 功能描述: 对话处理服务层，封装AI问答的核心业务逻辑。
 *           将 route.ts 中的业务逻辑抽离至此，实现请求处理与业务逻辑分离。
 * 主要导出: processChatMessage（处理用户消息并返回查询结果）
 */

import { querySalesData } from '@/lib/data/mock-data';
import type { QueryResult } from '@/types';

/**
 * 处理用户聊天消息
 * 模拟AI思考延迟后，调用数据查询引擎获取结构化回答
 *
 * @param message - 用户发送的消息文本
 * @returns 查询结果（包含摘要、表格、洞察、图表等）
 * @throws 当消息为空或格式不正确时抛出错误
 */
export async function processChatMessage(message: string): Promise<QueryResult> {
  // 参数校验
  if (!message || typeof message !== 'string') {
    throw new Error('请输入有效的问题');
  }

  // 模拟 AI 思考延迟（800ms），让交互体验更自然
  await new Promise((resolve) => setTimeout(resolve, 800));

  // 调用数据查询引擎，基于关键词匹配返回结构化结果
  const result = querySalesData(message);

  return result;
}
