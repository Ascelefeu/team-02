# ♻️ Plateforme de Recyclage de Quartier

**Projet Final - Conteneurisation d'Application Microservices**  
CDOF2 - Team-02

## 📋 Vue d'Ensemble

Application de microservices permettant aux utilisateurs d'un quartier de donner, échanger et suivre des objets à recycler. L'architecture est entièrement conteneurisée avec Docker et orchestrée via Docker Compose.

## 🛠️ Stack Technologique

| Couche | Technologie | Version |
|--------|-------------|---------|
| Frontend | React + Vite | React 19.2, Vite 7.3 |
| Backend API 1 | FastAPI (Python) | 3.11 |
| Backend API 2 | FastAPI (Python) | 3.11 |
| Base de données | MongoDB | 8.2 |
| Queue / Cache | Redis | 7.2-alpine |
| Conteneurisation | Docker + Docker Compose | v2 |
| CI/CD | Gitea Actions + Trivy | — |
| Registry | Docker Hub | — |

### 🏗️ Architecture
```
┌─────────────┐
│   Frontend  │ (React + Vite)
│   Port 5173 │
└──────┬──────┘
       │ frontend-net
       ├────────────────────┐
       ▼                    ▼
   ┌───────┐           ┌───────┐
   │ API 1 │           │ API 2 │
   │ :8000 │           │ :8000 │
   └───┬───┘           └───┬───┘
       │ backend1-net       │ backend2-net
       ▼                    ▼
   ┌───────┐           ┌───────┐   ┌───────┐
   │  DB1  │           │  DB2  │   │ Redis │
   │ Mongo │           │ Mongo │   │  :6379│
   └───────┘           └───────┘   └───────┘
```

**Services :** Frontend (5173) → API1 (8000) + API2 (8001) → DB1 + DB2 (MongoDB)

**Isolation réseau :** Frontend **ne peut pas** accéder directement aux DBs.

## 🔧 Variables d'Environnement

| Variable | Service | Description | Valeur par défaut |
|----------|---------|-------------|-------------------|
| `MONGO_URL` | api1, api2 | Chaîne de connexion MongoDB | `mongodb://admin:password@db1:27017/` |
| `MONGO_DB_NAME` | api1, api2 | Nom de la base de données | `annonces` / `messagerie` |
| `JWT_SECRET` | api1, api2 | Clé secrète pour signer les JWT | à changer en production |
| `REDIS_URL` | api2 | Chaîne de connexion Redis | `redis://redis:6379` |
| `MONGO_INITDB_ROOT_USERNAME` | db1, db2 | Utilisateur root MongoDB | `admin` |
| `MONGO_INITDB_ROOT_PASSWORD` | db1, db2 | Mot de passe root MongoDB | à changer en production |

Copier `.env.example` vers `.env` et adapter les valeurs si nécessaire.

## 🚀 Démarrage Rapide

**Prérequis :** Docker Desktop
```bash
# Cloner le dépôt
git clone https://git.zohrabi.cloud/team-02/team-02.git
cd team-02

# Copier le fichier d'environnement
cp .env.example .env

# Démarrer tous les services
docker compose up --build

# Accéder : http://localhost:5173

# Arrêter (les données sont conservées)
docker compose down
```

## 🖼️ Démo

![Application screenshot](./docs/screenshot.png)

## 🧪 Frontend (Étudiant 4)

**Stack :** React 19.2.0 + Vite 7.3.1 + Node 20-alpine

**Page unique** (`App.jsx`) affichant côte-à-côte :
- 📦 Annonces - `fetch('/api1/annonces')`
- 💬 Messages - `fetch('/api2/messages')`

**Hot Reload activé :** Bind mount + polling dans `vite.config.js`

## 📁 Structure du Projet
```
team-02/
├── .gitea/workflows/ci.yaml   # Pipeline CI/CD
├── docker-compose.yaml
├── .env.example               # Template des variables d'environnement
├── frontend/
│   ├── Dockerfile              # Node 20-alpine
│   ├── vite.config.js          # Hot Reload config
│   ├── package.json
│   └── src/
│       ├── App.jsx             # Composant principal
│       ├── App.css             # Grid 2 colonnes
│       ├── index.css
│       └── main.jsx
├── api1/
│   ├── Dockerfile
│   └── src/
├── api2/
│   ├── Dockerfile
│   └── src/
├── README.md
└── AUTHORS.md
```

## 🔒 Preuve d'Isolation Réseau

Pour démontrer l'isolation lors de la présentation :
```bash
# Doit RÉUSSIR — frontend peut joindre api1
docker exec team-02-frontend-1 wget -qO- http://api1:8000/health

# Doit ÉCHOUER — frontend ne peut pas joindre db1 directement
docker exec team-02-frontend-1 wget -qO- http://db1:27017 --timeout=3
```

## 🔍 Commandes Utiles
```bash
docker compose logs -f frontend          # Logs en temps réel
docker compose build frontend            # Rebuilder
docker compose restart frontend          # Redémarrer
docker compose ps                        # État des services
docker compose down                      # Arrêter (données conservées)
docker compose down -v                   # Arrêter + supprimer les volumes
```

## 🐛 Dépannage

**Frontend ne démarre pas :** `docker compose logs frontend` puis `docker compose build frontend`

**Hot Reload inactif :** `docker compose restart frontend` + Ctrl+F5 dans le navigateur

**Port 5173 occupé :** `netstat -ano | findstr :5173`

## 👥 Équipe

Voir [AUTHORS.md](./AUTHORS.md)

## 🎯 État d'Avancement

- [x] **Frontend** (Étudiant 4) : Docker, Hot Reload, React app, fetch APIs
- [x] **API1** (Étudiant 2) : Endpoints annonces + MongoDB
- [x] **API2** (Étudiant 3) : Endpoints messages + MongoDB + Redis
- [x] CI/CD pipeline (Trivy + Docker Hub)
- [x] Intégration complète

## 📝 License

Projet académique - CDOF2 Team 02