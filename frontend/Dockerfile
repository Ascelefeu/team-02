# Dockerfile pour le développement frontend
FROM node:20-alpine

# Sécurité : Création d'un utilisateur non-root
RUN apk upgrade --no-cache
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du code source
COPY . .

# Droits sur le répertoire pour l'utilisateur non-root
RUN chown -R appuser:appgroup /app

USER appuser

# Exposition du port Vite
EXPOSE 5173

# Healthcheck pour vérifier que le serveur de dev répond
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:5173/ || exit 1

# Commande par défaut (peut être overridée par docker-compose)
CMD ["npm", "run", "dev", "--", "--host"]
