FROM oven/bun:1 AS base
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY apps/backend/package.json apps/backend/tsconfig.json ./apps/backend/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/

RUN bun install --frozen-lockfile

COPY . .

WORKDIR /app/apps/backend
RUN bun run build

COPY apps/backend/entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3000

CMD ["./entrypoint.sh"]
