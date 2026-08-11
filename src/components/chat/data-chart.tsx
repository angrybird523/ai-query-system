/**
 * 文件名: data-chart.tsx
 * 功能描述: 数据可视化图表组件，使用纯 SVG 绘制柱状图，支持多系列数据并列展示。
 *           蓝色(#2563EB)表示主系列，绿色(#10B981)表示对比系列。
 * 主要导出: DataVisualizationChart
 */

'use client';

import type { ChartData } from '@/types';

/**
 * 数据可视化柱状图组件
 * 纯 SVG 实现，无需第三方图表库，支持多系列数据并列展示
 *
 * @param props - 组件属性
 * @param props.data - 图表数据（标题、分类、系列）
 * @param props.className - 外层容器自定义类名
 */
export function DataVisualizationChart({ data, className = '' }: { data: ChartData; className?: string }) {
  // 图表布局常量
  const chartWidth = 500;   // SVG 宽度
  const chartHeight = 280;  // SVG 高度
  const padding = { top: 30, right: 30, bottom: 50, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  const { categories, series } = data;

  // 计算所有系列中的最大值，用于 Y 轴缩放（留 15% 顶部空间）
  const maxValue = Math.max(...series.flatMap((s) => s.values)) * 1.15;

  // 布局计算：每组分类的宽度和每根柱子的宽度
  const groupWidth = plotWidth / categories.length;
  const barCount = series.length;
  const barGap = 8;  // 柱子间距
  const barWidth = Math.min(40, (groupWidth - barGap * (barCount + 1)) / barCount);

  // 生成 Y 轴刻度线（5 个均匀分布的刻度）
  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const value = (maxValue / 5) * (i + 1);
    const y = padding.top + plotHeight - (value / maxValue) * plotHeight;
    return { value, y };
  });

  // 根据系列主题色获取填充颜色
  const getColor = (colorType: 'primary' | 'secondary') =>
    colorType === 'primary' ? '#2563EB' : '#10B981';

  return (
    <div className={`bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] p-5 ${className}`}>
      {/* 图表标题 */}
      <h4 className="text-sm font-semibold text-[#0F172A] mb-4">{data.title}</h4>

      {/* SVG 图表 */}
      <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {/* Y 轴网格线 */}
        {gridLines.map((line, i) => (
          <g key={i}>
            <line x1={padding.left} y1={line.y} x2={chartWidth - padding.right} y2={line.y}
              stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4" />
            <text x={padding.left - 8} y={line.y + 4} textAnchor="end"
              fontSize="11" fill="#94A3B8">
              {line.value >= 10000 ? `${(line.value / 10000).toFixed(1)}万` : Math.round(line.value)}
            </text>
          </g>
        ))}

        {/* X 轴基线 */}
        <line x1={padding.left} y1={padding.top + plotHeight}
          x2={chartWidth - padding.right} y2={padding.top + plotHeight}
          stroke="#CBD5E1" strokeWidth="1" />

        {/* 柱状图数据 */}
        {categories.map((category, catIdx) => {
          const groupX = padding.left + catIdx * groupWidth;
          const totalBarsWidth = barCount * barWidth + (barCount - 1) * barGap;
          const startX = groupX + (groupWidth - totalBarsWidth) / 2;

          return (
            <g key={catIdx}>
              {/* 遍历系列，绘制每根柱子 */}
              {series.map((s, sIdx) => {
                const x = startX + sIdx * (barWidth + barGap);
                const barHeight = (s.values[catIdx] / maxValue) * plotHeight;
                const y = padding.top + plotHeight - barHeight;

                return (
                  <g key={sIdx}>
                    <rect x={x} y={y} width={barWidth} height={barHeight}
                      fill={getColor(s.color)} rx="3" opacity="0.85" />
                    {/* 柱顶数值标签 */}
                    <text x={x + barWidth / 2} y={y - 6} textAnchor="middle"
                      fontSize="10" fill="#64748B" fontWeight="500">
                      {s.values[catIdx] >= 10000
                        ? `${(s.values[catIdx] / 10000).toFixed(1)}万`
                        : s.values[catIdx]}
                    </text>
                  </g>
                );
              })}

              {/* X 轴分类标签 */}
              <text x={groupX + groupWidth / 2} y={padding.top + plotHeight + 20}
                textAnchor="middle" fontSize="11" fill="#64748B">
                {category}
              </text>
            </g>
          );
        })}
      </svg>

      {/* 图例 */}
      <div className="flex items-center justify-center gap-6 mt-3">
        {series.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: getColor(s.color) }} />
            <span className="text-xs text-[#64748B]">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
