FROM node:20-bookworm-slim AS base

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps

COPY package.json package-lock.json ./
RUN npm ci

FROM base AS prod-deps

ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/lec_facom?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npm ci --omit=dev \
  && npx prisma generate \
  && npm cache clean --force

FROM base AS builder

ARG DATABASE_URL=postgresql://postgres:postgres@db:5432/lec_facom?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY next.config.ts ./
COPY postcss.config.mjs ./
COPY eslint.config.mjs ./
COPY components.json ./
COPY public ./public
COPY src ./src
COPY scripts ./scripts

RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./
COPY next.config.ts ./
COPY scripts ./scripts

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
  && mkdir -p /app/public/uploads

EXPOSE 3000

CMD ["/entrypoint.sh"]
