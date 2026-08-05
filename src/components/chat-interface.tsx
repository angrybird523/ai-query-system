'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { QueryResult } from '@/lib/mock-data';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  data?: QueryResult;
  loading?: boolean;
}

const suggestedQuestions = [
  '各产品线销售情况',
  '北京的产品线收入情况',
  '深圳的产品销售情况',
];

export function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      loading: true,
    };

    setMessages((prev) => [...prev, userMessage, loadingMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content.trim() }),
      });

      const result = await response.json();

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: result.data?.summary || result.error || '抱歉，暂时无法处理您的问题。',
                data: result.data,
                loading: false,
              }
            : msg
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === loadingMessage.id
            ? {
                ...msg,
                content: '网络连接异常，请稍后重试。',
                loading: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">AI 智能问数对话</h1>
        <div className="flex items-center gap-4">
          {/* Notification */}
          <button className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          {/* User Avatar */}
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium cursor-pointer">
            管
          </div>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Welcome Screen */
          <div className="flex flex-col items-center justify-center h-full px-6">
            <div className="text-center max-w-lg">
              <h2 className="text-[28px] font-bold text-[#0F172A] mb-3">你好</h2>
              <p className="text-[16px] text-[#2563EB] font-medium mb-2">
                我是经管之星 · AI问数助手
              </p>
              <p className="text-[14px] text-[#64748B] leading-relaxed">
                欢迎使用智能AI问数，您可以向我咨询经营数据、报表分析相关问题。
              </p>
            </div>

            {/* Suggested Questions */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="px-4 py-2 rounded-full border border-[#E2E8F0] text-sm text-[#334155] hover:bg-[#EFF6FF] hover:border-[#2563EB] hover:text-[#2563EB] transition-all duration-150"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-[#E2E8F0] px-6 py-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 focus-within:border-[#2563EB] focus-within:ring-1 focus-within:ring-[#2563EB]/20 transition-all">
            {/* Lightning Icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>

            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="请写下您的想法..."
              className="flex-1 bg-transparent outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8]"
              disabled={isLoading}
            />

            {/* Microphone */}
            <button className="p-1.5 rounded-md hover:bg-[#E2E8F0] transition-colors shrink-0" title="语音输入">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            </button>

            {/* Send Button */}
            <button
              onClick={() => sendMessage(inputValue)}
              disabled={!inputValue.trim() || isLoading}
              className={cn(
                'p-2 rounded-lg transition-all duration-150 shrink-0',
                inputValue.trim() && !isLoading
                  ? 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm'
                  : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
              )}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-[#94A3B8] text-center mt-2">
            AI 问数助手基于经营数据为您提供智能分析
          </p>
        </div>
      </div>
    </div>
  );
}

/* Message Bubble Component */
function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  if (message.loading) {
    return (
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center shrink-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        </div>
        <div className="bg-[#F8FAFC] rounded-2xl rounded-tl-sm px-4 py-3">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce [animation-delay:0ms]" />
            <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce [animation-delay:150ms]" />
            <div className="w-2 h-2 bg-[#2563EB] rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-medium',
          isUser ? 'bg-[#2563EB] text-white' : 'bg-[#EFF6FF] text-[#2563EB]'
        )}
      >
        {isUser ? '管' : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-[#2563EB] text-white rounded-tr-sm'
            : 'bg-[#F8FAFC] text-[#0F172A] rounded-tl-sm'
        )}
      >
        {/* Summary text */}
        <p className={cn(isUser ? 'text-white' : 'text-[#334155]')}>{message.content}</p>

        {/* Data Table */}
        {message.data?.table && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0]">
                  {message.data.table.headers.map((h, i) => (
                    <th key={i} className="text-left py-2 px-2 font-semibold text-[#64748B]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {message.data.table.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-[#E2E8F0]/60 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-2 px-2 text-[#334155]">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Insights */}
        {message.data?.insights && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs font-semibold text-[#2563EB]">分析洞察：</p>
            {message.data.insights.map((insight, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-[#64748B]">
                <span className="w-1 h-1 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                <span>{insight}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
