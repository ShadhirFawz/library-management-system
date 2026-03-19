# ─── Stage 1: Dependencies ───────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev

# ─── Stage 2: Production image ───────────────────────────────
FROM node:18-alpine AS runner

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy installed production dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Drop root privileges
USER appuser

# Default port — override via environment variable at runtime
EXPOSE 5003

# Health-check so orchestrators (Docker Compose / Kubernetes) can probe liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:${PORT:-5003}/health || exit 1

CMD ["node", "server.js"]
