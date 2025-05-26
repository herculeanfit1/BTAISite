# Development Dockerfile for Next.js 15 application
FROM node:20.19.1-alpine AS base

# Set environment variables
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1

# Create app directory
WORKDIR /app

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies with clean npm cache
RUN npm ci --ignore-scripts \
    && npm cache clean --force

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app

# Copy node_modules and source
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Final stage for development
FROM base AS runner
WORKDIR /app

# Copy from builder stage
COPY --from=builder /app ./

# Cleanup script to run when container stops
COPY ./scripts/docker-cleanup.sh /docker-cleanup.sh
RUN chmod +x /docker-cleanup.sh

# Set proper permissions for files
RUN chmod -R 755 /app

# Expose the port
EXPOSE 3000

# Add a health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use non-root user for better security
USER node

# Use shell form so we can use SIGTERM to run cleanup
CMD npm run dev & wait $! || /docker-cleanup.sh