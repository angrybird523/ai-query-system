'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ChatInterface } from '@/components/chat-interface';
import { AppConfigPage } from '@/components/app-config-page';
import { ReplyProofPage } from '@/components/reply-proof-page';
import { HistoryPanel } from '@/components/history-panel';
import { historyConversations, type HistoryConversation } from '@/lib/history-data';

export function HomePage() {
  const [activeMenu, setActiveMenu] = useState('smart-query');
  const [showHistory, setShowHistory] = useState(true); // 默认展开
  const [selectedConversation, setSelectedConversation] = useState<HistoryConversation | null>(null);

  const handleMenuChange = (menu: string) => {
    // 只切换页面，不改变侧边栏状态
    setActiveMenu(menu);
    if (menu !== 'smart-query') {
      setSelectedConversation(null);
    }
  };

  const handleSelectConversation = (conv: HistoryConversation) => {
    setSelectedConversation(conv);
  };

  const handleNewChat = () => {
    setSelectedConversation(null);
  };

  const handleCloseHistory = () => {
    setShowHistory(false);
  };

  const handleOpenHistory = () => {
    setShowHistory(true);
  };

  const renderContent = () => {
    switch (activeMenu) {
      case 'app-config':
        return <AppConfigPage />;
      case 'reply-proof':
        return <ReplyProofPage />;
      default:
        return (
          <ChatInterface
            currentConversation={selectedConversation}
          />
        );
    }
  };

  // 侧边栏只在智能问数页面显示
  const isSmartQueryPage = activeMenu === 'smart-query';

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      
      {/* 历史对话面板 - 仅在智能问数页面显示 */}
      {isSmartQueryPage && showHistory && (
        <HistoryPanel
          conversations={historyConversations}
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onClose={handleCloseHistory}
        />
      )}
      
      {/* 展开按钮 - 当侧边栏收起时在智能问数页面显示 */}
      {isSmartQueryPage && !showHistory && (
        <button
          onClick={handleOpenHistory}
          className="w-10 bg-[#F8FAFC] border-r border-[#E2E8F0] flex items-center justify-center hover:bg-[#EFF6FF] transition-colors group"
          title="展开历史对话"
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#64748B" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="group-hover:stroke-[#2563EB] transition-colors"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      )}
      
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
