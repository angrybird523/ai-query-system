"""
对话处理服务

负责处理用户消息，调用通义千问 API 获取 AI 回复
支持返回结构化数据（表格、图表、洞察）和纯文本两种模式
"""

from typing import Optional
from datetime import datetime
import requests
import json
import re

# 通义千问 API 配置
QWEN_API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions"
QWEN_API_KEY = "sk-ws-H.EPRPHII.QBNK.MEQCIF4VX0-Unb77ud6_27l4dv7JznyhSs3m9PI-NMafnZ4xAiBGvUkrHJF7NYIF-suiYRU1dUlmJ35oyGtCNfpTZYR_sQ"
QWEN_MODEL = "qwen-turbo"

# 系统提示词：指导 AI 返回结构化数据
SYSTEM_PROMPT = """你是"经管之星"智能问答助手，专为企业经营数据分析提供服务。

## 回答格式要求
当用户的问题涉及数据查询、对比、分析时，你必须以 JSON 格式返回结果。JSON 结构如下：
{
  "summary": "对用户问题的简要文字回答和分析（100字以内，简洁专业）",
  "table": {
    "headers": ["列名1", "列名2", ...],
    "rows": [["值1", "值2", ...], ...]
  },
  "insights": ["洞察要点1", "洞察要点2", ...],
  "chartData": {
    "title": "图表标题",
    "categories": ["分类1", "分类2", ...],
    "series": [
      {"name": "系列名", "values": [数值1, 数值2, ...], "color": "primary", "unit": "万元"}
    ]
  }
}

## 字段说明
- summary: 必填，简短的文字总结
- table: 可选，当问题涉及具体数据对比时提供表格，headers为表头，rows为数据行
- insights: 必填，2-4条分析洞察或建议，每条不超过30字
- chartData: 可选，当数据适合可视化时提供柱状图数据，series中color只能是"primary"或"secondary"

## 重要规则
1. 必须输出合法的 JSON，不要包含 markdown 代码块标记（如 ```json）
2. 数据可以基于合理假设生成示例数据，但要贴近真实商业场景
3. 如果用户只是打招呼或问非数据问题，可以返回纯文本，不需要 JSON 格式
4. 表格数据一般3-6行，不要太多
5. insights 至少提供2条"""


class ChatService:
    """对话服务类"""

    def __init__(self):
        self.conversation_history = {}

    def _try_parse_json(self, text: str) -> Optional[dict]:
        """尝试从 AI 回复中提取 JSON"""
        # 先尝试直接解析
        text = text.strip()
        # 移除可能的 markdown 代码块标记
        text = re.sub(r'^```(?:json)?\s*', '', text)
        text = re.sub(r'\s*```$', '', text)
        text = text.strip()

        try:
            data = json.loads(text)
            if isinstance(data, dict) and "summary" in data:
                return data
        except (json.JSONDecodeError, ValueError):
            pass

        # 尝试从文本中提取 JSON 块
        json_match = re.search(r'\{[\s\S]*"summary"[\s\S]*\}', text)
        if json_match:
            try:
                data = json.loads(json_match.group())
                if isinstance(data, dict) and "summary" in data:
                    return data
            except (json.JSONDecodeError, ValueError):
                pass

        return None

    def _validate_query_result(self, data: dict) -> dict:
        """校验并补全 QueryResult 格式"""
        result = {
            "summary": data.get("summary", ""),
            "insights": [],
            "chartData": None,
        }

        # 处理 table
        table = data.get("table")
        if table and isinstance(table, dict):
            headers = table.get("headers", [])
            rows = table.get("rows", [])
            if headers and rows:
                result["table"] = {
                    "headers": [str(h) for h in headers],
                    "rows": [[str(cell) for cell in row] for row in rows]
                }

        # 处理 insights
        insights = data.get("insights", [])
        if isinstance(insights, list):
            result["insights"] = [str(i) for i in insights if i]

        # 处理 chartData
        chart = data.get("chartData")
        if chart and isinstance(chart, dict):
            series = chart.get("series", [])
            if chart.get("categories") and series:
                valid_series = []
                for s in series:
                    if isinstance(s, dict) and s.get("name") and s.get("values"):
                        valid_series.append({
                            "name": str(s["name"]),
                            "values": [float(v) if isinstance(v, (int, float)) else 0 for v in s["values"]],
                            "color": s.get("color", "primary") if s.get("color") in ("primary", "secondary") else "primary",
                            "unit": s.get("unit", "")
                        })
                if valid_series:
                    result["chartData"] = {
                        "title": str(chart.get("title", "")),
                        "categories": [str(c) for c in chart["categories"]],
                        "series": valid_series
                    }

        return result

    def process_message(self, message: str, conversation_id: Optional[str] = None) -> dict:
        """处理用户消息，调用通义千问 API"""
        start_ts = datetime.now()

        try:
            # 构建消息列表
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]

            # 加入对话历史
            if conversation_id and conversation_id in self.conversation_history:
                messages.extend(self.conversation_history[conversation_id])

            messages.append({"role": "user", "content": message})

            # 调用通义千问 API
            response = requests.post(
                QWEN_API_URL,
                headers={
                    "Authorization": f"Bearer {QWEN_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": QWEN_MODEL,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": 1500
                },
                timeout=30
            )

            if response.status_code != 200:
                raise Exception(f"API 调用失败: {response.status_code} - {response.text}")

            result = response.json()
            ai_content = result["choices"][0]["message"]["content"]

            # 保存对话历史
            if conversation_id:
                if conversation_id not in self.conversation_history:
                    self.conversation_history[conversation_id] = []
                self.conversation_history[conversation_id].append({"role": "user", "content": message})
                self.conversation_history[conversation_id].append({"role": "assistant", "content": ai_content})
                if len(self.conversation_history[conversation_id]) > 20:
                    self.conversation_history[conversation_id] = self.conversation_history[conversation_id][-20:]

            duration_ms = int((datetime.now() - start_ts).total_seconds() * 1000)
            token_count = result.get("usage", {}).get("total_tokens", 0)

            # 尝试解析结构化数据
            parsed = self._try_parse_json(ai_content)
            if parsed:
                query_result = self._validate_query_result(parsed)
                query_result["meta"] = {
                    "durationMs": duration_ms,
                    "tokenCount": token_count,
                    "timestamp": int(datetime.now().timestamp() * 1000)
                }
                return query_result
            else:
                # 纯文本回复（打招呼、非数据问题等）
                return {
                    "summary": ai_content,
                    "insights": [],
                    "chartData": None,
                    "meta": {
                        "durationMs": duration_ms,
                        "tokenCount": token_count,
                        "timestamp": int(datetime.now().timestamp() * 1000)
                    }
                }

        except requests.exceptions.Timeout:
            duration_ms = int((datetime.now() - start_ts).total_seconds() * 1000)
            return {
                "summary": "抱歉，AI 服务响应超时，请稍后重试。",
                "insights": [],
                "chartData": None,
                "meta": {"durationMs": duration_ms, "tokenCount": 0, "timestamp": int(datetime.now().timestamp() * 1000)}
            }

        except Exception as e:
            duration_ms = int((datetime.now() - start_ts).total_seconds() * 1000)
            return {
                "summary": f"抱歉，服务出现异常：{str(e)[:100]}",
                "insights": [],
                "chartData": None,
                "meta": {"durationMs": duration_ms, "tokenCount": 0, "timestamp": int(datetime.now().timestamp() * 1000)}
            }