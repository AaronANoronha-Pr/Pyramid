# --- frontend build ---
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ARG NEXT_PUBLIC_API_URL=/api
ARG NEXT_PUBLIC_SOCKET_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SOCKET_URL=$NEXT_PUBLIC_SOCKET_URL
RUN npm run build

# --- backend build ---
FROM node:20-slim AS backend-builder
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 build-essential \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend/ ./
RUN npx prisma generate
RUN npm run build

# --- runtime ---
FROM node:20-slim
RUN apt-get update \
    && apt-get install -y --no-install-recommends nginx gettext-base openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# backend runtime files
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/generated ./backend/generated
COPY --from=backend-builder /app/backend/package.json ./backend/package.json
COPY --from=backend-builder /app/backend/prisma.config.ts ./backend/prisma.config.ts
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# frontend runtime files
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/public ./frontend/public
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json
COPY --from=frontend-builder /app/frontend/next.config.ts ./frontend/next.config.ts

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh \
    && rm -f /etc/nginx/sites-enabled/default

# SQLite lives inside the image's writable layer — no Render persistent disk.
# It resets on every redeploy/restart; the app reseeds on an empty DB.
ENV DATABASE_URL="file:/app/backend/prisma/dev.db"
ENV NODE_ENV=production

EXPOSE 10000
CMD ["/app/start.sh"]
