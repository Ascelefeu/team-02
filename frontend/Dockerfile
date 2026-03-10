<<<<<<< HEAD
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
=======
# --- ÉTAPE 1 : BUILD ---
# On utilise une version "alpine" pour la légèreté 
FROM node:18-alpine AS build
WORKDIR /app

# On installe les dépendances d'abord (optimise le cache Docker)
COPY package*.json ./
RUN npm install

# On copie le reste du code et on build
COPY . .
RUN npm run build

# --- ÉTAPE 2 : PRODUCTION ---
# Image finale basée sur Nginx Alpine (très petite) 
FROM nginx:alpine

# Sécurité : On définit un utilisateur non-root (Bonus/Sécurité) 
# Note: Nginx alpine a déjà un utilisateur 'nginx'
RUN touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /var/log/nginx /usr/share/nginx/html

# On copie uniquement le résultat du build de l'étape précédente
COPY --from=build /app/dist /usr/share/nginx/html

# On expose le port 80 
EXPOSE 80

# On ajoute un Healthcheck pour valider les prérequis techniques 
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget -qO- http://localhost:80/ || exit 1

# On lance Nginx avec l'utilisateur sécurisé
USER nginx
CMD ["nginx", "-g", "daemon off;"]
>>>>>>> ebe3090c1279412cbbbf04f6c8d4d624b68eda13
