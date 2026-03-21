# ─── Stage 1: Dependencies ───────────────────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Stage 2: Production image ───────────────────────────────
FROM node:20-alpine AS runner

# Create a non-root user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy installed production dependencies from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source
COPY . .

# Drop root privileges
USER appuser

# Environment and port
ENV NODE_ENV=production
EXPOSE 8000

# Health-check so orchestrators (Docker Compose / Kubernetes) can probe liveness
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:8000/health || exit 1

CMD ["npm", "start"]

