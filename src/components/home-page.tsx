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
  const [showHistory, setShowHistory] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<HistoryConversation | null>(null);

  const handleMenuChange = (menu: string) => {
    if (menu === 'smart-query') {
      // Toggle history panel when clicking smart-query
      if (activeMenu === 'smart-query') {
        setShowHistory((prev) => !prev);
      } else {
        setShowHistory(true);
      }
    } else {
      setShowHistory(false);
      setSelectedConversation(null);
    }
    setActiveMenu(menu);
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

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar activeMenu={activeMenu} onMenuChange={handleMenuChange} />
      {showHistory && activeMenu === 'smart-query' && (
        <HistoryPanel
          conversations={historyConversations}
          selectedId={selectedConversation?.id || null}
          onSelect={handleSelectConversation}
          onNewChat={handleNewChat}
          onClose={handleCloseHistory}
        />
      )}
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
