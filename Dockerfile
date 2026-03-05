FROM node:20-alpine AS builder

WORKDIR /app

# Copier tout le projet et installer les dépendances
COPY . .
RUN npm install && npm run build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copier uniquement ce qui est nécessaire pour faire tourner l'app Next.js
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.* ./ 2>/dev/null || true
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]

