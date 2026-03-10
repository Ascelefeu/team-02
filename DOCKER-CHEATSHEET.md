# 📝 Aide-Mémoire Docker Compose

## Commandes de Base

### Démarrage
```powershell
# Démarrer tous les services
docker compose up

# Démarrer en arrière-plan (detached)
docker compose up -d

# Démarrer uniquement certains services
docker compose up frontend db1 db2

# Démarrer avec rebuild
docker compose up --build
```

### Arrêt
```powershell
# Arrêter les services (CTRL+C si au premier plan)
docker compose down

# Arrêter et supprimer les volumes (⚠️ perte de données)
docker compose down -v

# Arrêter et supprimer les images
docker compose down --rmi all
```

### Gestion des Services
```powershell
# Voir l'état des services
docker compose ps

# Voir tous les services (même arrêtés)
docker compose ps -a

# Redémarrer un service
docker compose restart frontend

# Arrêter un service
docker compose stop frontend

# Démarrer un service arrêté
docker compose start frontend
```

### Build
```powershell
# Builder toutes les images
docker compose build

# Builder un service spécifique
docker compose build frontend

# Builder sans utiliser le cache
docker compose build --no-cache frontend

# Pull des images depuis le registry
docker compose pull
```

### Logs
```powershell
# Voir les logs de tous les services
docker compose logs

# Voir les logs en temps réel
docker compose logs -f

# Logs d'un service spécifique
docker compose logs frontend

# Logs avec timestamp
docker compose logs -t frontend

# Limiter le nombre de lignes
docker compose logs --tail=50 frontend
```

### Exécution de Commandes
```powershell
# Exécuter une commande dans un conteneur en cours
docker compose exec frontend sh

# Exécuter une commande ponctuelle
docker compose exec frontend npm --version

# Créer un nouveau conteneur pour exécuter une commande
docker compose run frontend npm install
```

### Gestion des Volumes
```powershell
# Lister les volumes
docker volume ls

# Inspecter un volume
docker volume inspect team-02_api1-db-data

# Supprimer un volume (service doit être arrêté)
docker volume rm team-02_api1-db-data

# Nettoyer tous les volumes non utilisés
docker volume prune
```

### Gestion des Réseaux
```powershell
# Lister les réseaux
docker network ls

# Inspecter un réseau (voir les conteneurs connectés)
docker network inspect team-02_frontend-net

# Supprimer un réseau (doit être vide)
docker network rm team-02_frontend-net

# Nettoyer les réseaux non utilisés
docker network prune
```

### Monitoring
```powershell
# Voir l'utilisation des ressources
docker stats

# Stats d'un service spécifique
docker stats team-02-frontend-1

# Voir les processus dans un conteneur
docker compose top frontend

# Inspecter un service
docker compose config
```

### Nettoyage
```powershell
# Nettoyer tout (conteneurs arrêtés, réseaux, images, cache)
docker system prune -a

# Nettoyer avec les volumes (⚠️ perte de données)
docker system prune -a --volumes

# Voir l'espace disque utilisé
docker system df
```

## Commandes Projet-Spécifiques

### Environnement de Développement
```powershell
# Setup complet dev
docker compose up frontend db1 db2

# Rebuild du frontend après modif Dockerfile
docker compose build frontend && docker compose up frontend db1 db2

# Voir les logs frontend en temps réel
docker compose logs -f frontend
```

### Tests et Validation
```powershell
# Tester l'isolation réseau
.\scripts\validate-network.ps1

# Tester le Hot Reload
.\scripts\test-hot-reload.ps1

# Voir les infos complètes
.\scripts\info.ps1
```

### Production
```powershell
# Build de l'image de production
docker build -f frontend/Dockerfile.prod -t frontend-prod ./frontend

# Lancer en production
docker run -p 80:80 --name frontend frontend-prod
```

### Dépannage
```powershell
# Restart complet
docker compose down
docker compose up --build

# Supprimer tout et recommencer
docker compose down -v
docker system prune -a
docker compose up --build

# Voir la config finale générée
docker compose config

# Valider le fichier docker-compose.yaml
docker compose config --quiet
```

## Variables d'Environnement

```powershell
# Utiliser un fichier .env
# Créer un fichier .env à la racine :
# NODE_ENV=development
# PORT=5173

# Lancer avec un fichier env spécifique
docker compose --env-file .env.dev up
```

## Flags Utiles

| Flag | Description |
|------|-------------|
| `-d` | Détaché (arrière-plan) |
| `-f` | Suivre les logs (follow) |
| `--build` | Rebuild avant de démarrer |
| `--no-cache` | Build sans cache |
| `-v` | Supprimer aussi les volumes |
| `--rmi all` | Supprimer les images |
| `-t` | Afficher les timestamps |
| `--tail=N` | Afficher N dernières lignes |

## Astuces

### Raccourcis PowerShell
```powershell
# Alias pour commandes fréquentes
Set-Alias dcu "docker compose up"
Set-Alias dcd "docker compose down"
Set-Alias dcl "docker compose logs"

# Dans votre profil PowerShell ($PROFILE)
```

### Commande One-Liner Utiles
```powershell
# Rebuild complet et démarrage
docker compose down; docker compose build --no-cache; docker compose up

# Logs des 5 dernières minutes
docker compose logs --since 5m

# Arrêter tous les conteneurs Docker
docker stop $(docker ps -aq)

# Supprimer tous les conteneurs
docker rm $(docker ps -aq)
```

## Références

- [Documentation Docker Compose](https://docs.docker.com/compose/)
- [QUICKSTART.md](QUICKSTART.md) - Guide de démarrage
- [README.md](README.md) - Documentation complète

---

**Astuce :** Ajoutez ce fichier à vos favoris pour un accès rapide ! 📌
