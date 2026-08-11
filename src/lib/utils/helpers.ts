/**
 * 文件名: helpers.ts
 * 功能描述: 通用辅助函数集合，提供 CSS 类名合并等基础工具
 * 主要导出: cn（CSS类名合并函数）
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * 合并 CSS 类名工具函数
 * 结合 clsx（条件类名）和 tailwind-merge（Tailwind 类名冲突处理），
 * 确保最终生成的类名无冲突且条件逻辑正确
 *
 * @param inputs - 类名参数列表，支持字符串、对象、数组等 clsx 支持的格式
 * @returns 合并后的 CSS 类名字符串
 *
 * @example
 * cn('px-4', isActive && 'bg-blue-500', 'py-2')
 * // => "px-4 py-2 bg-blue-500"
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
