/**
 * 文件名: model-config-page.tsx
 * 功能描述: 模型配置页面，展示AI模型选择界面。
 *           支持为"智能问数"等场景选择不同的LLM模型，保存配置后状态持久化。
 * 主要导出: ModelConfigPage
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

/** 可选的AI模型列表 */
const MODEL_OPTIONS = [
  { id: 'qwen-turbo', name: 'Qwen-Turbo（通义千问）' },
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o-mini' },
  { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'deepseek-v3', name: 'DeepSeek-V3' },
  { id: 'qwen-2.5-72b', name: 'Qwen2.5-72B' },
  { id: 'glm-4-plus', name: 'GLM-4-Plus' },
  { id: 'moonshot-v1', name: 'Moonshot-v1' },
];

/**
 * 模型配置页面
 * 展示AI模型选择界面，支持为不同场景选择LLM模型
 */
export function ModelConfigPage({
  selectedModel,
  onSelectModel,
}: {
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
}) {
  const [draftModel, setDraftModel] = useState(selectedModel);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

  const toggleDropdown = useCallback(() => {
    if (!dropdownOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    }
    setDropdownOpen((v) => !v);
  }, [dropdownOpen]);

  const currentModel = MODEL_OPTIONS.find((m) => m.id === draftModel) || MODEL_OPTIONS[0];

  const handleSelect = (modelId: string) => {
    setDraftModel(modelId);
    setDropdownOpen(false);
  };

  const handleSave = () => {
    onSelectModel(draftModel);
    setShowSaved(true);
    setTimeout(() => setShowSaved(false), 2000);
  };

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

      {/* 内容区域 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {/* 面包屑导航 */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <span className="text-[#64748B]">系统管理</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <span className="text-[#0F172A] font-medium">模型配置</span>
          </nav>

          {/* 页面标题 */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-[20px] font-bold text-[#0F172A]">应用模型设置</h2>
          </div>
          <p className="text-[14px] text-[#64748B] mb-6">选择AI问答使用的LLM模型</p>

          {/* 模型选择卡片 */}
          <div className="border border-[#E2E8F0] rounded-xl bg-white">
            <div className="flex items-center justify-between px-6 py-5">
              {/* 左侧：图标 + 名称 + 描述 */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-[#F1F5F9] flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2" />
                    <circle cx="12" cy="5" r="2" />
                    <path d="M12 7v4" />
                    <line x1="8" y1="16" x2="8" y2="16" />
                    <line x1="16" y1="16" x2="16" y2="16" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-[#0F172A] mb-1">智能问数模型</h3>
                  <p className="text-[13px] text-[#64748B]">用于智能问数、经营指标问答、台账数据分析</p>
                </div>
              </div>

              {/* 右侧：模型下拉选择器 */}
              <div className="relative">
                <button
                  ref={buttonRef}
                  onClick={toggleDropdown}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border text-[14px] font-medium transition-all min-w-[220px]',
                    dropdownOpen
                      ? 'border-[#2563EB] bg-white text-[#2563EB] ring-2 ring-[#2563EB]/20'
                      : 'border-[#E2E8F0] bg-white text-[#0F172A] hover:border-[#CBD5E1]'
                  )}
                >
                  <span className="flex-1 text-left">{currentModel.name}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={cn('transition-transform', dropdownOpen ? 'rotate-180' : '')}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {/* 下拉菜单 - 使用 fixed 定位避免被父容器裁剪 */}
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <div 
                      className="fixed bg-white border border-[#E2E8F0] rounded-lg shadow-lg z-50 py-1 max-h-[300px] overflow-y-auto"
                      style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width }}
                    >
                      {MODEL_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleSelect(option.id)}
                          className={cn(
                            'w-full text-left px-4 py-2.5 text-[14px] transition-colors',
                            draftModel === option.id
                              ? 'text-[#2563EB] bg-[#EFF6FF] font-medium'
                              : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                          )}
                        >
                          {option.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 保存配置按钮 */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              className={cn(
                'flex items-center gap-2 px-6 py-2.5 rounded-lg text-[14px] font-medium text-white transition-all',
                showSaved
                  ? 'bg-[#16A34A]'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8] shadow-sm'
              )}
            >
              {showSaved ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  已保存
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  保存配置
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
