/**
 * 文件名: chat-interface.tsx
 * 功能描述: 智能问数对话界面主组件，负责状态管理和整体布局。
 *           整合欢迎页、消息列表、输入框、历史对话等功能。
 *           通过调用后端 API 获取AI回复，支持流式交互体验。
 *           通过 onMessagesUpdate 回调将消息同步给父组件，实现对话历史持久化。
 * 主要导出: ChatInterface
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './message-bubble';
import { InputBar } from './input-bar';
import type { Message, HistoryConversation } from '@/types';

/**
 * 推荐问题列表（显示在欢迎页）
 */
const SUGGESTED_QUESTIONS = [
  '北京的产品线收入情况',
  '上海各产品线销售对比',
  '深圳的产品销售情况',
  '各产品线销售情况',
];

/**
 * ChatInterface 组件属性
 */
interface ChatInterfaceProps {
  /** 当前选中的历史对话（可选） */
  currentConversation?: HistoryConversation | null;
  /** 消息更新回调：将当前对话的最新消息同步给父组件，用于持久化 */
  onMessagesUpdate?: (conversationId: string, messages: Message[], title: string) => void;
  /** 自动创建新对话回调：当用户在无对话状态下发送消息时，自动创建一条新记录 */
  onAutoCreateConversation?: (messages: Message[], title: string) => string;
}

/**
 * 智能问数对话界面主组件
 * 管理消息列表状态、处理用户发送消息、展示欢迎页或对话内容
 */
export function ChatInterface({ currentConversation, onMessagesUpdate, onAutoCreateConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 记录当前对话 ID（可能来自 props，也可能是自动创建的）
  const [localConversationId, setLocalConversationId] = useState<string | null>(null);
  // 用 ref 同步追踪 conversation ID，解决 handleSend 闭包中 state 未更新的问题
  const localConvIdRef = useRef<string | null>(null);
  // 用 ref 追踪上一次加载的 conversation ID，避免父组件同步数据时重复重置消息
  const prevLoadedConvIdRef = useRef<string | null>(null);

  // 仅当 conversation ID 真正变化时（用户切换对话 / 新建对话），才重置本地消息
  // 父组件因 syncToParent 更新 currentConversation 对象引用时，ID 不变，不会触发重置
  useEffect(() => {
    const convId = currentConversation?.id ?? null;
    if (convId === prevLoadedConvIdRef.current) return;
    prevLoadedConvIdRef.current = convId;
    setLocalConversationId(convId);
    localConvIdRef.current = convId;

    if (currentConversation && currentConversation.messages.length > 0) {
      setMessages(currentConversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        data: m.data,
      })));
    } else if (convId !== null) {
      // 切换到一个没有消息的对话（如点了"新建对话"），清空本地消息
      setMessages([]);
    }
    // convId === null 时不清空消息（自动创建对话后 selectedConversation 可能仍为 null）
  }, [currentConversation]);

  // 消息更新后自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /**
   * 获取有效的对话 ID：优先用已有的，否则自动创建新对话
   */
  const getEffectiveConversationId = (newMessages: Message[]): string | null => {
    // 用 ref 而非 state，避免闭包读到过期值
    if (localConvIdRef.current) return localConvIdRef.current;
    // 没有对话记录，自动创建一条新对话
    if (onAutoCreateConversation) {
      const firstUserMsg = newMessages.find((m) => m.role === 'user');
      const title = firstUserMsg
        ? (firstUserMsg.content.length > 15 ? firstUserMsg.content.slice(0, 15) + '...' : firstUserMsg.content)
        : '新对话';
      const newId = onAutoCreateConversation(newMessages, title);
      localConvIdRef.current = newId;
      setLocalConversationId(newId);
      return newId;
    }
    return null;
  };

  /**
   * 将当前消息同步给父组件（持久化到对话历史）
   */
  const syncToParent = (newMessages: Message[]) => {
    const convId = getEffectiveConversationId(newMessages);
    if (convId && onMessagesUpdate) {
      const firstUserMsg = newMessages.find((m) => m.role === 'user');
      const title = firstUserMsg
        ? (firstUserMsg.content.length > 15 ? firstUserMsg.content.slice(0, 15) + '...' : firstUserMsg.content)
        : '新对话';
      onMessagesUpdate(convId, newMessages, title);
    }
  };

  /**
   * 发送消息并获取AI回复
   * 流程：添加用户消息 → 显示loading → 调用API → 替换为AI回复
   */
  const handleSend = async (content: string) => {
    // 1. 添加用户消息到列表
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
    };

    // 2. 创建loading占位消息
    const loadingId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: loadingId,
      role: 'assistant',
      content: '',
      loading: true,
    };

    const updatedMessages = [...messages, userMessage, loadingMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    // 如果当前没有对话记录（既没有本地 ID，props 也没传），自动创建一条新对话
    if (!localConvIdRef.current && !currentConversation?.id && onAutoCreateConversation) {
      const title = content.length > 15 ? content.slice(0, 15) + '...' : content;
      const newId = onAutoCreateConversation(updatedMessages, title);
      localConvIdRef.current = newId;
      setLocalConversationId(newId);
    }

    try {
      // 3. 调用后端 API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content }),
      });

      const result = await response.json();

      // 保证loading至少显示1.2秒，让用户能看到
      const minDelay = new Promise(resolve => setTimeout(resolve, 1200));
      await minDelay;

      // 4. 用AI回复替换loading消息
      if (result.success) {
        const aiMessage: Message = {
          id: loadingId,
          role: 'assistant',
          content: result.data.summary,
          data: result.data,
        };
        const finalMessages = updatedMessages.map((m) => (m.id === loadingId ? aiMessage : m));
        setMessages(finalMessages);
        // 同步完整消息（含AI回复）到父组件
        syncToParent(finalMessages);
      } else {
        // 错误处理
        const errorMessage: Message = {
          id: loadingId,
          role: 'assistant',
          content: result.error || '抱歉，处理您的请求时出现了问题，请稍后重试。',
        };
        const finalMessages = updatedMessages.map((m) => (m.id === loadingId ? errorMessage : m));
        setMessages(finalMessages);
        syncToParent(finalMessages);
      }
    } catch {
      // 网络错误处理
      const errorMessage: Message = {
        id: loadingId,
        role: 'assistant',
        content: '网络连接异常，请检查网络后重试。',
      };
      const finalMessages = updatedMessages.map((m) => (m.id === loadingId ? errorMessage : m));
      setMessages(finalMessages);
      syncToParent(finalMessages);
    } finally {
      setIsLoading(false);
    }
  };

  // 是否有消息（决定显示欢迎页还是对话列表）
  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题栏 */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">智能问数</h1>
        <div className="flex items-center gap-4">
          {/* 通知铃铛 */}
          <button className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* 用户头像 */}
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium cursor-pointer">
            管
          </div>
        </div>
      </header>

      {/* 中间内容区域：欢迎页 或 消息列表 */}
      <div className="flex-1 overflow-y-auto">
        {hasMessages ? (
          /* 对话消息列表 */
          <div className="max-w-[800px] mx-auto px-6 py-6 space-y-4">
            {messages.map((msg, index) => (
              <MessageBubble key={msg.id} message={msg} isLast={index === messages.length - 1} />
            ))}
            {/* 滚动锚点 */}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* 欢迎页 */
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="max-w-[600px] w-full text-center">
              {/* 大标题 */}
              <h2 className="text-[28px] font-bold text-[#0F172A] mb-2">
                你好，我是AI问数助手
              </h2>
              {/* 副标题 */}
              <p className="text-[16px] text-[#64748B] mb-8">
                我可以帮您查询和分析企业经营数据，请告诉我您想了解什么？
              </p>

              {/* 推荐问题按钮 */}
              <div className="flex flex-wrap justify-center gap-3">
                {SUGGESTED_QUESTIONS.map((question) => (
                  <button
                    key={question}
                    onClick={() => handleSend(question)}
                    className="px-4 py-2.5 rounded-[20px] border border-[#E2E8F0] text-sm text-[#334155] hover:bg-[#EFF6FF] hover:text-[#2563EB] hover:border-[#2563EB]/20 transition-all duration-200"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部输入框 */}
      <InputBar onSend={handleSend} isLoading={isLoading} />
    </div>
  );
}
