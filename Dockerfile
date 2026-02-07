# Stage 1: Builder
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY src ./src

# Build de l'application
RUN npm run build

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Créer un utilisateur non-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer uniquement les dépendances de production
RUN npm ci --only=production && \
    npm cache clean --force

# Copier le build depuis le stage builder
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Créer le dossier uploads
RUN mkdir -p uploads && chown -R nestjs:nodejs uploads

# Changer vers l'utilisateur non-root
USER nestjs

# Exposer le port
EXPOSE 3000

# Variable d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Démarrer l'application
CMD ["node", "dist/main"]
