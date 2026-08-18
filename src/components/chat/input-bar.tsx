/**
 * 文件名: input-bar.tsx
 * 功能描述: 底部输入框组件，包含文本输入、语音输入(STT)、发送按钮。
 *           支持回车发送、语音识别实时显示、录音动画等功能。
 * 主要导出: InputBar
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { startRecording, stopRecording, isSpeechRecognitionSupported } from '@/lib/utils/speech';

/**
 * 输入框组件属性
 */
interface InputBarProps {
  /** 发送消息回调 */
  onSend: (message: string) => void;
  /** 是否正在等待AI回复（禁用输入） */
  isLoading: boolean;
}

/**
 * 底部输入框组件
 * 提供文本输入、语音输入、发送功能
 */
export function InputBar({ onSend, isLoading }: InputBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 发送消息处理
  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInputValue('');
  };

  // 开始语音识别
  const handleStartRecording = () => {
    startRecording({
      onResult: (transcript) => setInputValue(transcript),
      onStart: () => setIsRecording(true),
      onEnd: () => setIsRecording(false),
      onError: (error) => {
        setIsRecording(false);
        // 将错误信息作为输入框的占位文本提示
        setInputValue('');
        console.warn('语音识别错误:', error);
      },
    });
  };

  // 停止语音识别
  const handleStopRecording = () => {
    stopRecording();
    setIsRecording(false);
  };

  // 键盘事件：Enter 发送，Shift+Enter 换行
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // 自动聚焦
  useEffect(() => {
    if (!isLoading) textareaRef.current?.focus();
  }, [isLoading]);

  // 自动调整文本框高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const canSend = inputValue.trim().length > 0 && !isLoading;

  return (
    <div className="shrink-0 border-t border-[#E2E8F0] bg-white px-6 py-4">
      <div className="max-w-[800px] mx-auto">
        <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 focus-within:border-[#2563EB]/30 focus-within:bg-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
          {/* 语音输入按钮 */}
          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={isLoading || !isSpeechRecognitionSupported()}
            className={cn(
              'shrink-0 p-2 rounded-lg transition-all duration-200',
              isRecording
                ? 'bg-red-100 text-red-500 animate-pulse'
                : 'text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF]'
            )}
            title={isRecording ? '点击停止录音' : '点击语音输入'}
          >
            {isRecording ? (
              /* 录音中：红色脉冲动画 */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="6" y="4" width="12" height="16" rx="6" />
                <path d="M12 20v2" /><path d="M8 22h8" />
              </svg>
            ) : (
              /* 麦克风图标 */
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" x2="12" y1="19" y2="22" />
              </svg>
            )}
          </button>

          {/* 文本输入框 */}
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isLoading ? 'AI 正在分析中...' : '请输入您的问题，例如：北京的产品线收入情况'}
            disabled={isLoading}
            rows={1}
            className="flex-1 bg-transparent resize-none text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none leading-relaxed max-h-[120px]"
          />

          {/* 发送按钮 */}
          <button
            onClick={handleSend}
            disabled={!canSend}
            className={cn(
              'shrink-0 p-2 rounded-lg transition-all duration-200',
              canSend
                ? 'bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm'
                : 'text-[#CBD5E1] cursor-not-allowed'
            )}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13" /><path d="M22 2 15 22 11 13 2 9z" />
            </svg>
          </button>
        </div>

        {/* 底部提示文字 */}
        <p className="text-center text-xs text-[#94A3B8] mt-2.5">
          AI 生成内容仅供参考，不构成任何建议
        </p>
      </div>
    </div>
  );
}
