# -------- Stage 1 : Build de l'application --------
FROM node:20-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du projet
COPY . .

# Build de l'application Next.js
RUN npm run build


# -------- Stage 2 : Image de production --------
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copier uniquement les fichiers nécessaires depuis le builder
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

# Port utilisé par Next.js
EXPOSE 3000

# Démarrer l'application
CMD ["npm", "run", "start"]