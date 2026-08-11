/**
 * 文件名: message-bubble.tsx
 * 功能描述: 消息气泡组件，负责渲染用户消息和AI回复两种形态。
 *           AI回复包含：分析过程折叠、数据表格、可视化图表、操作栏（复制/反馈/朗读/元信息）。
 * 主要导出: MessageBubble
 */

'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { speak, stopSpeaking, isSpeaking, isPaused, resumeSpeaking, pauseSpeaking } from '@/lib/utils/speech';
import { DataVisualizationChart } from './data-chart';
import type { Message } from '@/types';

/* ========================================
 * 图标组件（内部使用）
 * ======================================== */

const CopyIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 6 9 17l-5-5" />
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
  </svg>
);

const SpeakerIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
  </svg>
);

const PauseIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="14" y="4" width="4" height="16" rx="1" /><rect x="6" y="4" width="4" height="16" rx="1" />
  </svg>
);

const StopIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="16" height="16" rx="2" />
  </svg>
);

/* ========================================
 * 消息操作栏子组件
 * ======================================== */

/**
 * 消息操作栏 - 提供复制、反馈、朗读、元信息展示
 *
 * @param props.content - AI回复的文本内容（用于复制和朗读）
 * @param props.meta - 查询元信息（耗时、Token数、时间戳）
 */
function MessageActionBar({ content, meta }: { content: string; meta?: { durationMs: number; tokenCount: number; timestamp: number } }) {
  const [copied, setCopied] = useState(false);
  const [feedbackState, setFeedbackState] = useState<'none' | 'positive' | 'negative'>('none');
  const [isReading, setIsReading] = useState(false);
  const [isPausedState, setIsPausedState] = useState(false);

  // 复制文本到剪贴板
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // 剪贴板不可用时的降级方案
      const textarea = document.createElement('textarea');
      textarea.value = content;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 反馈按钮点击
  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedbackState(type);
  };

  // 朗读控制（播放/暂停/恢复/停止）
  const handleRead = () => {
    if (isReading && !isPausedState) {
      pauseSpeaking();
      setIsPausedState(true);
    } else if (isPausedState) {
      resumeSpeaking();
      setIsPausedState(false);
    } else {
      speak(content, {
        rate: 1,
        onStart: () => { setIsReading(true); setIsPausedState(false); },
        onEnd: () => { setIsReading(false); setIsPausedState(false); },
        onError: () => { setIsReading(false); setIsPausedState(false); },
      });
    }
  };

  const handleStopReading = () => {
    stopSpeaking();
    setIsReading(false);
    setIsPausedState(false);
  };

  // 格式化时间戳
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-1 mt-3 pt-2 border-t border-[#E2E8F0]/60">
      {/* 复制按钮 */}
      <button onClick={handleCopy}
        className={cn('flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors',
          copied ? 'text-green-600 bg-green-50' : 'text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF]')}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        {copied ? '已复制' : '复制'}
      </button>

      <span className="w-px h-3.5 bg-[#E2E8F0]" />

      {/* 反馈按钮（有帮助/无帮助） */}
      <button onClick={() => handleFeedback('positive')}
        className={cn('p-1 rounded-md transition-colors',
          feedbackState === 'positive' ? 'text-green-600 bg-green-50' : 'text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF]')}>
        <ThumbsUpIcon />
      </button>

      <span className="w-px h-3.5 bg-[#E2E8F0]" />

      {/* 朗读控制按钮 */}
      {isReading ? (
        <>
          <button onClick={isPausedState ? handleRead : handleStopReading}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors">
            {isPausedState ? <SpeakerIcon /> : <StopIcon />}
            {isPausedState ? '继续' : '停止'}
          </button>
          {!isPausedState && (
            <button onClick={handleRead}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors">
              <PauseIcon />
            </button>
          )}
        </>
      ) : (
        <button onClick={handleRead}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors">
          <SpeakerIcon /> 朗读
        </button>
      )}

      {/* 右侧：元信息（耗时、Token、时间） */}
      {meta && (
        <div className="ml-auto flex items-center gap-3 text-[11px] text-[#94A3B8]">
          <span>耗时 {(meta.durationMs / 1000).toFixed(1)}s</span>
          <span>{meta.tokenCount} tokens</span>
          <span>{formatTime(meta.timestamp)}</span>
        </div>
      )}
    </div>
  );
}

/* ========================================
 * 消息气泡主组件
 * ======================================== */

/**
 * 消息气泡组件
 * 根据消息角色（user/assistant）渲染不同样式的消息
 *
 * @param props.message - 消息数据
 * @param props.isLast - 是否为最后一条消息（影响打字机效果）
 */
export function MessageBubble({ message, isLast = false }: { message: Message; isLast?: boolean }) {
  const [analysisExpanded, setAnalysisExpanded] = useState(false);
  const isUser = message.role === 'user';

  /* --- 用户消息：蓝色气泡靠右 --- */
  if (isUser) {
    return (
      <div className="flex items-start gap-3 justify-end">
        <div className="max-w-[70%]">
          <div className="bg-[#2563EB] text-white rounded-2xl rounded-tr-sm px-4 py-3 text-sm leading-relaxed">
            {message.content}
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-xs font-medium shrink-0">
          我
        </div>
      </div>
    );
  }

  /* --- AI 回复消息 --- */
  return (
    <div className="flex items-start gap-3">
      {/* AI 头像 */}
      <div className="w-8 h-8 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
        </svg>
      </div>

      <div className="flex-1 max-w-[85%]">
        {/* 加载动画 */}
        {message.loading ? (
          <div className="flex items-center gap-2 text-sm text-[#94A3B8] py-2">
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" />
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0.2s' }} />
            <span className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0.4s' }} />
            <span className="ml-1">正在分析数据...</span>
          </div>
        ) : (
          <>
            {/* 分析过程（可折叠） */}
            {message.data && (
              <div className="mb-3">
                <button onClick={() => setAnalysisExpanded(!analysisExpanded)}
                  className="flex items-center gap-2 text-xs text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className={cn('transition-transform duration-200', analysisExpanded ? 'rotate-90' : '')}>
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                  <span className="font-medium">分析过程</span>
                  <span className="text-[#94A3B8]">
                    {analysisExpanded ? '点击收起' : '点击展开查看详情'}
                  </span>
                </button>

                <div className={cn('overflow-hidden transition-all duration-300',
                  analysisExpanded ? 'max-h-[500px] opacity-100 mt-2' : 'max-h-0 opacity-0')}>
                  <div className="bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-4 text-xs text-[#64748B] space-y-1.5">
                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" /> 解析用户问题关键词...</div>
                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" /> 查询经营数据库...</div>
                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" /> 匹配相关数据记录...</div>
                    <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" /> 生成分析结果</div>
                  </div>
                </div>
              </div>
            )}

            {/* AI 回复正文 */}
            <div className="bg-[#F8FAFC] rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-[#334155] leading-relaxed">
              {isLast && !message.data ? (
                <TypewriterEffect text={message.content} />
              ) : (
                message.content
              )}
            </div>

            {/* 数据表格 */}
            {message.data?.table && (
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm border border-[#E2E8F0] rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-[#EFF6FF]">
                      {message.data.table.headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 text-left text-[#2563EB] font-medium border-b border-[#E2E8F0]">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {message.data.table.rows.map((row, ri) => (
                      <tr key={ri} className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC]">
                        {row.map((cell, ci) => (
                          <td key={ci} className="px-3 py-2 text-[#334155]">{cell}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 数据可视化图表 */}
            {message.data?.chartData && (
              <div className="mt-4">
                <DataVisualizationChart data={message.data.chartData} />
              </div>
            )}

            {/* 分析洞察 */}
            {message.data?.insights && (
              <div className="mt-3 space-y-1.5">
                <span className="text-xs font-medium text-[#2563EB]">分析洞察</span>
                {message.data.insights.map((insight, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-[#64748B]">
                    <span className="w-1 h-1 rounded-full bg-[#2563EB] mt-1.5 shrink-0" />
                    {insight}
                  </div>
                ))}
              </div>
            )}

            {/* 操作栏（复制、反馈、朗读、元信息） */}
            <MessageActionBar content={message.content} meta={message.data?.meta} />
          </>
        )}
      </div>
    </div>
  );
}

/* ========================================
 * 打字机效果组件
 * ======================================== */

/**
 * 打字机效果组件
 * 逐字符显示文本，模拟AI流式输出效果
 *
 * @param props.text - 要显示的文本
 * @param props.speed - 每个字符的间隔时间（毫秒），默认30
 */
function TypewriterEffect({ text, speed = 30 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
      }
    }, speed);
    // 组件卸载时清除定时器
    return () => clearInterval(timer);
  }, [text, speed]);

  return <>{displayedText}</>;
}
