# syntax=docker/dockerfile:1

ARG NODE_VERSION=22-alpine3.22

FROM node:${NODE_VERSION} AS base
RUN apk upgrade --no-cache --ignore alpine-baselayout \
	&& apk add --no-cache libc6-compat
WORKDIR /app

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
ENV NODE_ENV=development
RUN corepack enable pnpm && pnpm install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Inlined at build time into the client bundle and next.config.js.
ARG NEXT_PUBLIC_MEDIA_HOST
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_MEDIA_HOST=$NEXT_PUBLIC_MEDIA_HOST
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

RUN corepack enable pnpm && pnpm run build

# Plain Alpine runtime — only the Node binary, no npm/corepack/yarn (major CVE source).
FROM alpine:3.22 AS runner
RUN apk upgrade --no-cache --ignore alpine-baselayout \
	&& apk add --no-cache libgcc libstdc++ icu-libs icu-data-full libc6-compat \
	&& addgroup --system --gid 1001 nodejs \
	&& adduser --system --uid 1001 nextjs

COPY --from=base /usr/local/bin/node /usr/local/bin/node

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /app/public ./public
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
