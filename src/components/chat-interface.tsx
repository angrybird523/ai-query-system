'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { QueryResult, ChartData } from '@/lib/mock-data';
import type { HistoryConversation, HistoryMessage } from '@/lib/history-data';
import {
  isSpeechSynthesisSupported,
  isSpeechRecognitionSupported,
  speak,
  stopSpeaking,
  pauseSpeaking,
  resumeSpeaking,
  isSpeaking,
  isPaused,
  startRecording,
  stopRecording,
} from '@/lib/speech';

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

interface ChatInterfaceProps {
  currentConversation?: HistoryConversation | null;
  onSendMessage?: (message: string) => void;
}

export function ChatInterface({ currentConversation }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isPausedState, setIsPausedState] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check browser support
  const ttsSupported = isSpeechSynthesisSupported();
  const sttSupported = isSpeechRecognitionSupported();

  // Load history conversation
  useEffect(() => {
    if (currentConversation) {
      const historyMessages: Message[] = currentConversation.messages.map((m: HistoryMessage) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        data: m.data,
      }));
      setMessages(historyMessages);
    } else {
      // Clear messages when no conversation is selected (welcome page)
      setMessages([]);
    }
  }, [currentConversation]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      stopRecording();
    };
  }, []);

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

  // TTS handlers
  const handleSpeak = (messageId: string, text: string) => {
    if (speakingId === messageId) {
      if (isPausedState) {
        resumeSpeaking();
        setIsPausedState(false);
      } else {
        pauseSpeaking();
        setIsPausedState(true);
      }
      return;
    }

    // Stop any current speech
    stopSpeaking();
    setSpeakingId(null);
    setIsPausedState(false);

    speak(text, {
      rate: 1,
      volume: 1,
      lang: 'zh-CN',
      onStart: () => {
        setSpeakingId(messageId);
        setIsPausedState(false);
      },
      onEnd: () => {
        setSpeakingId(null);
        setIsPausedState(false);
      },
      onError: (error) => {
        console.error('TTS Error:', error);
        setSpeakingId(null);
        setIsPausedState(false);
      },
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setSpeakingId(null);
    setIsPausedState(false);
  };

  // STT handlers
  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
      setIsRecording(false);
    } else {
      startRecording({
        onResult: (transcript) => {
          setInputValue(transcript);
        },
        onFinalResult: (transcript) => {
          setInputValue(transcript);
        },
        onStart: () => {
          setIsRecording(true);
        },
        onEnd: () => {
          setIsRecording(false);
        },
        onError: (error) => {
          console.error('STT Error:', error);
          setIsRecording(false);
          // Show error as a temporary message in chat
          setMessages((prev) => [
            ...prev,
            {
              id: `error-${Date.now()}`,
              role: 'assistant',
              content: `⚠️ ${error}`,
              timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        },
      });
    }
  };

  const hasMessages = messages.length > 0;
  const headerTitle = currentConversation?.title || 'AI 智能问数对话';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A] truncate max-w-md">{headerTitle}</h1>
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
              <MessageBubble
                key={msg.id}
                message={msg}
                ttsSupported={ttsSupported}
                isSpeaking={speakingId === msg.id}
                isPaused={speakingId === msg.id && isPausedState}
                onSpeak={() => handleSpeak(msg.id, msg.content)}
                onStopSpeaking={handleStopSpeaking}
              />
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
              placeholder={isRecording ? '正在聆听...' : '请写下您的想法...'}
              className={cn(
                'flex-1 bg-transparent outline-none text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
                isRecording && 'placeholder:text-red-400'
              )}
              disabled={isLoading}
            />

            {/* Microphone - STT */}
            {sttSupported ? (
              <button
                onClick={handleToggleRecording}
                className={cn(
                  'p-1.5 rounded-md transition-all shrink-0 relative',
                  isRecording
                    ? 'bg-red-50 text-red-500 animate-pulse'
                    : 'hover:bg-[#E2E8F0] text-[#94A3B8] hover:text-[#64748B]'
                )}
                title={isRecording ? '停止录音' : '语音输入'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
                {isRecording && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                )}
              </button>
            ) : (
              <button
                className="p-1.5 rounded-md text-[#CBD5E1] cursor-not-allowed shrink-0"
                title="浏览器不支持语音输入"
                disabled
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </button>
            )}

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
interface MessageBubbleProps {
  message: Message;
  ttsSupported: boolean;
  isSpeaking: boolean;
  isPaused: boolean;
  onSpeak: () => void;
  onStopSpeaking: () => void;
}

function MessageBubble({ message, ttsSupported, isSpeaking, isPaused, onSpeak, onStopSpeaking }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const [analysisExpanded, setAnalysisExpanded] = useState(false);

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
      <div className={cn('max-w-[75%]', isUser && 'flex flex-col items-end')}>
        {/* Analysis Process - Only for AI messages with data */}
        {!isUser && message.data && (
          <div className="mb-2">
            <button
              onClick={() => setAnalysisExpanded(!analysisExpanded)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#EFF6FF] border border-[#BFDBFE] hover:bg-[#DBEAFE] transition-colors group"
            >
              {/* Chip/Analysis icon */}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
              <span className="text-xs font-medium text-[#2563EB]">分析过程</span>
              {/* Arrow */}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#2563EB"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn('transition-transform duration-200', analysisExpanded && 'rotate-90')}
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
              <span className="text-xs text-[#64748B]">{analysisExpanded ? '点击收起' : '点击展开'}</span>
            </button>

            {/* Expanded Analysis Content */}
            {analysisExpanded && (
              <div className="mt-2 bg-[#EFF6FF]/50 border border-[#BFDBFE] rounded-xl p-4 space-y-4">
                {/* ① Data Discovery */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">1</span>
                    <span className="text-xs font-semibold text-[#0F172A]">数据发现</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 text-xs text-[#334155] space-y-1">
                    <p><span className="text-[#64748B]">数据源：</span>经营数据台账</p>
                    <p><span className="text-[#64748B]">查询范围：</span>2025年 Q1（1-3月）</p>
                    <p><span className="text-[#64748B]">数据维度：</span>{message.data.table?.headers.join('、') || '综合维度'}</p>
                    <p><span className="text-[#64748B]">数据条数：</span>{message.data.table?.rows.length || 0} 条记录</p>
                  </div>
                </div>

                {/* ② Data Table */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">2</span>
                    <span className="text-xs font-semibold text-[#0F172A]">数据表格</span>
                  </div>
                  {message.data.table && (
                    <div className="bg-white rounded-lg p-3 overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="border-b border-[#E2E8F0]">
                            {message.data.table.headers.map((h, i) => (
                              <th key={i} className="text-left py-1.5 px-2 font-semibold text-[#64748B]">
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {message.data.table.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-[#E2E8F0]/60 last:border-0">
                              {row.map((cell, ci) => (
                                <td key={ci} className="py-1.5 px-2 text-[#334155]">
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* ③ Data Statistics */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center">3</span>
                    <span className="text-xs font-semibold text-[#0F172A]">数据统计</span>
                  </div>
                  <div className="bg-white rounded-lg p-3 space-y-1.5">
                    {message.data.insights?.map((insight, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#334155]">
                        <span className="w-1 h-1 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isUser
              ? 'bg-[#EDE9FE] text-[#1E1B4B] rounded-tr-sm'
              : 'bg-[#F8FAFC] text-[#0F172A] rounded-tl-sm'
          )}
        >
          {/* Summary text */}
          <p className={cn(isUser ? 'text-[#1E1B4B]' : 'text-[#334155]')}>{message.content}</p>

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

          {/* Data Visualization Chart */}
          {message.data?.chartData && (
            <DataVisualizationChart chartData={message.data.chartData} />
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

          {/* Meta Info */}
          {message.data?.meta && (
            <div className="mt-3 pt-2 border-t border-[#E2E8F0]/60 flex items-center gap-3 text-[10px] text-[#94A3B8]">
              <span>耗时 {message.data.meta.durationMs}ms</span>
              <span>·</span>
              <span>{message.data.meta.tokenCount} tokens</span>
            </div>
          )}
        </div>

        {/* Action buttons for AI messages */}
        {!isUser && !message.loading && (
          <div className="flex items-center gap-1 mt-1.5 ml-1">
            <ActionButton title="收藏" icon={<StarIcon />} />
            <ActionButton title="编辑" icon={<PencilIcon />} />
            <ActionButton title="刷新" icon={<RefreshIcon />} />
            <ActionButton title="复制" icon={<CopyIcon />} />
            {/* TTS Button */}
            {ttsSupported && (
              <ActionButton
                title={isSpeaking ? (isPaused ? '继续朗读' : '暂停朗读') : '朗读'}
                icon={isSpeaking && !isPaused ? <PauseIcon /> : <SpeakerIcon />}
                active={isSpeaking}
                onClick={onSpeak}
              />
            )}
            {/* Stop speaking button */}
            {isSpeaking && (
              <ActionButton
                title="停止朗读"
                icon={<StopIcon />}
                onClick={onStopSpeaking}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* Data Visualization Chart Component */
function DataVisualizationChart({ chartData }: { chartData: ChartData }) {
  const { title, categories, series } = chartData;
  
  // Chart dimensions
  const chartHeight = 200;
  const chartPadding = { top: 20, right: 20, bottom: 40, left: 50 };
  
  // Calculate max value for scaling
  const allValues = series.flatMap(s => s.values);
  const maxValue = Math.max(...allValues) * 1.15; // Add 15% headroom
  
  // Chart area dimensions
  const chartWidth = 500; // Will be scaled by CSS
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  
  // Bar calculations
  const categoryCount = categories.length;
  const seriesCount = series.length;
  const groupWidth = plotWidth / categoryCount;
  const barWidth = Math.min(groupWidth * 0.7 / seriesCount, 40);
  const groupPadding = (groupWidth - barWidth * seriesCount) / 2;
  
  // Color mapping
  const getColor = (color: 'primary' | 'secondary') => {
    return color === 'primary' ? '#2563EB' : '#10B981';
  };
  
  // Generate Y-axis ticks
  const tickCount = 5;
  const ticks = Array.from({ length: tickCount + 1 }, (_, i) => {
    const value = (maxValue / tickCount) * i;
    return Math.round(value);
  });
  
  return (
    <div className="mt-3 bg-white border border-[#E2E8F0] rounded-xl p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="12" width="4" height="9" rx="1" />
            <rect x="10" y="8" width="4" height="13" rx="1" />
            <rect x="17" y="4" width="4" height="17" rx="1" />
          </svg>
          <span className="text-xs font-medium text-[#64748B]">数据可视化</span>
        </div>
        <span className="text-xs text-[#334155] font-medium">{title}</span>
      </div>
      
      {/* Legend */}
      {series.length > 1 && (
        <div className="flex items-center gap-4 mb-2">
          {series.map((s, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <span 
                className="w-3 h-3 rounded-sm" 
                style={{ backgroundColor: getColor(s.color) }}
              />
              <span className="text-[10px] text-[#64748B]">{s.name}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* SVG Chart */}
      <div className="w-full overflow-x-auto">
        <svg 
          viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
          className="w-full h-auto min-w-[300px]"
          style={{ maxHeight: '240px' }}
        >
          {/* Y-axis grid lines and labels */}
          {ticks.map((tick, i) => {
            const y = chartPadding.top + plotHeight - (tick / maxValue) * plotHeight;
            return (
              <g key={i}>
                <line
                  x1={chartPadding.left}
                  y1={y}
                  x2={chartWidth - chartPadding.right}
                  y2={y}
                  stroke="#E2E8F0"
                  strokeWidth="1"
                  strokeDasharray={i === 0 ? '0' : '4,4'}
                />
                <text
                  x={chartPadding.left - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px]"
                  fill="#94A3B8"
                >
                  {tick >= 10000 ? `${(tick / 10000).toFixed(1)}万` : tick}
                </text>
              </g>
            );
          })}
          
          {/* Bars */}
          {categories.map((category, catIndex) => {
            const groupX = chartPadding.left + catIndex * groupWidth;
            return (
              <g key={catIndex}>
                {series.map((s, seriesIndex) => {
                  const value = s.values[catIndex] || 0;
                  const barHeight = (value / maxValue) * plotHeight;
                  const x = groupX + groupPadding + seriesIndex * barWidth;
                  const y = chartPadding.top + plotHeight - barHeight;
                  
                  return (
                    <g key={seriesIndex}>
                      <rect
                        x={x}
                        y={y}
                        width={barWidth - 2}
                        height={barHeight}
                        fill={getColor(s.color)}
                        rx="3"
                        opacity="0.9"
                      />
                      {/* Value label on top of bar */}
                      {barHeight > 20 && (
                        <text
                          x={x + (barWidth - 2) / 2}
                          y={y - 4}
                          textAnchor="middle"
                          className="text-[8px] font-medium"
                          fill="#334155"
                        >
                          {value >= 10000 ? `${(value / 10000).toFixed(1)}万` : value}
                        </text>
                      )}
                    </g>
                  );
                })}
                {/* X-axis label */}
                <text
                  x={groupX + groupWidth / 2}
                  y={chartHeight - 10}
                  textAnchor="middle"
                  className="text-[10px]"
                  fill="#64748B"
                >
                  {category.length > 6 ? category.slice(0, 6) + '...' : category}
                </text>
              </g>
            );
          })}
          
          {/* X-axis line */}
          <line
            x1={chartPadding.left}
            y1={chartPadding.top + plotHeight}
            x2={chartWidth - chartPadding.right}
            y2={chartPadding.top + plotHeight}
            stroke="#CBD5E1"
            strokeWidth="1"
          />
        </svg>
      </div>
    </div>
  );
}

/* Action Button Component */
interface ActionButtonProps {
  title: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
}

function ActionButton({ title, icon, active, onClick }: ActionButtonProps) {
  return (
    <button
      className={cn(
        'p-1 rounded transition-colors',
        active
          ? 'text-[#2563EB] bg-[#EFF6FF]'
          : 'text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#E2E8F0]'
      )}
      title={title}
      onClick={onClick}
    >
      {icon}
    </button>
  );
}

/* Icon Components */
function StarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}
