/**
 * 文件名: home-page.tsx
 * 功能描述: 主页面容器组件，管理全局路由状态和页面切换。
 *           整合侧边栏导航、历史对话面板、以及各功能页面。
 * 主要导出: HomePage
 */

'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { ChatInterface } from '@/components/chat/chat-interface';
import { AppConfigPage } from '@/components/config/app-config-page';
import { ReplyProofPage } from '@/components/feedback/reply-proof-page';
import { HistoryPanel } from '@/components/chat/history-panel';
import { historyConversations as initialConversations } from '@/lib/data/history-data';
import type { HistoryConversation } from '@/types';

/**
 * 主页面容器
 * 负责管理页面路由、历史对话状态、以及各子页面的切换渲染
 */
export function HomePage() {
  // 当前激活的菜单页面
  const [activeMenu, setActiveMenu] = useState('smart-query');
  // 历史面板是否展开
  const [showHistory, setShowHistory] = useState(true);
  // 对话列表（从静态数据转为可变状态）
  const [conversations, setConversations] = useState<HistoryConversation[]>(initialConversations);
  // 当前选中的历史对话
  const [selectedConversation, setSelectedConversation] = useState<HistoryConversation | null>(null);

  /** 菜单切换处理：切换页面时清除对话选中状态 */
  const handleMenuChange = (menu: string) => {
    setActiveMenu(menu);
    if (menu !== 'smart-query') {
      setSelectedConversation(null);
    }
  };

  /** 选中历史对话 */
  const handleSelectConversation = (conv: HistoryConversation) => {
    setSelectedConversation(conv);
  };

  /** 新建对话：创建空对话记录并添加到列表顶部 */
  const handleNewChat = () => {
    const newConversation: HistoryConversation = {
      id: `new-${Date.now()}`,
      title: '新对话',
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
  };

  /** 删除对话记录 */
  const handleDeleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedConversation?.id === id) {
      setSelectedConversation(null);
    }
  };

  /** 根据当前菜单渲染对应的内容页面 */
  const renderContent = () => {
    switch (activeMenu) {
      case 'app-config':
        return <AppConfigPage />;
      case 'reply-proof':
        return <ReplyProofPage />;
      default:
        return <ChatInterface currentConversation={selectedConversation} />;
    }
  };

  // 判断当前是否在智能问数页面
  const isSmartQueryPage = activeMenu === 'smart-query';

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* 左侧导航栏 */}
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />

      {/* 历史对话面板（仅智能问数页面显示） */}
      {isSmartQueryPage && showHistory && (
        <HistoryPanel
          conversations={conversations}
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onClose={() => setShowHistory(false)}
          onDelete={handleDeleteConversation}
        />
      )}

      {/* 历史面板收起时的展开按钮 */}
      {isSmartQueryPage && !showHistory && (
        <button onClick={() => setShowHistory(true)}
          className="w-10 bg-[#F8FAFC] border-r border-[#E2E8F0] flex items-center justify-center hover:bg-[#EFF6FF] transition-colors group"
          title="展开历史对话">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-[#2563EB] transition-colors">
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}

      {/* 主内容区域 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
