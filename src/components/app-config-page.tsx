'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface ConfigItem {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  hasSettings: boolean;
  icon: React.ReactNode;
}

const GearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const initialConfigs: ConfigItem[] = [
  {
    id: 'greeting',
    title: '对话开场白',
    description: '开启后，新对话将自动显示开场白引导语（如"欢迎使用智能AI问数..."）',
    enabled: true,
    hasSettings: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
      </svg>
    ),
  },
  {
    id: 'suggestions',
    title: '下一步问题建议',
    description: '开启后，AI回复下方自动生成3条相关延伸问题提示条',
    enabled: true,
    hasSettings: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" /><path d="M12 8h.01" />
      </svg>
    ),
  },
  {
    id: 'tts',
    title: '文字转语音',
    description: '开启后，AI回答支持语音播报功能',
    enabled: false,
    hasSettings: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
      </svg>
    ),
  },
  {
    id: 'stt',
    title: '语音转文字',
    description: '开启后，支持通过语音输入问题',
    enabled: false,
    hasSettings: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" x2="12" y1="19" y2="22" />
      </svg>
    ),
  },
  {
    id: 'model',
    title: '模型配置',
    description: '配置各业务场景使用的AI模型',
    enabled: true,
    hasSettings: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
  {
    id: 'faq',
    title: '常问设置',
    description: '根据经常提问频次，在快捷提问中能看到常问问题',
    enabled: true,
    hasSettings: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v18h18" />
        <path d="M7 16l4-8 4 4 4-6" />
      </svg>
    ),
  },
];

export function AppConfigPage() {
  const [configs, setConfigs] = useState<ConfigItem[]>(initialConfigs);

  const toggleConfig = (id: string) => {
    setConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c))
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">系统管理</h1>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-lg hover:bg-[#F1F5F9] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#2563EB] flex items-center justify-center text-white text-sm font-medium cursor-pointer">
            管
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <span className="text-[#64748B]">系统管理</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-[#0F172A] font-medium">应用配置</span>
          </nav>

          {/* Page Title */}
          <div className="mb-6">
            <h2 className="text-[20px] font-bold text-[#0F172A]">应用配置</h2>
            <p className="text-[14px] text-[#64748B] mt-1">管理系统功能开关与参数设置</p>
          </div>

          {/* Config Cards Grid */}
          <div className="grid grid-cols-3 gap-4">
            {configs.map((config) => (
              <ConfigCard
                key={config.id}
                config={config}
                onToggle={() => toggleConfig(config.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfigCard({
  config,
  onToggle,
}: {
  config: ConfigItem;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'border rounded-xl p-5 transition-all duration-200',
        config.enabled
          ? 'border-[#2563EB]/20 bg-white'
          : 'border-[#E2E8F0] bg-[#FAFBFC]'
      )}
    >
      {/* Top: Icon + Settings */}
      <div className="flex items-start justify-between mb-3">
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center',
            config.enabled
              ? 'bg-[#EFF6FF] text-[#2563EB]'
              : 'bg-[#F1F5F9] text-[#94A3B8]'
          )}
        >
          {config.icon}
        </div>
        {config.hasSettings && (
          <button
            className="p-1.5 rounded-md text-[#94A3B8] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors"
            title="设置"
          >
            <GearIcon />
          </button>
        )}
      </div>

      {/* Title + Toggle */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[14px] font-semibold text-[#0F172A]">{config.title}</h3>
        <ToggleSwitch enabled={config.enabled} onToggle={onToggle} />
      </div>

      {/* Description */}
      <p className="text-[12px] text-[#64748B] leading-relaxed">{config.description}</p>
    </div>
  );
}

function ToggleSwitch({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0',
        enabled ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200',
          enabled ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}
