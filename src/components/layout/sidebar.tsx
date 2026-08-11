/**
 * 文件名: sidebar.tsx
 * 功能描述: 左侧导航栏组件，包含三个一级菜单（智能问数、系统管理、反馈管理），
 *           其中系统管理和反馈管理支持展开子菜单（应用配置、回复校对）。
 * 主要导出: Sidebar
 */

'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * 侧边栏组件属性
 */
interface SidebarProps {
  /** 当前激活的菜单标识 */
  activeMenu: string;
  /** 菜单切换回调 */
  onMenuChange: (menu: string) => void;
}

/** 展开/收起箭头图标 */
const ChevronDown = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

/**
 * 左侧导航栏组件
 * 固定宽度240px，包含Logo、导航菜单、版本号
 */
export function Sidebar({ activeMenu, onMenuChange }: SidebarProps) {
  // 子菜单展开状态
  const [systemExpanded, setSystemExpanded] = useState(activeMenu === 'app-config');
  const [feedbackExpanded, setFeedbackExpanded] = useState(activeMenu === 'reply-proof');

  /** 点击系统管理：切换展开状态，展开时默认进入应用配置 */
  const handleSystemClick = () => {
    const next = !systemExpanded;
    setSystemExpanded(next);
    if (next) onMenuChange('app-config');
  };

  /** 点击反馈管理：切换展开状态，展开时默认进入回复校对 */
  const handleFeedbackClick = () => {
    const next = !feedbackExpanded;
    setFeedbackExpanded(next);
    if (next) onMenuChange('reply-proof');
  };

  return (
    <aside className="w-60 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col shrink-0">
      {/* Logo 区域 */}
      <div className="h-16 flex items-center px-5 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold text-[#0F172A]">经管之星</span>
        </div>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-3">
        <div className="space-y-1">
          {/* 智能问数 */}
          <button onClick={() => onMenuChange('smart-query')}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
              activeMenu === 'smart-query'
                ? 'bg-[#2563EB] text-white shadow-sm'
                : 'text-[#64748B] hover:bg-[#E2E8F0]/60 hover:text-[#334155]'
            )}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
            </svg>
            智能问数
          </button>

          {/* 系统管理（可展开子菜单） */}
          <div>
            <button onClick={handleSystemClick}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                activeMenu === 'system' || activeMenu === 'app-config'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#64748B] hover:bg-[#E2E8F0]/60 hover:text-[#334155]'
              )}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="flex-1 text-left">系统管理</span>
              <span className={cn('transition-transform duration-200', systemExpanded ? 'rotate-180' : '')}>
                <ChevronDown />
              </span>
            </button>

            {/* 子菜单：应用配置 */}
            <div className={cn('overflow-hidden transition-all duration-200', systemExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0')}>
              <button onClick={() => onMenuChange('app-config')}
                className={cn(
                  'w-full flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                  activeMenu === 'app-config'
                    ? 'text-[#2563EB] bg-[#EFF6FF]'
                    : 'text-[#64748B] hover:bg-[#E2E8F0]/60 hover:text-[#334155]'
                )}>
                <span className={cn('w-1.5 h-1.5 rounded-full transition-colors', activeMenu === 'app-config' ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')} />
                应用配置
              </button>
            </div>
          </div>

          {/* 反馈管理（可展开子菜单） */}
          <div>
            <button onClick={handleFeedbackClick}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                activeMenu === 'feedback' || activeMenu === 'reply-proof'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-[#64748B] hover:bg-[#E2E8F0]/60 hover:text-[#334155]'
              )}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 10v12" /><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
              </svg>
              <span className="flex-1 text-left">反馈管理</span>
              <span className={cn('transition-transform duration-200', feedbackExpanded ? 'rotate-180' : '')}>
                <ChevronDown />
              </span>
            </button>

            {/* 子菜单：回复校对 */}
            <div className={cn('overflow-hidden transition-all duration-200', feedbackExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0')}>
              <button onClick={() => onMenuChange('reply-proof')}
                className={cn(
                  'w-full flex items-center gap-2.5 pl-10 pr-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150',
                  activeMenu === 'reply-proof'
                    ? 'text-[#2563EB] bg-[#EFF6FF]'
                    : 'text-[#64748B] hover:bg-[#E2E8F0]/60 hover:text-[#334155]'
                )}>
                <span className={cn('w-1.5 h-1.5 rounded-full transition-colors', activeMenu === 'reply-proof' ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]')} />
                回复校对
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 底部版本号 */}
      <div className="p-4 border-t border-[#E2E8F0]">
        <div className="text-xs text-[#94A3B8] text-center">v1.0.0</div>
      </div>
    </aside>
  );
}
