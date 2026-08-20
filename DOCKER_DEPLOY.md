# Docker 部署指南

## 前置要求
- Docker Desktop 已安装并运行
- Docker Compose（Docker Desktop 自带）

## 一键启动

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看运行状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

## 访问地址

| 服务   | 地址                  |
| ------ | --------------------- |
| 前端   | http://localhost:3000 |
| 后端   | http://localhost:8000 |
| 健康检查 | http://localhost:8000/api/health |

## 停止服务

```bash
docker-compose down
```

## 重新构建

```bash
docker-compose up -d --build
```
