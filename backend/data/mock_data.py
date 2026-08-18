"""
虚拟数据库

模拟经营数据的存储和查询
返回格式与前端 QueryResult 类型完全匹配
"""

from typing import Optional


class MockDatabase:
    """虚拟数据库类"""

    def __init__(self):
        """初始化虚拟数据"""
        # 产品线数据
        self.product_data = {
            "产品线A": {"目标": 80, "实际": 100, "达成率": 125},
            "产品线B": {"目标": 90, "实际": 85, "达成率": 94},
            "产品线C": {"目标": 70, "实际": 78, "达成率": 111},
        }

        # 城市数据
        self.city_data = {
            "北京": {"销售额": 120, "订单量": 3500, "客单价": 343},
            "上海": {"销售额": 150, "订单量": 4200, "客单价": 357},
            "广州": {"销售额": 90, "订单量": 2800, "客单价": 321},
            "深圳": {"销售额": 110, "订单量": 3100, "客单价": 355},
        }

        # 部门数据
        self.department_data = {
            "销售部": {"员工数": 25, "业绩": 470, "人均产出": 18.8},
            "市场部": {"员工数": 15, "业绩": 280, "人均产出": 18.7},
            "运营部": {"员工数": 20, "业绩": 350, "人均产出": 17.5},
        }

    def query_data(self, message: str) -> dict:
        """
        根据消息查询数据，返回前端 QueryResult 格式

        Returns:
            { summary, insights, chartData?, meta }
        """
        if "产品线" in message or "产品" in message:
            return self._query_product_data(message)
        elif "城市" in message or "北京" in message or "上海" in message:
            return self._query_city_data(message)
        elif "部门" in message or "销售" in message or "市场" in message:
            return self._query_department_data(message)
        else:
            return self._default_response(message)

    def _query_product_data(self, message: str) -> dict:
        """查询产品线数据"""
        summary = "根据查询结果，各产品线销售情况如下：\n\n"
        for name, data in self.product_data.items():
            summary += f"- {name}：目标 {data['目标']}万，实际 {data['实际']}万，达成率 {data['达成率']}%\n"

        insights = [
            "产品线A达成率最高，达到125%",
            "产品线B未达标，建议关注原因",
            "整体产品线平均达成率为110%"
        ]

        chart_data = {
            "title": "产品线目标与实际对比（万元）",
            "categories": list(self.product_data.keys()),
            "series": [
                {
                    "name": "目标",
                    "values": [d["目标"] for d in self.product_data.values()],
                    "color": "primary",
                    "unit": "万元"
                },
                {
                    "name": "实际",
                    "values": [d["实际"] for d in self.product_data.values()],
                    "color": "secondary",
                    "unit": "万元"
                }
            ]
        }

        return {
            "summary": summary,
            "insights": insights,
            "chartData": chart_data,
        }

    def _query_city_data(self, message: str) -> dict:
        """查询城市数据"""
        summary = "各城市销售数据如下：\n\n"
        for name, data in self.city_data.items():
            summary += f"- {name}：销售额 {data['销售额']}万，订单量 {data['订单量']}，客单价 {data['客单价']}元\n"

        insights = [
            "上海销售额最高，达150万",
            "深圳客单价领先，为355元",
            "广州订单量相对较少，可加大推广力度"
        ]

        chart_data = {
            "title": "各城市销售额对比（万元）",
            "categories": list(self.city_data.keys()),
            "series": [
                {
                    "name": "销售额",
                    "values": [d["销售额"] for d in self.city_data.values()],
                    "color": "primary",
                    "unit": "万元"
                }
            ]
        }

        return {
            "summary": summary,
            "insights": insights,
            "chartData": chart_data,
        }

    def _query_department_data(self, message: str) -> dict:
        """查询部门数据"""
        summary = "各部门业绩情况如下：\n\n"
        for name, data in self.department_data.items():
            summary += f"- {name}：员工 {data['员工数']}人，业绩 {data['业绩']}万，人均产出 {data['人均产出']}万\n"

        insights = [
            "销售部业绩最高，达470万",
            "各部门人均产出差距不大，在17.5-18.8万之间",
            "销售部人均产出略高于其他部门"
        ]

        chart_data = {
            "title": "各部门业绩对比（万元）",
            "categories": list(self.department_data.keys()),
            "series": [
                {
                    "name": "业绩",
                    "values": [d["业绩"] for d in self.department_data.values()],
                    "color": "primary",
                    "unit": "万元"
                }
            ]
        }

        return {
            "summary": summary,
            "insights": insights,
            "chartData": chart_data,
        }

    def _default_response(self, message: str) -> dict:
        """默认回复"""
        return {
            "summary": "抱歉，我暂时无法理解您的问题。您可以尝试询问关于产品线、城市销售或部门业绩的数据。",
            "insights": [],
            "chartData": None,
        }
