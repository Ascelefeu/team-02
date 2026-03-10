# ♻️ Plateforme de Recyclage de Quartier

**Projet Final - Conteneurisation d'Application Microservices**  
CDOF2 - Team-02

## 📋 Vue d'Ensemble

Application de microservices permettant aux utilisateurs d'un quartier de donner, échanger et suivre des objets à recycler. L'architecture est entièrement conteneurisée avec Docker et orchestrée via Docker Compose.

### 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │ (React + Vite)
│   Port 5173 │
└──────┬──────┘
       │ frontend-net
       ├────────────┬────────────┐
       ▼            ▼            ▼
   ┌───────┐   ┌───────┐   ┌───────┐
   │ API 1 │   │ API 2 │   │       │
   │ 3001  │   │ 3002  │   │       │
   └───┬───┘   └───┬───┘   └───────┘
       │           │
       │backend1   │backend2
       ▼           ▼
   ┌───────┐   ┌───────┐
   │  DB1  │   │  DB2  │
   │ Mongo │   │ Mongo │
   └───────┘   └───────┘
```

**Services :** Frontend (5173) → API1 (3001) + API2 (3002) → DB1 + DB2 (MongoDB)

**Isolation réseau :** Frontend **ne peut pas** accéder directement aux DBs.

## 🚀 Démarrage Rapide

**Prérequis :** Docker Desktop

```powershell
# Démarrer
docker compose up frontend db1 db2

# Accéder : http://localhost:5173

# Arrêter
docker compose down -v
```

## 🧪 Frontend (Étudiant 4)

**Stack :** React 19.2.0 + Vite 7.3.1 + Node 20-alpine

**Page unique** (`App.jsx`) affichant côte-à-côte :
- 📦 Annonces - `fetch('/api1/annonces')`
- 💬 Messages - `fetch('/api2/messages')`

**Hot Reload activé :** Bind mount + polling dans `vite.config.js`

## 📁 Structure du Projet

```
team-02/
├── docker-compose.yaml
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
│   └── Dockerfile
└── api2/
    └── Dockerfile
```

## 🔍 Commandes Utiles

```powershell
docker compose logs -f frontend          # Logs en temps réel
docker compose build frontend           # Rebuilder
docker compose restart frontend         # Redémarrer
docker compose ps                       # État des services
docker compose down -v                  # Tout nettoyer
```

## 🐛 Dépannage

**Frontend ne démarre pas :** `docker compose logs frontend` puis `docker compose build frontend`

**Hot Reload inactif :** `docker compose restart frontend` + Ctrl+F5 dans le navigateur

**Port 5173 occupé :** `netstat -ano | findstr :5173`

## 👥 Équipe

**Étudiant 4 :** Frontend & Orchestration | **Étudiants 2-3 :** API1 (annonces) + API2 (messages)

## 🎯 État d'Avancement

- [x] **Frontend** (Étudiant 4) : Docker, Hot Reload, React app, fetch APIs  
- [ ] **API1** (Étudiant 2) : Endpoints annonces + MongoDB
- [ ] **API2** (Étudiant 3) : Endpoints messages + MongoDB
- [ ] Intégration complète + tests

## 📝 License

Projet académique - CDOF2 Team 02