FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_MEDIA_HOST
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_ENABLE_BORDER_RADIUS
ARG NEXT_PUBLIC_BORDER_RADIUS
# Build-time, not run-time: next.config.ts `headers()` is evaluated during the
# build and baked into the routes manifest.
ARG ENABLE_HSTS=false
ENV NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_ENABLE_BORDER_RADIUS=$NEXT_PUBLIC_ENABLE_BORDER_RADIUS \
    NEXT_PUBLIC_BORDER_RADIUS=$NEXT_PUBLIC_BORDER_RADIUS \
    ENABLE_HSTS=$ENABLE_HSTS \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

RUN corepack enable pnpm && pnpm run build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# Standalone tracing omits sharp; install the alpine/musl binary in isolation so npm
# does not re-resolve the standalone package.json dependency tree.
# Pinned (not `npm install sharp`) so a future sharp release cannot silently
# change the image — keep in step with the version in package.json.
ARG SHARP_VERSION=0.34.5
RUN mkdir /tmp/sharp-install && cd /tmp/sharp-install \
    && npm init -y \
    && npm install --no-audit --no-fund "sharp@${SHARP_VERSION}" \
    && rm -rf /app/node_modules/sharp /app/node_modules/@img \
    && cp -r node_modules/. /app/node_modules/ \
    && chown -R nextjs:nodejs /app/node_modules/sharp /app/node_modules/@img \
    && rm -rf /tmp/sharp-install

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
