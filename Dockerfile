# 经管之星 - Next.js 前端 Dockerfile
# ===== 依赖安装阶段 =====
FROM node:20-alpine AS deps
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml .npmrc ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# ===== 构建阶段 =====
FROM node:20-alpine AS builder
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 安装 bash（Alpine 默认没有）
RUN apk add --no-cache bash

# 构建 Next.js
RUN pnpm build

# ===== 运行阶段 =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# 创建非 root 用户
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
