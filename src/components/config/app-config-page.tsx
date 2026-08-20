/**
 * 文件名: app-config-page.tsx
 * 功能描述: 应用配置页面，展示6个功能开关卡片（开场白、问题建议、TTS、STT、模型配置、常问设置），
 *           采用两行三列网格布局，支持开关切换和设置入口。
 *           状态由父组件 HomePage 管理，切换页面不会丢失。
 * 主要导出: AppConfigPage
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ConfigItem } from '@/types';

/** 齿轮设置图标 */
const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

/**
 * 静态配置元数据（图标、标题、描述，不含开关状态）
 */
const configMeta: { id: string; title: string; description: string; hasSettings: boolean; iconColor: string; iconBg: string; icon: React.ReactNode }[] = [
  { id: 'greeting', title: '对话开场白', description: '开启后，新对话将自动显示开场白引导语（如"欢迎使用智能AI问数..."）', hasSettings: true, iconColor: 'text-[#2563EB]', iconBg: 'bg-[#EFF6FF]', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" /></svg>) },
  { id: 'suggestions', title: '下一步问题建议', description: '开启后，AI回复下方自动生成3条相关延伸问题提示条', hasSettings: false, iconColor: 'text-[#F59E0B]', iconBg: 'bg-[#FFFBEB]', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6" /><path d="M10 22h4" /><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>) },
  { id: 'tts', title: '文字转语音', description: '开启后，AI回答支持语音播报功能', hasSettings: false, iconColor: 'text-[#10B981]', iconBg: 'bg-[#ECFDF5]', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M15.54 8.46a5 5 0 0 1 0 7.07" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14" /></svg>) },
  { id: 'stt', title: '语音转文字', description: '开启后，支持通过语音输入问题', hasSettings: false, iconColor: 'text-[#8B5CF6]', iconBg: 'bg-[#F5F3FF]', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" x2="12" y1="19" y2="22" /></svg>) },
  { id: 'model', title: '模型配置', description: '配置各业务场景使用的AI模型', hasSettings: true, iconColor: 'text-[#2563EB]', iconBg: 'bg-[#EFF6FF]', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>) },
  { id: 'faq', title: '常问设置', description: '根据经常提问频次，在快捷提问中能看到常问问题', hasSettings: true, iconColor: 'text-[#F59E0B]', iconBg: 'bg-[#FFFBEB]', icon: (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><rect x="7" y="10" width="3" height="8" rx="0.5" /><rect x="12" y="6" width="3" height="12" rx="0.5" /><rect x="17" y="13" width="3" height="5" rx="0.5" /></svg>) },
];

/** 默认启用状态 */
const defaultEnabled: Record<string, boolean> = {
  greeting: true, suggestions: true, tts: false, stt: false, model: true, faq: true,
};

/**
 * 应用配置页面
 * 展示6个功能开关卡片，支持启用/禁用切换
 * 状态由父组件传入，切换页面后不会丢失
 */
export function AppConfigPage({
  configStates,
  onToggleConfig,
  greetingText,
  onUpdateGreeting,
  openingQuestions,
  onUpdateOpeningQuestions,
  faqThreshold,
  onUpdateFaqThreshold,
  onNavigateToModelConfig,
}: {
  configStates: Record<string, boolean>;
  onToggleConfig: (id: string) => void;
  greetingText: string;
  onUpdateGreeting: (text: string) => void;
  openingQuestions: string[];
  onUpdateOpeningQuestions: (questions: string[]) => void;
  faqThreshold: number;
  onUpdateFaqThreshold: (value: number) => void;
  onNavigateToModelConfig?: () => void;
}) {
  const [greetingModalOpen, setGreetingModalOpen] = useState(false);
  const [faqModalOpen, setFaqModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题栏 */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">系统管理</h1>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium cursor-pointer">管</div>
        </div>
      </header>

      {/* 内容区域 - 灰色背景 */}
      <div className="flex-1 overflow-y-auto bg-[#F0F2F5]">
        <div className="px-8 py-6">
          {/* 面包屑导航 */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <span className="text-[#64748B]">系统管理</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <span className="text-[#0F172A] font-medium">应用配置</span>
          </nav>

          {/* 白色大卡片容器 */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-8">
            {/* 配置卡片网格（3列） */}
            <div className="grid grid-cols-3 gap-5">
              {configMeta.map((meta) => {
                const config: ConfigItem = { ...meta, enabled: configStates[meta.id] ?? defaultEnabled[meta.id] };
                return (
                  <ConfigCard
                    key={config.id}
                    config={config}
                    onToggle={() => onToggleConfig(config.id)}
                    onOpenSettings={config.id === 'greeting' ? () => setGreetingModalOpen(true) : config.id === 'model' ? onNavigateToModelConfig : config.id === 'faq' ? () => setFaqModalOpen(true) : undefined}
                  />
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 开场白设置弹窗 */}
      {greetingModalOpen && (
        <GreetingModal
          greetingText={greetingText}
          openingQuestions={openingQuestions}
          onClose={() => setGreetingModalOpen(false)}
          onSave={(text, questions) => {
            onUpdateGreeting(text);
            onUpdateOpeningQuestions(questions);
            setGreetingModalOpen(false);
          }}
        />
      )}

      {/* 常问设置弹窗 */}
      {faqModalOpen && (
        <FaqModal
          threshold={faqThreshold}
          onClose={() => setFaqModalOpen(false)}
          onSave={(value) => {
            onUpdateFaqThreshold(value);
            setFaqModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

/**
 * 单个配置卡片组件
 * 展示配置项的图标、标题、描述和开关
 */
function ConfigCard({ config, onToggle, onOpenSettings }: { config: ConfigItem; onToggle: () => void; onOpenSettings?: () => void }) {
  return (
    <div className={cn('border border-[#E2E8F0] rounded-xl bg-white transition-all duration-200',
      config.enabled ? 'border-[#2563EB]/20' : '')}>
      <div className="p-6">
        {/* 顶部行：图标 + 标题 ............ 齿轮 + 开关 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* 彩色图标容器 */}
            <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0',
              config.enabled ? config.iconBg || 'bg-[#EFF6FF]' : 'bg-[#F1F5F9]',
              config.enabled ? config.iconColor || 'text-[#2563EB]' : 'text-[#94A3B8]')}>
              {config.icon}
            </div>
            <h3 className="text-[17px] font-semibold text-[#0F172A]">{config.title}</h3>
          </div>
          <div className="flex items-center gap-2">
            {config.hasSettings && (
              <button className="p-2 rounded-md text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors" title="设置" onClick={onOpenSettings}>
                <GearIcon />
              </button>
            )}
            <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
          </div>
        </div>
        {/* 描述 */}
        <p className="text-[13px] text-[#64748B] leading-relaxed">{config.description}</p>
      </div>
    </div>
  );
}

/**
 * 开关切换组件（Toggle Switch）
 */
function ToggleSwitch({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle}
      className={cn('relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0',
        enabled ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')}>
      <span className={cn('absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
        enabled ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
}

/**
 * 开场白设置弹窗
 * 包含开场白文案编辑、开场问题列表管理（最多10个）
 */
function GreetingModal({
  greetingText,
  openingQuestions,
  onClose,
  onSave,
}: {
  greetingText: string;
  openingQuestions: string[];
  onClose: () => void;
  onSave: (text: string, questions: string[]) => void;
}) {
  const [draftText, setDraftText] = useState(greetingText);
  const [draftQuestions, setDraftQuestions] = useState<string[]>([...openingQuestions]);

  const handleAddQuestion = () => {
    if (draftQuestions.length >= 10) return;
    setDraftQuestions((prev) => [...prev, '']);
  };

  const handleQuestionChange = (index: number, value: string) => {
    setDraftQuestions((prev) => prev.map((q, i) => (i === index ? value : q)));
  };

  const handleRemoveQuestion = (index: number) => {
    setDraftQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    // 过滤掉空问题
    const filtered = draftQuestions.filter((q) => q.trim());
    onSave(draftText, filtered);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/40" />
      {/* 弹窗内容 */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
            </svg>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">对话开场白</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗主体 */}
        <div className="px-6 pb-4 max-h-[60vh] overflow-y-auto">
          {/* 开场白文案 */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#0F172A] mb-2">开场白文案</label>
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full h-[80px] px-3 py-2 text-[14px] text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              placeholder="输入开场白文案..."
            />
          </div>

          {/* 开场问题 */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-[14px] font-medium text-[#0F172A]">
                开场问题 · {draftQuestions.length}/10
              </label>
              <button
                onClick={handleAddQuestion}
                disabled={draftQuestions.length >= 10}
                className={cn(
                  'text-[13px] font-medium transition-colors',
                  draftQuestions.length >= 10
                    ? 'text-[#CBD5E1] cursor-not-allowed'
                    : 'text-[#2563EB] hover:text-[#1D4ED8] cursor-pointer'
                )}
              >
                <span className="flex items-center gap-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 5v14" /><path d="M5 12h14" />
                  </svg>
                  添加开场问题
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {draftQuestions.map((q, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={q}
                    onChange={(e) => handleQuestionChange(i, e.target.value)}
                    className="flex-1 px-3 py-2 text-[14px] text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
                    placeholder="输入开场问题..."
                  />
                  <button
                    onClick={() => handleRemoveQuestion(i)}
                    className="p-1 rounded text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors"
                    title="删除"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 弹窗底部按钮 */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="flex items-center gap-1 text-[14px] font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2563EB] text-white text-[14px] font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 常问设置弹窗
 * 设置问题频次阈值，超过此值的提问视为常问问题
 */
function FaqModal({
  threshold,
  onClose,
  onSave,
}: {
  threshold: number;
  onClose: () => void;
  onSave: (value: number) => void;
}) {
  const [draftValue, setDraftValue] = useState(threshold);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val >= 1) {
      setDraftValue(val);
    }
  };

  const handleSave = () => {
    onSave(Math.max(1, draftValue));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      {/* 半透明遮罩 */}
      <div className="absolute inset-0 bg-black/40" />
      {/* 弹窗内容 */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 弹窗头部 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
            </svg>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">常问设置</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        {/* 弹窗主体 */}
        <div className="px-6 pb-6">
          {/* 问题频次阈值 */}
          <div>
            <label className="block text-[14px] font-medium text-[#0F172A] mb-3">问题频次阈值</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                value={draftValue}
                onChange={handleChange}
                className="w-[100px] px-3 py-2 text-[14px] text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              />
              <span className="text-[14px] text-[#94A3B8]">次（同一问题出现次数超过此值即视为常问）</span>
            </div>
          </div>
        </div>

        {/* 弹窗底部按钮 */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[14px] font-medium text-[#EF4444] hover:text-[#DC2626] transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#2563EB] text-white text-[14px] font-medium rounded-lg hover:bg-[#1D4ED8] transition-colors shadow-sm"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
