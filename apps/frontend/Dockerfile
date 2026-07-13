FROM oven/bun:1 AS build
WORKDIR /app

COPY package.json bun.lock bunfig.toml ./
COPY apps/frontend/package.json apps/frontend/tsconfig.json apps/frontend/vite.config.ts ./apps/frontend/
COPY apps/backend/package.json apps/backend/tsconfig.json ./apps/backend/
COPY packages/shared/package.json packages/shared/tsconfig.json ./packages/shared/

RUN bun install --frozen-lockfile

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app/apps/frontend
RUN bun run vite build

FROM nginx:alpine
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
