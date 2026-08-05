'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/sidebar';
import { ChatInterface } from '@/components/chat-interface';
import { AppConfigPage } from '@/components/app-config-page';
import { ReplyProofPage } from '@/components/reply-proof-page';

export function HomePage() {
  const [activeMenu, setActiveMenu] = useState('smart-query');

  const renderContent = () => {
    switch (activeMenu) {
      case 'app-config':
        return <AppConfigPage />;
      case 'reply-proof':
        return <ReplyProofPage />;
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar activeMenu={activeMenu} onMenuChange={setActiveMenu} />
      <main className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </main>
    </div>
  );
}
