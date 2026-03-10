# 🚀 Guide de Démarrage Rapide

## Installation et Premier Lancement

### 1. Prérequis
- Docker Desktop installé et démarré
- PowerShell (déjà installé sur Windows)
- Git (pour cloner le projet)

### 2. Démarrer l'Application

Ouvrez PowerShell dans le dossier du projet et exécutez :

```powershell
# Démarrer le frontend et les bases de données
docker compose up frontend db1 db2
```

**Première fois ?** Le build peut prendre 2-3 minutes pour télécharger les images et installer les dépendances.

### 3. Accéder à l'Application

Ouvrez votre navigateur sur : **http://localhost:5173**

Vous devriez voir la plateforme de recyclage avec :
- 📊 Un tableau de bord avec des statistiques
- 📦 Une liste d'annonces de recyclage
- 💬 Une messagerie

### 4. Tester le Hot Reload

1. Ouvrez `frontend/src/App.jsx` dans votre éditeur
2. Modifiez le titre (ligne ~12) : 
   ```jsx
   <h1>♻️ Plateforme de Recyclage de Quartier - TEST</h1>
   ```
3. Sauvegardez (Ctrl+S)
4. Observez le navigateur : il se recharge automatiquement ! 🔥

### 5. Arrêter l'Application

Dans le terminal PowerShell, appuyez sur `Ctrl+C`, puis :

```powershell
docker compose down
```

## Commandes Essentielles

### Voir les logs en temps réel
```powershell
docker compose logs -f frontend
```

### Redémarrer après une modification du Dockerfile
```powershell
docker compose down
docker compose build frontend
docker compose up frontend db1 db2
```

### Voir l'état des services
```powershell
docker compose ps
```

### Nettoyer complètement (supprime aussi les données)
```powershell
docker compose down -v
```

## Scripts Utiles

### Test du Hot Reload
```powershell
.\scripts\test-hot-reload.ps1
```

### Validation de l'isolation réseau
```powershell
.\scripts\validate-network.ps1
```

### Informations sur l'environnement
```powershell
.\scripts\info.ps1
```

## Problèmes Courants

### ❌ "Port 5173 already in use"

Solution :
```powershell
# Trouver et tuer le processus qui utilise le port
netstat -ano | findstr :5173
# Puis relancer
docker compose up frontend db1 db2
```

### ❌ "Cannot connect to localhost:5173"

Solutions :
1. Vérifier que Docker Desktop est démarré
2. Vérifier que le conteneur tourne :
   ```powershell
   docker compose ps
   ```
3. Voir les logs :
   ```powershell
   docker compose logs frontend
   ```

### ❌ Le Hot Reload ne fonctionne pas

Solutions :
1. Vérifier que le bind mount est configuré dans `docker-compose.yaml`
2. Relancer le conteneur :
   ```powershell
   docker compose restart frontend
   ```

## Architecture pour les Nouveaux

```
Frontend (React)
   ↓ frontend-net
API1 (Annonces)     API2 (Messages)
   ↓ backend1-net      ↓ backend2-net
DB1 (MongoDB)       DB2 (MongoDB)
```

**Important :** Les bases de données sont **isolées** du frontend pour la sécurité.

## Mode Développement Actuel

⚠️ **Les données affichées sont simulées** (fichier `frontend/src/mockData.js`)

Lorsque les APIs backend seront prêtes, nous remplacerons les données mockées par de vrais appels HTTP.

## Prochaines Étapes

1. ✅ Familiarisez-vous avec l'interface
2. ✅ Testez le Hot Reload en modifiant le code
3. ✅ Explorez les composants dans `frontend/src/components/`
4. ⏳ Attendez l'intégration des APIs backend
5. ⏳ Testez l'application complète

## Besoin d'Aide ?

- Consultez [README.md](README.md) pour la documentation complète
- Consultez [frontend/DEPLOYMENT.md](frontend/DEPLOYMENT.md) pour le déploiement
- Vérifiez les logs : `docker compose logs frontend`

---

**Bon développement ! 🚀**
