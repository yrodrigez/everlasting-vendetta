FROM node:24-bookworm-slim AS builder
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY postcss.config.js ./
COPY tsconfig.json ./
COPY tailwind.config.ts ./
COPY next.config.mjs ./
COPY next-env.d.ts ./
COPY public ./public
COPY src ./src

RUN pnpm install --frozen-lockfile
RUN pnpm run build


FROM node:24-bookworm-slim AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./static

EXPOSE 3000

CMD ["node", "server.js"]