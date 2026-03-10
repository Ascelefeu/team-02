# Dockerfile pour ./frontend/Dockerfile
FROM node:20-alpine

# Sécurité : Création d'un utilisateur non-root 
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copie des dépendances
COPY package*.json ./
RUN npm install

# Copie du code source
COPY . .

# Droits sur le répertoire pour l'utilisateur non-root
RUN chown -R appuser:appgroup /app

USER appuser

# Healthcheck obligatoire 
HEALTHCHECK --interval=30s CMD curl -f http://localhost:3000/ || exit 1

CMD ["npm", "start"]