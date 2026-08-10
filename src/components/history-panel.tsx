'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { HistoryConversation } from '@/lib/history-data';

interface HistoryPanelProps {
  conversations: HistoryConversation[];
  selectedId: string | null;
  onSelect: (conversation: HistoryConversation) => void;
  onNewChat: () => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export function HistoryPanel({
  conversations,
  selectedId,
  onSelect,
  onNewChat,
  onClose,
  onDelete,
}: HistoryPanelProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="w-72 bg-[#F8FAFC] border-r border-[#E2E8F0] flex flex-col shrink-0 relative">
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
            <div key={conv.id} className="group relative">
              <button
                onClick={() => onSelect(conv)}
                className={cn(
                  'w-full text-left px-3 py-2.5 pr-8 rounded-lg text-[13px] transition-all duration-150 truncate',
                  selectedId === conv.id
                    ? 'bg-[#EFF6FF] text-[#2563EB] font-medium'
                    : 'text-[#334155] hover:bg-[#E2E8F0]/60'
                )}
              >
                {conv.title}
              </button>
              {/* Delete button - visible on hover */}
              <button
                onClick={(e) => handleDeleteClick(e, conv.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-red-100 transition-all"
                title="删除对话"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-5 shadow-lg max-w-[280px] w-full mx-4">
            <div className="flex items-center gap-2 mb-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span className="text-sm font-medium text-[#0F172A]">确认删除</span>
            </div>
            <p className="text-sm text-[#64748B] mb-4">
              确定删除该对话记录吗？此操作不可撤销。
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCancelDelete}
                className="px-3 py-1.5 text-sm text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] rounded-lg transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-3 py-1.5 text-sm text-white bg-[#EF4444] hover:bg-[#DC2626] rounded-lg transition-colors"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
