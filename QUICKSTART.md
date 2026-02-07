# 🚀 Démarrage Rapide - AgriTech Backend

## Installation en 5 minutes

### Méthode 1 : Docker (Recommandé)

```bash
# 1. Naviguer dans le dossier
cd agritech_backend

# 2. Copier la configuration
cp .env.example .env

# 3. Lancer tous les services avec Docker
docker-compose up -d

# 4. Vérifier que tout fonctionne
curl http://localhost:3000/api/docs
```

✅ Backend NestJS : http://localhost:3000  
✅ Documentation API : http://localhost:3000/api/docs  
✅ MongoDB Admin : http://localhost:8081  

### Méthode 2 : Installation locale

```bash
# 1. Naviguer dans le dossier
cd agritech_backend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env

# 4. Lancer MongoDB (nécessaire)
# Option A : Via Docker
docker run -d -p 27017:27017 --name agritech-mongo mongo:7.0

# Option B : MongoDB installé localement
# mongod --dbpath /path/to/data

# 5. Démarrer le serveur
npm run start:dev
```

## Test rapide

### 1. Vérifier que l'API fonctionne

```bash
curl http://localhost:3000/api/v1/health
```

### 2. Tester le diagnostic (simulation)

```bash
# Créer un fichier test.jpg dans le dossier courant
# Puis :

curl -X POST http://localhost:3000/api/v1/diagnosis/crop-disease \
  -F "image=@test.jpg" \
  -F "crop_type=Mil" \
  -F "crop_age_days=45" \
  -F "region=Thiès" \
  -F "symptoms=Taches jaunes,Feuilles sèches" \
  -F "language=fr"
```

### 3. Tester l'assistant

```bash
curl -X POST http://localhost:3000/api/v1/assistant/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Comment arroser le mil ?",
    "language": "fr"
  }'
```

## Configuration des services IA

Par défaut, le backend attend les services IA Python sur :

- **Disease Detection** : http://localhost:8001
- **Soil Analysis** : http://localhost:8002
- **Assistant** : http://localhost:8003

Si ces services ne sont pas disponibles, le backend utilise des réponses de secours (fallback).

Pour les configurer, modifier dans `.env` :

```env
AI_DISEASE_DETECTION_URL=http://localhost:8001
AI_SOIL_ANALYSIS_URL=http://localhost:8002
AI_ASSISTANT_URL=http://localhost:8003
```

## Structure des dossiers

```
agritech_backend/
├── src/
│   ├── diagnosis/          # Diagnostic des maladies
│   ├── soil/              # Analyse du sol
│   ├── assistant/         # Assistant IA
│   ├── users/             # Gestion utilisateurs
│   ├── auth/              # Authentification
│   ├── common/            # Code partagé
│   │   └── services/
│   │       └── ai-service-client.service.ts  # Client vers IA Python
│   ├── app.module.ts      # Module principal
│   └── main.ts            # Point d'entrée
│
├── uploads/               # Images uploadées
├── docker-compose.yml     # Configuration Docker
├── Dockerfile             # Image Docker
├── .env.example          # Configuration exemple
└── package.json          # Dépendances
```

## Commandes utiles

```bash
# Développement
npm run start:dev          # Serveur avec hot-reload

# Production
npm run build              # Build
npm run start:prod         # Lancer en prod

# Docker
docker-compose up -d       # Démarrer tous les services
docker-compose logs -f     # Voir les logs
docker-compose down        # Arrêter tous les services

# Base de données
# Accéder à MongoDB via Mongo Express
open http://localhost:8081
```

## Problèmes courants

### Port 3000 déjà utilisé

```bash
# Changer le port dans .env
PORT=3001
```

### MongoDB connection refused

```bash
# Vérifier que MongoDB tourne
docker ps | grep mongo

# Ou lancer MongoDB
docker-compose up -d mongodb
```

### Images non uploadées

```bash
# Créer le dossier uploads
mkdir uploads
chmod 777 uploads
```

## Prochaines étapes

1. ✅ Vérifier que l'API fonctionne
2. 🔧 Configurer les services IA Python (Projet 3)
3. 📱 Connecter l'application mobile Flutter
4. 🔐 Implémenter l'authentification JWT
5. 📊 Ajouter le monitoring

---

**Besoin d'aide ?** Consulter le README.md complet
