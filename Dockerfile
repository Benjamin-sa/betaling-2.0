# Multi-stage build for minimal production image
FROM node:20-alpine AS builder

# Stel de werkbalk in voor de gehele monorepo
WORKDIR /app

# Kopieer package files voor de root, client, en server workspaces
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

# Installeer ALLE afhankelijkheden voor alle workspaces
RUN npm ci --legacy-peer-deps

# Kopieer broncode voor zowel client als server
COPY client ./client
COPY server ./server

# Debug: Check structure before build
RUN echo "=== Files before build ===" && \
  ls -la . && \
  echo "=== Client files ===" && \
  ls -la client/ && \
  echo "=== Server files ===" && \
  ls -la server/

# Bouw de client-applicatie
RUN npm run build:client

# Debug: Check if build was successful
RUN echo "=== Files after build ===" && \
  ls -la client/ && \
  echo "=== Client dist files ===" && \
  ls -la client/dist/ || echo "No dist directory found"

# Productie-stage
FROM node:20-alpine AS production

# Creëer non-root user voor veiligheid
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Stel working directory in op /app
WORKDIR /app

# Kopieer server bestanden en package.json voor productie dependencies
COPY --from=builder --chown=nextjs:nodejs /app/server ./server/
COPY --from=builder --chown=nextjs:nodejs /app/server/package*.json ./server/

# Kopieer de gebouwde client bestanden naar de server directory
COPY --from=builder --chown=nextjs:nodejs /app/client/dist ./server/client/dist/

# Debug: Check copied files
RUN echo "=== Production stage files ===" && \
  ls -la . && \
  echo "=== Server files ===" && \
  ls -la server/ && \
  echo "=== Client dist in server ===" && \
  ls -la server/client/dist/ || echo "No client dist found in server"

# Installeer alleen productie dependencies voor de server
WORKDIR /app/server
RUN npm ci --only=production

# Ga terug naar de app directory
WORKDIR /app

# Stel omgevingsvariabelen in voor optimalisatie
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn  

# Schakel over naar de non-root user
USER nextjs

# Exposeer poort
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start de applicatie
CMD ["node", "./server/index.js"]