'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';

interface FeedbackRecord {
  id: number;
  user: string;
  question: string;
  time: string;
  status: '待处理' | '已处理';
}

const mockData: FeedbackRecord[] = [
  { id: 1, user: '张经理', question: '上季度销售目标达成率', time: '2026/8/5 15:38:05', status: '待处理' },
  { id: 2, user: '李主管', question: '本月应收账款账龄', time: '2026/8/2 15:38:05', status: '待处理' },
  { id: 3, user: '王主任', question: '各区域成本对比', time: '2026/7/30 15:38:05', status: '待处理' },
  { id: 4, user: '赵专员', question: '年度预算执行情况', time: '2026/7/27 15:38:05', status: '待处理' },
  { id: 5, user: '张经理', question: '上季度销售目标达成率', time: '2026/7/24 15:38:05', status: '待处理' },
  { id: 6, user: '李主管', question: '本月应收账款账龄', time: '2026/7/21 15:38:05', status: '待处理' },
];

const PAGE_SIZE = 10;

export function ReplyProofPage() {
  const [searchQuestion, setSearchQuestion] = useState('');
  const [searchUser, setSearchUser] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => {
    return mockData.filter((item) => {
      const matchQuestion = !searchQuestion || item.question.includes(searchQuestion);
      const matchUser = !searchUser || item.user.includes(searchUser);
      const matchStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchQuestion && matchUser && matchStatus;
    });
  }, [searchQuestion, searchUser, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / PAGE_SIZE));
  const paginatedData = filteredData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="h-16 border-b border-[#E2E8F0] flex items-center justify-between px-6 shrink-0">
        <h1 className="text-[16px] font-semibold text-[#0F172A]">反馈管理</h1>
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
        <div className="max-w-5xl mx-auto px-8 py-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-6">
            <span className="text-[#64748B]">反馈管理</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m9 18 6-6-6-6" />
            </svg>
            <span className="text-[#0F172A] font-medium">回复校对</span>
          </nav>

          {/* Title */}
          <div className="flex items-center gap-2.5 mb-6">
            <span className="text-xl">⚠️</span>
            <h2 className="text-[20px] font-bold text-[#0F172A]">回复校对</h2>
            <span className="text-[14px] text-[#64748B] ml-2">此列表为用户标注AI回复数据有误的信息数据</span>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-5">
            <div className="relative flex-1 max-w-[240px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="搜索问题..."
                value={searchQuestion}
                onChange={(e) => { setSearchQuestion(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>
            <div className="relative flex-1 max-w-[240px]">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="搜索用户..."
                value={searchUser}
                onChange={(e) => { setSearchUser(e.target.value); setCurrentPage(1); }}
                className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-2 text-sm border border-[#E2E8F0] rounded-lg bg-white text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 transition-all cursor-pointer"
            >
              <option value="all">全部状态</option>
              <option value="待处理">待处理</option>
              <option value="已处理">已处理</option>
            </select>
          </div>

          {/* Table */}
          <div className="border border-[#E2E8F0] rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
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
                    <tr
                      key={item.id}
                      className="border-b border-[#E2E8F0] last:border-0 hover:bg-[#F8FAFC] transition-colors"
                    >
                      <td className="py-3 px-4 text-[#64748B]">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </td>
                      <td className="py-3 px-4 text-[#0F172A] font-medium">{item.user}</td>
                      <td className="py-3 px-4 text-[#334155]">{item.question}</td>
                      <td className="py-3 px-4 text-[#64748B]">{item.time}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-[#2563EB] hover:text-[#1D4ED8] font-medium text-sm transition-colors">
                          处理
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#94A3B8]">
                      暂无数据
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 text-sm">
            <span className="text-[#64748B]">
              共 <span className="font-medium text-[#0F172A]">{filteredData.length}</span> 条，每页 {PAGE_SIZE} 条
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-sm transition-colors',
                  currentPage <= 1
                    ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                    : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                )}
              >
                上一页
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded-md text-sm transition-colors',
                    page === currentPage
                      ? 'bg-[#2563EB] text-white'
                      : 'text-[#334155] hover:bg-[#F1F5F9]'
                  )}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className={cn(
                  'px-3 py-1.5 rounded-md border text-sm transition-colors',
                  currentPage >= totalPages
                    ? 'border-[#E2E8F0] text-[#CBD5E1] cursor-not-allowed'
                    : 'border-[#E2E8F0] text-[#334155] hover:bg-[#F1F5F9]'
                )}
              >
                下一页
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const isPending = status === '待处理';
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        isPending
          ? 'bg-[#FFF7ED] text-[#EA580C]'
          : 'bg-[#F0FDF4] text-[#16A34A]'
      )}
    >
      {status}
    </span>
  );
}
