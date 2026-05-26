# ---- Stage 1: Build ----
FROM node:22-alpine AS builder
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV PRISMA_CLI_QUERY_ENGINE_TYPE='binary'
ENV PRISMA_CLIENT_ENGINE_TYPE='binary'
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PRIVATE_SKIP_BUILD_STATIC_GENERATION=1

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy Prisma schema before generating
COPY prisma ./prisma/
RUN npx prisma generate

# Copy source code
COPY . .

# Build Next.js with more memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# ---- Stage 2: Runner ----
FROM node:22-alpine AS runner
RUN apk add --no-cache openssl libc6-compat
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PRISMA_CLI_QUERY_ENGINE_TYPE='binary'
ENV PRISMA_CLIENT_ENGINE_TYPE='binary'

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy ALL node_modules from builder (NO re-install)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Copy Prisma files for migrations
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Run migrations then start
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
