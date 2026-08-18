"""
对话处理服务

负责处理用户消息，生成 AI 回复
返回格式与前端 QueryResult 类型完全匹配
"""

from typing import Optional
from data.mock_data import MockDatabase
from datetime import datetime


class ChatService:
    """对话服务类"""

    def __init__(self):
        """初始化服务"""
        self.db = MockDatabase()

    def process_message(self, message: str, conversation_id: Optional[str] = None) -> dict:
        """
        处理用户消息

        Args:
            message: 用户输入的消息
            conversation_id: 对话 ID

        Returns:
            符合前端 QueryResult 格式的字典
        """
        # 记录处理开始时间
        start_ts = datetime.now()

        # 关键词匹配，查询数据
        query_result = self.db.query_data(message)

        # 计算处理耗时（毫秒）
        duration_ms = int((datetime.now() - start_ts).total_seconds() * 1000)

        # 构建符合前端 QueryResult 格式的响应
        response = {
            "summary": query_result["summary"],
            "insights": query_result.get("insights", []),
            "meta": {
                "durationMs": duration_ms,
                "tokenCount": 100,
                "timestamp": int(datetime.now().timestamp() * 1000),
            }
        }

        # 图表数据（如果有）
        if query_result.get("chartData"):
            response["chartData"] = query_result["chartData"]

        return response
