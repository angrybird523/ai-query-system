/**
 * 文件名: mock-data.ts
 * 功能描述: 虚拟经营数据库，包含4城市×3产品线×3月份共36条销售记录，
 *           以及基于关键词匹配的查询引擎
 * 主要导出: salesData（数据数组）, querySalesData（查询函数）, formatRevenue（格式化工具）
 */

import type { SalesRecord, QueryResult, QueryMeta, ChartData } from '@/types';

/**
 * 虚拟经营数据库
 * 覆盖北京、上海、深圳、广州四个城市，三条产品线，2025年Q1（1-3月）
 */
export const salesData: SalesRecord[] = [
  // ===== 北京 =====
  { id: 1,  city: '北京', productLine: '企业云服务',   revenue: 1580000, quantity: 42,  month: '1月', year: 2025 },
  { id: 2,  city: '北京', productLine: '企业云服务',   revenue: 1720000, quantity: 45,  month: '2月', year: 2025 },
  { id: 3,  city: '北京', productLine: '企业云服务',   revenue: 1650000, quantity: 43,  month: '3月', year: 2025 },
  { id: 4,  city: '北京', productLine: '数据分析平台', revenue: 980000,  quantity: 28,  month: '1月', year: 2025 },
  { id: 5,  city: '北京', productLine: '数据分析平台', revenue: 1050000, quantity: 30,  month: '2月', year: 2025 },
  { id: 6,  city: '北京', productLine: '数据分析平台', revenue: 1120000, quantity: 32,  month: '3月', year: 2025 },
  { id: 7,  city: '北京', productLine: '智能办公套件', revenue: 620000,  quantity: 156, month: '1月', year: 2025 },
  { id: 8,  city: '北京', productLine: '智能办公套件', revenue: 680000,  quantity: 168, month: '2月', year: 2025 },
  { id: 9,  city: '北京', productLine: '智能办公套件', revenue: 710000,  quantity: 175, month: '3月', year: 2025 },
  // ===== 上海 =====
  { id: 10, city: '上海', productLine: '企业云服务',   revenue: 1920000, quantity: 52,  month: '1月', year: 2025 },
  { id: 11, city: '上海', productLine: '企业云服务',   revenue: 2050000, quantity: 55,  month: '2月', year: 2025 },
  { id: 12, city: '上海', productLine: '企业云服务',   revenue: 1980000, quantity: 53,  month: '3月', year: 2025 },
  { id: 13, city: '上海', productLine: '数据分析平台', revenue: 1250000, quantity: 35,  month: '1月', year: 2025 },
  { id: 14, city: '上海', productLine: '数据分析平台', revenue: 1380000, quantity: 38,  month: '2月', year: 2025 },
  { id: 15, city: '上海', productLine: '数据分析平台', revenue: 1420000, quantity: 40,  month: '3月', year: 2025 },
  { id: 16, city: '上海', productLine: '智能办公套件', revenue: 850000,  quantity: 210, month: '1月', year: 2025 },
  { id: 17, city: '上海', productLine: '智能办公套件', revenue: 920000,  quantity: 225, month: '2月', year: 2025 },
  { id: 18, city: '上海', productLine: '智能办公套件', revenue: 880000,  quantity: 218, month: '3月', year: 2025 },
  // ===== 深圳 =====
  { id: 19, city: '深圳', productLine: '企业云服务',   revenue: 1350000, quantity: 38,  month: '1月', year: 2025 },
  { id: 20, city: '深圳', productLine: '企业云服务',   revenue: 1480000, quantity: 40,  month: '2月', year: 2025 },
  { id: 21, city: '深圳', productLine: '企业云服务',   revenue: 1520000, quantity: 41,  month: '3月', year: 2025 },
  { id: 22, city: '深圳', productLine: '数据分析平台', revenue: 820000,  quantity: 24,  month: '1月', year: 2025 },
  { id: 23, city: '深圳', productLine: '数据分析平台', revenue: 890000,  quantity: 26,  month: '2月', year: 2025 },
  { id: 24, city: '深圳', productLine: '数据分析平台', revenue: 950000,  quantity: 28,  month: '3月', year: 2025 },
  { id: 25, city: '深圳', productLine: '智能办公套件', revenue: 560000,  quantity: 140, month: '1月', year: 2025 },
  { id: 26, city: '深圳', productLine: '智能办公套件', revenue: 590000,  quantity: 148, month: '2月', year: 2025 },
  { id: 27, city: '深圳', productLine: '智能办公套件', revenue: 630000,  quantity: 158, month: '3月', year: 2025 },
  // ===== 广州 =====
  { id: 28, city: '广州', productLine: '企业云服务',   revenue: 1100000, quantity: 30,  month: '1月', year: 2025 },
  { id: 29, city: '广州', productLine: '企业云服务',   revenue: 1180000, quantity: 32,  month: '2月', year: 2025 },
  { id: 30, city: '广州', productLine: '企业云服务',   revenue: 1250000, quantity: 34,  month: '3月', year: 2025 },
  { id: 31, city: '广州', productLine: '数据分析平台', revenue: 680000,  quantity: 20,  month: '1月', year: 2025 },
  { id: 32, city: '广州', productLine: '数据分析平台', revenue: 720000,  quantity: 22,  month: '2月', year: 2025 },
  { id: 33, city: '广州', productLine: '数据分析平台', revenue: 780000,  quantity: 24,  month: '3月', year: 2025 },
  { id: 34, city: '广州', productLine: '智能办公套件', revenue: 450000,  quantity: 112, month: '1月', year: 2025 },
  { id: 35, city: '广州', productLine: '智能办公套件', revenue: 480000,  quantity: 120, month: '2月', year: 2025 },
  { id: 36, city: '广州', productLine: '智能办公套件', revenue: 520000,  quantity: 130, month: '3月', year: 2025 },
];

/**
 * 格式化金额显示
 * @param value - 金额数值（元）
 * @returns 格式化后的字符串，如 "158.00 万元" 或 "1,234 元"
 */
export function formatRevenue(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(2) + ' 万元';
  }
  return value.toLocaleString() + ' 元';
}

/**
 * 生成模拟的查询元信息（耗时、Token数、时间戳）
 * @returns QueryMeta 对象
 */
function generateMeta(): QueryMeta {
  return {
    durationMs: Math.floor(Math.random() * 1300) + 1200, // 1200~2500ms
    tokenCount: Math.floor(Math.random() * 700) + 800,   // 800~1500 tokens
    timestamp: Date.now(),
  };
}

/**
 * 根据用户问题关键词查询销售数据
 * 支持三种查询模式：
 *   1. 全局产品线汇总（不含城市关键词）
 *   2. 指定城市的产品线明细
 *   3. 默认整体概况
 *
 * @param question - 用户输入的问题文本
 * @returns 结构化查询结果（含摘要、表格、洞察、图表数据）
 */
export function querySalesData(question: string): QueryResult {
  const q = question.toLowerCase();

  // 模式1：各产品线销售情况（不涉及具体城市）
  const cityNames = ['北京', '上海', '深圳', '广州'];
  const isGlobalQuery = q.includes('产品线') && !cityNames.some(c => q.includes(c));

  if (isGlobalQuery) {
    const productLines = ['企业云服务', '数据分析平台', '智能办公套件'];

    // 构建表格行
    const rows = productLines.map((pl) => {
      const records = salesData.filter((r) => r.productLine === pl);
      const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);
      const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
      return [pl, formatRevenue(totalRevenue), totalQuantity.toString(), records.length.toString()];
    });

    // 构建图表数据
    const chartData: ChartData = {
      title: '各产品线营收与销量对比',
      categories: productLines,
      series: [
        {
          name: '总营收(万元)',
          values: productLines.map((pl) => {
            const total = salesData.filter(r => r.productLine === pl).reduce((s, r) => s + r.revenue, 0);
            return Number((total / 10000).toFixed(2));
          }),
          color: 'primary',
          unit: '万元',
        },
        {
          name: '总销量',
          values: productLines.map((pl) =>
            salesData.filter(r => r.productLine === pl).reduce((s, r) => s + r.quantity, 0)
          ),
          color: 'secondary',
        },
      ],
    };

    return {
      summary: '以下是 2025 年 Q1（1-3月）各产品线的销售汇总数据：',
      table: { headers: ['产品线', '总营收', '总销量', '记录数'], rows },
      insights: [
        '企业云服务是营收最高的产品线，Q1 总营收占比约 52%',
        '数据分析平台增长势头良好，3月环比增长明显',
        '智能办公套件销量最大，但客单价较低，可考虑推出高级版本',
      ],
      chartData,
      meta: generateMeta(),
    };
  }

  // 模式2：指定城市的产品线明细
  const matchedCity = cityNames.find((c) => q.includes(c));

  if (matchedCity) {
    const cityRecords = salesData.filter((r) => r.city === matchedCity);
    const productLines = [...new Set(cityRecords.map((r) => r.productLine))];

    // 构建表格行
    const rows = productLines.map((pl) => {
      const records = cityRecords.filter((r) => r.productLine === pl);
      const totalRevenue = records.reduce((sum, r) => sum + r.revenue, 0);
      const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
      const months = records.map((r) => r.month).join('、');
      return [pl, formatRevenue(totalRevenue), totalQuantity.toString(), months];
    });

    const totalCityRevenue = cityRecords.reduce((sum, r) => sum + r.revenue, 0);

    // 构建图表数据
    const chartData: ChartData = {
      title: `${matchedCity} 各产品线营收对比`,
      categories: productLines,
      series: [
        {
          name: '营收(万元)',
          values: productLines.map((pl) => {
            const total = cityRecords.filter(r => r.productLine === pl).reduce((s, r) => s + r.revenue, 0);
            return Number((total / 10000).toFixed(2));
          }),
          color: 'primary',
          unit: '万元',
        },
        {
          name: '销量',
          values: productLines.map((pl) =>
            cityRecords.filter(r => r.productLine === pl).reduce((s, r) => s + r.quantity, 0)
          ),
          color: 'secondary',
        },
      ],
    };

    return {
      summary: `以下是 ${matchedCity} 2025 年 Q1 各产品线的销售明细：`,
      table: { headers: ['产品线', '营收', '销量', '覆盖月份'], rows },
      insights: [
        `${matchedCity} Q1 总营收为 ${formatRevenue(totalCityRevenue)}`,
        `企业云服务在${matchedCity}表现最强，建议持续加大投入`,
        q.includes('产品')
          ? `${matchedCity}各产品线发展较为均衡，无明显短板`
          : `${matchedCity}市场潜力较大，可考虑增加资源投入`,
      ],
      chartData,
      meta: generateMeta(),
    };
  }

  // 模式3：默认回答 —— 整体经营概况
  const totalRevenue = salesData.reduce((sum, r) => sum + r.revenue, 0);
  const totalQuantity = salesData.reduce((sum, r) => sum + r.quantity, 0);
  const cityCount = new Set(salesData.map((r) => r.city)).size;

  return {
    summary: '根据当前经营数据库，以下是整体经营概况：',
    table: {
      headers: ['指标', '数值'],
      rows: [
        ['Q1 总营收', formatRevenue(totalRevenue)],
        ['Q1 总销量', totalQuantity.toString() + ' 单'],
        ['覆盖城市', cityCount + ' 个'],
        ['产品线', '3 条'],
        ['数据周期', '2025年1月 - 3月'],
      ],
    },
    insights: [
      '您可以问我具体城市或产品线的销售情况',
      '例如："北京的产品线收入情况"、"深圳的产品销售情况"',
      '目前数据覆盖北京、上海、深圳、广州四个城市',
    ],
    meta: generateMeta(),
  };
}
