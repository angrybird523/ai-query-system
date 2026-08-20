/**
 * 文件名: reply-proof-page.tsx
 * 功能描述: 回复校对页面，展示用户反馈的AI回复有误记录。
 *           支持搜索过滤（问题/用户）、状态筛选、分页、反馈处理弹窗。
 * 主要导出: ReplyProofPage
 */

'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { FeedbackRecord } from '@/types';

/** 每页显示条数 */
const PAGE_SIZE = 10;

/** 蓝色感叹号图标 */
const AlertIcon = () => (
  <div className="w-6 h-6 rounded-md bg-[#2563EB] flex items-center justify-center shrink-0">
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    </svg>
  </div>
);

/**
 * 回复校对页面
 * 展示用户反馈记录，支持搜索、筛选、分页和处理
 */
export function ReplyProofPage({
  feedbackData,
  onUpdateFeedback,
}: {
  feedbackData: FeedbackRecord[];
  onUpdateFeedback: (updated: FeedbackRecord[]) => void;
}) {
  // feedbackData and onUpdateFeedback are now received as props from HomePage
  const [searchQuestion, setSearchQuestion] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  // 弹窗状态
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<FeedbackRecord | null>(null);
  const [modalStatus, setModalStatus] = useState<'待处理' | '已处理'>('待处理');
  const [modalRemark, setModalRemark] = useState('');

  /** 过滤后的数据（根据搜索条件和状态筛选） */
  const filteredData = useMemo(() => {
    return feedbackData.filter((item) => {
      const matchQuestion = !searchQuestion || item.question.includes(searchQuestion);
      const matchUser = !searchUser || item.user.includes(searchUser);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchQuestion && matchUser && matchStatus;
    });
  }, [feedbackData, searchQuestion, searchUser, statusFilter]);

  // 分页计算
  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  /** 打开反馈处理弹窗 */
  const handleOpenModal = (record: FeedbackRecord) => {
    setSelectedRecord(record);
    setModalStatus(record.status);
    setModalRemark(record.remark);
    setModalOpen(true);
  };

  /** 关闭弹窗 */
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRecord(null);
  };

  /** 确认处理反馈 */
  const handleConfirm = () => {
    if (!selectedRecord) return;
    const updated = feedbackData.map((item) =>
      item.id === selectedRecord.id
        ? { ...item, status: modalStatus, remark: modalRemark }
        : item
    );
    onUpdateFeedback(updated);
    setModalOpen(false);
    setSelectedRecord(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* 顶部标题栏 */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">反馈管理</h1>
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
            <span className="text-[#64748B]">反馈管理</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            <span className="text-[#0F172A] font-medium">回复校对</span>
          </nav>

          {/* 白色大卡片容器 */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
            {/* 页面标题 */}
            <div className="flex items-center gap-1 mb-6">
              <AlertIcon />
              <h2 className="text-[16px] font-semibold text-[#0F172A]">回复校对</h2>
              <span className="text-[12px] text-[#64748B]">此列表为用户标注AI回复数据有误的信息数据</span>
            </div>

            {/* 搜索和筛选栏 */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-[240px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input type="text" placeholder="搜索问题..." value={searchQuestion}
                  onChange={(e) => { setSearchQuestion(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all" />
              </div>
              <div className="relative flex-1 max-w-[240px]">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                <input type="text" placeholder="搜索用户..." value={searchUser}
                  onChange={(e) => { setSearchUser(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all" />
              </div>
              <select value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all cursor-pointer">
                <option value="all">全部状态</option>
                <option value="待处理">待处理</option>
                <option value="已处理">已处理</option>
              </select>
            </div>

            {/* 数据表格 */}
            <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#F1F5F9] border-b border-[#E2E8F0]">
                    <th className="text-left py-3 px-4 font-semibold text-[#64748B] w-16">序号</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#64748B] w-24">用户</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#64748B]">问题</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#64748B] w-44">反馈时间</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#64748B] w-24">状态</th>
                    <th className="text-left py-3 px-4 font-semibold text-[#64748B] w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.length > 0 ? (
                    paginatedData.map((item, index) => (
                      <tr key={item.id} className={cn(
                        'border-b border-[#E2E8F0] last:border-0 transition-colors',
                        index % 2 === 0 ? 'bg-[#F8FAFC]' : 'bg-white'
                      )}>
                        <td className="py-3 px-4 text-[#64748B]">{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                        <td className="py-3 px-4 text-[#0F172A] font-medium">{item.user}</td>
                        <td className="py-3 px-4 text-[#334155]">{item.question}</td>
                        <td className="py-3 px-4 text-[#64748B]">{item.time}</td>
                        <td className="py-3 px-4"><StatusBadge status={item.status} /></td>
                        <td className="py-3 px-4">
                          <button onClick={() => handleOpenModal(item)}
                            className="text-[#2563EB] hover:text-[#1D4ED8] font-medium text-sm transition-colors">处理</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={6} className="py-12 text-center text-[#94A3B8]">暂无数据</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* 分页控件 */}
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-[#64748B]">共 <span className="font-medium text-[#0F172A]">{filteredData.length}</span> 条，每页 {PAGE_SIZE} 条</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage <= 1}
                  className={cn('px-3 py-1.5 rounded-md border text-sm transition-colors',
                    currentPage <= 1 ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]')}>上一页</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button key={page} onClick={() => setCurrentPage(page)}
                    className={cn('w-8 h-8 rounded-md text-sm transition-colors',
                      page === currentPage ? 'bg-[#2563EB] text-white' : 'text-[#334155] hover:bg-[#F1F5F9]')}>{page}</button>
                ))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}
                  className={cn('px-3 py-1.5 rounded-md border text-sm transition-colors',
                    currentPage >= totalPages ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed' : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]')}>下一页</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 反馈处理弹窗 */}
      {modalOpen && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={handleCloseModal} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[680px] max-h-[80vh] flex flex-col">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-2">
                <AlertIcon />
                <h3 className="text-[16px] font-semibold text-[#0F172A]">反馈处理</h3>
              </div>
              <button onClick={handleCloseModal} className="p-1.5 rounded-lg hover:bg-[#F1F5F9] transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>
            </div>
            {/* 弹窗内容：左右两栏 */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="flex gap-5">
                {/* 左栏：问题 + AI回复 */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-[#64748B] mb-1.5 block">用户提问</label>
                    <div className="px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-[14px] text-[#0F172A]">{selectedRecord.question}</div>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#64748B] mb-1.5 block">AI回复</label>
                    <div className="px-3.5 py-2.5 bg-[#FFF7ED] border border-[#FED7AA] rounded-lg text-[14px] text-[#9A3412] leading-relaxed">{selectedRecord.aiReply}</div>
                  </div>
                </div>
                {/* 右栏：状态 + 备注 */}
                <div className="w-[200px] space-y-4">
                  <div>
                    <label className="text-[13px] font-medium text-[#64748B] mb-1.5 block">处理状态</label>
                    <select value={modalStatus} onChange={(e) => setModalStatus(e.target.value as '待处理' | '已处理')}
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all cursor-pointer">
                      <option value="待处理">待处理</option>
                      <option value="已处理">已处理</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-[#64748B] mb-1.5 block">处理备注</label>
                    <textarea value={modalRemark} onChange={(e) => setModalRemark(e.target.value)}
                      placeholder="请输入处理备注..." rows={5}
                      className="w-full px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all resize-none" />
                  </div>
                </div>
              </div>
            </div>
            {/* 弹窗底部按钮 */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0]">
              <button onClick={handleCloseModal}
                className="px-4 py-2 text-sm font-medium text-[#334155] bg-white border border-[#E2E8F0] rounded-lg hover:bg-[#F8FAFC] transition-colors">取消</button>
              <button onClick={handleConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2563EB] rounded-lg hover:bg-[#1D4ED8] transition-colors">✓ 确认</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 状态标签组件
 * 根据状态显示不同颜色的标签
 */
function StatusBadge({ status }: { status: string }) {
  const isPending = status === '待处理';
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
      isPending ? 'bg-[#FFF7ED] text-[#EA580C]' : 'bg-[#F0FDF4] text-[#16A34A]')}>
      {status}
    </span>
  );
}
