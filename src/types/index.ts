/**
 * 文件名: index.ts
 * 功能描述: 全局类型定义集中管理，包含消息、对话、销售数据、图表配置等所有接口与类型
 * 主要导出: Message, ChatMessage, HistoryConversation, HistoryMessage,
 *          SalesRecord, QueryResult, ChartData, ChartSeries, QueryMeta,
 *          FeedbackRecord, ConfigItem 等
 */

/* ========================================
 * 消息与对话相关类型
 * ======================================== */

/** 聊天消息角色 */
export type MessageRole = 'user' | 'assistant';

/**
 * 聊天消息接口
 * 用于前端对话界面中展示的单条消息
 */
export interface Message {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色：用户或AI助手 */
  role: MessageRole;
  /** 消息文本内容 */
  content: string;
  /** AI回复附带的结构化数据（仅 assistant 角色有） */
  data?: QueryResult;
  /** 是否正在加载（显示loading动画） */
  loading?: boolean;
}

/**
 * 历史对话中的单条消息
 * 与 Message 类似，但不含 loading 状态
 */
export interface HistoryMessage {
  /** 消息唯一标识 */
  id: string;
  /** 消息角色 */
  role: MessageRole;
  /** 消息文本内容 */
  content: string;
  /** AI回复附带的结构化数据 */
  data?: QueryResult;
}

/**
 * 历史对话记录
 * 每条记录代表一次完整的对话会话
 */
export interface HistoryConversation {
  /** 对话唯一标识 */
  id: string;
  /** 对话标题（显示在历史面板中） */
  title: string;
  /** 对话中的消息列表 */
  messages: HistoryMessage[];
}

/* ========================================
 * 销售数据相关类型
 * ======================================== */

/**
 * 销售记录接口
 * 虚拟数据库中的单条经营数据
 */
export interface SalesRecord {
  /** 记录ID */
  id: number;
  /** 城市名称 */
  city: string;
  /** 产品线名称 */
  productLine: string;
  /** 营收金额（元） */
  revenue: number;
  /** 销售数量 */
  quantity: number;
  /** 月份（如"1月"） */
  month: string;
  /** 年份 */
  year: number;
}

/* ========================================
 * 查询结果相关类型
 * ======================================== */

/**
 * 图表数据系列
 * 描述图表中的一组数据（如"营收"或"销量"）
 */
export interface ChartSeries {
  /** 系列名称（显示在图例中） */
  name: string;
  /** 各分类对应的数值 */
  values: number[];
  /** 颜色主题：primary=蓝色, secondary=绿色 */
  color: 'primary' | 'secondary';
  /** 单位（如"万元"） */
  unit?: string;
}

/**
 * 图表数据配置
 * 用于渲染数据可视化柱状图
 */
export interface ChartData {
  /** 图表标题 */
  title: string;
  /** X轴分类标签列表 */
  categories: string[];
  /** 数据系列列表（支持多组数据并列展示） */
  series: ChartSeries[];
}

/**
 * 查询元信息
 * 记录AI处理请求的性能指标
 */
export interface QueryMeta {
  /** 处理耗时（毫秒） */
  durationMs: number;
  /** 消耗的Token数量 */
  tokenCount: number;
  /** 响应时间戳（毫秒） */
  timestamp: number;
}

/**
 * 查询结果接口
 * AI问答返回的结构化数据
 */
export interface QueryResult {
  /** AI总结文本 */
  summary: string;
  /** 数据表格（可选） */
  table?: {
    /** 表头列名 */
    headers: string[];
    /** 数据行（二维数组） */
    rows: string[][];
  };
  /** 分析洞察列表 */
  insights: string[];
  /** 图表数据（可选） */
  chartData?: ChartData;
  /** 元信息（可选） */
  meta?: QueryMeta;
}

/* ========================================
 * 反馈管理相关类型
 * ======================================== */

/**
 * 反馈记录接口
 * 用于回复校对页面的数据展示
 */
export interface FeedbackRecord {
  /** 记录ID */
  id: number;
  /** 反馈用户名称 */
  user: string;
  /** 用户提问内容 */
  question: string;
  /** AI回复内容 */
  aiReply: string;
  /** 反馈时间 */
  time: string;
  /** 处理状态 */
  status: '待处理' | '已处理';
  /** 处理备注 */
  remark: string;
}

/* ========================================
 * 应用配置相关类型
 * ======================================== */

/**
 * 配置项接口
 * 用于应用配置页面的功能开关卡片
 */
export interface ConfigItem {
  /** 配置项唯一标识 */
  id: string;
  /** 配置项标题 */
  title: string;
  /** 配置项描述 */
  description: string;
  /** 是否启用 */
  enabled: boolean;
  /** 是否有高级设置入口 */
  hasSettings: boolean;
  /** 配置项图标 */
  icon: React.ReactNode;
}
