# Multi-stage build for minimal production image
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY client/package*.json ./client/
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production && \
  npm ci --only=production --prefix client && \
  npm ci --only=production --prefix server

# Copy source code
COPY client ./client
COPY server ./server

# Build the client
RUN npm run build:client

# Production stage
FROM node:20-alpine AS production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY server/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/server ./
COPY --from=builder --chown=nextjs:nodejs /app/client/dist ./public

# Set environment variables for optimization
ENV NODE_ENV=production
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application
CMD ["node", "index.js"]