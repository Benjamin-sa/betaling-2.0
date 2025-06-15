# Multi-stage build for minimal production image
FROM node:20-alpine AS builder

# Set working directory for the entire monorepo
WORKDIR /app

# Copy package files for root, client, and server workspaces
# Dit zorgt ervoor dat npm ci de workspace-structuur herkent
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

# Installeer afhankelijkheden voor alle workspaces.
# - Voor de root: alleen productie-afhankelijkheden.
# - Voor 'client': ALLE afhankelijkheden (inclusief devDependencies zoals 'vite')
#   omdat 'vite build' ze nodig heeft.
# - Voor 'server': alleen productie-afhankelijkheden.
RUN npm ci --only=production && \
  npm ci --prefix client && \
  npm ci --only=production --prefix server

# Kopieer broncode voor zowel client als server
COPY client ./client
COPY server ./server

# Bouw de client-applicatie
# Dit zal 'client/dist' creëren binnen de 'client' directory,
# die later wordt gekopieerd als onderdeel van de server-directory structuur.
RUN npm run build:client

# Productie-stage
FROM node:20-alpine AS production

# Creëer non-root user voor veiligheid
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Stel working directory in op /app
# Dit zal de basis zijn voor je server-applicatie.
WORKDIR /app
# Kopieer alleen de noodzakelijke bestanden van de builder stage
COPY --from=builder --chown=nextjs:nodejs /app/server ./server/


# Stel omgevingsvariabelen in voor optimalisatie
ENV NODE_ENV=production
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
# Start de server's index.js vanuit de '/app' WORKDIR.
CMD ["node", "./server/index.js"]