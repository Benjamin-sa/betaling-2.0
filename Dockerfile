# Multi-stage build for minimal production image
FROM node:20-alpine AS builder

# Stel de werkbalk in voor de gehele monorepo
WORKDIR /app

# Kopieer package files voor de root, client, en server workspaces
# Dit zorgt ervoor dat npm ci de workspace-structuur herkent en alle afhankelijkheden,
# inclusief devDependencies (zoals vite) voor de client, installeert.
COPY package.json package-lock.json ./
COPY client/package.json client/package-lock.json ./client/
COPY server/package.json server/package-lock.json ./server/

# Installeer ALLE afhankelijkheden voor alle workspaces.
# Deze stap zorgt ervoor dat 'vite' beschikbaar is voor de build-stap van de client.
# 'npm ci' werkt met package-lock.json voor reproduceerbare builds.
# Verwijder --only=production hier, zodat devDependencies ook worden geïnstalleerd.
# --legacy-peer-deps wordt toegevoegd voor eventuele compatibiliteitsproblemen.
RUN npm ci --legacy-peer-deps

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
# uid 1001 is vaak de eerste beschikbare niet-root user
RUN addgroup -g 1001 -S nodejs && \
  adduser -S nextjs -u 1001

# Stel working directory in op /app
# Dit zal de basis zijn voor je server-applicatie in de productie-image.
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

# Health check (optioneel maar aanbevolen voor robuustheid)
# Controleert of de server reageert op /api/health op poort 8080.
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start de applicatie
# Start het hoofd-entrypoint van de server vanuit de '/app' WORKDIR.
CMD ["node", "./server/index.js"]