FROM node:20.10.0-alpine3.19 AS base

ENV NODE_OPTIONS=--max_old_space_size=2048

RUN npm i -g pnpm

FROM base AS dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install 

FROM base AS builder

WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN pnpm build 

FROM base AS runner

WORKDIR /app
COPY --from=builder /app/.next/ ./.next/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/node_modules/next/dist/compiled/jest-worker ./node_modules/next/dist/compiled/jest-worker
COPY . .

CMD if [ $ENV = "production" ]; then pnpm start; else pnpm dev; fi