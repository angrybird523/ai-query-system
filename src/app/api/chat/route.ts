import { NextResponse } from 'next/server';
import { querySalesData } from '@/lib/mock-data';

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '请输入有效的问题' },
        { status: 400 }
      );
    }

    // 模拟 AI 思考延迟
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = querySalesData(message);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch {
    return NextResponse.json(
      { error: '服务处理异常，请稍后重试' },
      { status: 500 }
    );
  }
}
