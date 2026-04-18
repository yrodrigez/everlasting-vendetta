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
COPY .env.local ./

RUN pnpm install --frozen-lockfile
RUN pnpm run build


FROM node:24-bookworm-slim AS runner
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/pnpm-workspace.yaml ./pnpm-workspace.yaml


EXPOSE 3000

CMD ["pnpm", "run", "start"]