# Stage 1: Build
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/.output ./

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/index.mjs"]
