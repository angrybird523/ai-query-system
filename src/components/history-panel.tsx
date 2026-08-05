'use client';

import { cn } from '@/lib/utils';
import type { HistoryConversation } from '@/lib/history-data';

interface HistoryPanelProps {
  conversations: HistoryConversation[];
  selectedId: string | null;
  onSelect: (conversation: HistoryConversation) => void;
  onNewChat: () => void;
  onClose: () => void;
}

export function HistoryPanel({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  onClose,
}: HistoryPanelProps) {
  return (
    <div className="w-72 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col shrink-0">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-[#E2E8F0] shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-[#E2E8F0] transition-colors mr-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
        </button>
        <span className="text-sm font-medium text-[#0F172A]">近30天记录</span>
      </div>

      {/* New Chat Button */}
      <div className="px-3 py-3 shrink-0">
        <button
          onClick={onNewChat}
          className="w-full py-2.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14" /><path d="M5 12h14" />
          </svg>
          开启新对话
        </button>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="space-y-0.5">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150 truncate',
                selectedId === conv.id
                  ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                  : 'text-[#334155] hover:bg-[#E2E8F0]/60'
              )}
            >
              {conv.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
