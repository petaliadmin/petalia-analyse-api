# 🌾 AgriTech Backend - NestJS API Gateway

Backend NestJS servant de passerelle API entre l'application mobile Flutter et les microservices IA Python pour la plateforme AgriTech Africa.

## 📋 Table des matières

- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#️-configuration)
- [API Documentation](#-api-documentation)
- [Développement](#-développement)
- [Déploiement](#-déploiement)

## ✨ Fonctionnalités

### Endpoints principaux

#### 🔬 Diagnostic de maladies
- **POST** `/api/v1/diagnosis/crop-disease` - Diagnostic avec upload d'image
- **GET** `/api/v1/diagnosis/history` - Historique des diagnostics
- **GET** `/api/v1/diagnosis/:id` - Détails d'un diagnostic
- **GET** `/api/v1/diagnosis/stats/overview` - Statistiques

#### 🌱 Analyse du sol
- **POST** `/api/v1/soil/analyze` - Analyse des données NPK, pH, humidité

#### 💬 Assistant agricole IA
- **POST** `/api/v1/assistant/ask` - Poser une question à l'assistant

#### 👤 Utilisateurs (À venir)
- Authentification JWT
- Gestion des profils agriculteurs
- Gestion des parcelles

## 🏗️ Architecture

### Stack technique

| Technologie | Version | Usage |
|------------|---------|-------|
| NestJS | 10.x | Framework backend |
| MongoDB | 7.0 | Base de données NoSQL |
| Mongoose | 8.x | ODM pour MongoDB |
| JWT | 10.x | Authentification |
| Swagger | 7.x | Documentation API |
| Multer | 1.4 | Upload de fichiers |
| Axios | 1.6 | Client HTTP vers IA |

### Architecture modulaire

```
src/
├── auth/                    # Authentification JWT
│   ├── guards/
│   └── strategies/
│
├── users/                   # Gestion utilisateurs
│   ├── schemas/
│   ├── services/
│   └── controllers/
│
├── diagnosis/               # Diagnostic maladies
│   ├── schemas/             # Schéma MongoDB
│   ├── dto/                 # Validation des données
│   ├── services/            # Logique métier
│   └── controllers/         # Routes API
│
├── soil/                    # Analyse du sol
│   ├── dto/
│   ├── services/
│   └── controllers/
│
├── assistant/               # Assistant IA
│   ├── dto/
│   ├── services/
│   └── controllers/
│
├── common/                  # Code partagé
│   ├── services/
│   │   └── ai-service-client.service.ts  # Client vers microservices Python
│   ├── guards/
│   ├── interceptors/
│   └── filters/
│
├── app.module.ts           # Module principal
└── main.ts                 # Point d'entrée
```

## 🚀 Installation

### Prérequis

- Node.js 20+
- MongoDB 7.0+ (ou Docker)
- npm ou yarn

### Installation locale

```bash
# 1. Cloner le projet
cd agritech_backend

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos configurations

# 4. Lancer MongoDB (via Docker)
docker-compose up -d mongodb

# 5. Démarrer le serveur en mode développement
npm run start:dev
```

L'API sera accessible sur `http://localhost:3000`

Documentation Swagger : `http://localhost:3000/api/docs`

## ⚙️ Configuration

### Variables d'environnement (.env)

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# MongoDB
MONGODB_URI=mongodb://localhost:27017/agritech
MONGODB_USER=agritech_user
MONGODB_PASSWORD=agritech_password

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRATION=7d

# Upload
UPLOAD_DESTINATION=./uploads
MAX_FILE_SIZE=5242880  # 5 MB
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg

# AI Services (Python FastAPI)
AI_DISEASE_DETECTION_URL=http://localhost:8001
AI_SOIL_ANALYSIS_URL=http://localhost:8002
AI_ASSISTANT_URL=http://localhost:8003
AI_SERVICE_TIMEOUT=30000

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:4200
```

## 📚 API Documentation

### Documentation interactive Swagger

Accédez à la documentation complète via Swagger UI :

```
http://localhost:3000/api/docs
```

### Exemples de requêtes

#### 1. Diagnostic de maladie

```bash
curl -X POST http://localhost:3000/api/v1/diagnosis/crop-disease \
  -F "image=@/path/to/image.jpg" \
  -F "crop_type=Mil (Souna)" \
  -F "crop_age_days=45" \
  -F "region=Thiès" \
  -F "symptoms=Taches jaunes sur feuilles,Feuilles sèches" \
  -F "language=fr"
```

Réponse :
```json
{
  "id": "507f1f77bcf86cd799439011",
  "diseaseName": "Mildiou",
  "diseaseNameLocal": "Mildiou (Wolof: ...)",
  "confidence": 0.92,
  "severity": "medium",
  "description": "Le mildiou est une maladie fongique...",
  "imageUrl": "/uploads/image-1234567890.jpg",
  "recommendations": [
    {
      "type": "treatment",
      "title": "Traitement fongicide",
      "description": "Appliquer un fongicide à base de cuivre...",
      "priority": 1,
      "audioText": "Appliquez un fongicide à base de cuivre..."
    }
  ],
  "createdAt": "2024-02-07T10:30:00Z"
}
```

#### 2. Analyse du sol

```bash
curl -X POST http://localhost:3000/api/v1/soil/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "ph": 6.5,
    "nitrogen": 45,
    "phosphorus": 30,
    "potassium": 120,
    "temperature": 28,
    "humidity": 35,
    "region": "Thiès",
    "cropType": "Maïs",
    "language": "fr"
  }'
```

#### 3. Assistant IA

```bash
curl -X POST http://localhost:3000/api/v1/assistant/ask \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Comment traiter les taches jaunes sur mon mil ?",
    "language": "fr",
    "context": "Culture: Mil, Région: Thiès"
  }'
```

Réponse :
```json
{
  "answer": "Les taches jaunes sur le mil peuvent être causées par...",
  "audioText": "Les taches jaunes sont souvent dues à...",
  "relatedTopics": ["Fertilisation", "Irrigation", "Maladies fongiques"]
}
```

## 💻 Développement

### Scripts disponibles

```bash
# Développement
npm run start:dev        # Démarrer avec hot-reload
npm run start:debug      # Démarrer avec debugger

# Production
npm run build            # Build de production
npm run start:prod       # Lancer en production

# Tests
npm run test             # Tests unitaires
npm run test:watch       # Tests en mode watch
npm run test:cov         # Couverture de code
npm run test:e2e         # Tests end-to-end

# Qualité du code
npm run lint             # Linter
npm run format           # Formatter avec Prettier
```

### Ajouter un nouveau module

```bash
# Générer un module complet
nest generate resource nom-du-module

# Générer uniquement un contrôleur
nest generate controller nom-du-module

# Générer uniquement un service
nest generate service nom-du-module
```

### Structure d'un module

```typescript
// nom-du-module.module.ts
import { Module } from '@nestjs/common';
import { NomDuModuleController } from './controllers/nom-du-module.controller';
import { NomDuModuleService } from './services/nom-du-module.service';

@Module({
  imports: [],
  controllers: [NomDuModuleController],
  providers: [NomDuModuleService],
  exports: [NomDuModuleService],
})
export class NomDuModuleModule {}
```

## 🐳 Déploiement

### Docker

#### Build de l'image

```bash
docker build -t agritech-backend:latest .
```

#### Lancer avec Docker Compose

```bash
# Lancer tous les services (MongoDB + Backend + AI services)
docker-compose up -d

# Voir les logs
docker-compose logs -f backend

# Arrêter tous les services
docker-compose down
```

### Déploiement sur Cloud

#### Variables d'environnement de production

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/agritech
JWT_SECRET=your-very-secure-production-secret
AI_DISEASE_DETECTION_URL=https://ai-disease.agritech.com
AI_SOIL_ANALYSIS_URL=https://ai-soil.agritech.com
AI_ASSISTANT_URL=https://ai-assistant.agritech.com
```

#### Checklist de déploiement

- [ ] Configurer les variables d'environnement
- [ ] Sécuriser JWT_SECRET
- [ ] Configurer CORS avec les domaines autorisés
- [ ] Activer HTTPS
- [ ] Configurer les limites de rate limiting
- [ ] Mettre en place les backups MongoDB
- [ ] Configurer les logs (Sentry, CloudWatch, etc.)
- [ ] Activer le monitoring (Prometheus, Grafana)

## 🔒 Sécurité

### Bonnes pratiques implémentées

✅ **Validation des données** - class-validator sur tous les DTOs  
✅ **Rate limiting** - Protection contre les attaques DDoS  
✅ **Helmet** - Protection des headers HTTP  
✅ **CORS** - Configuration stricte des origines autorisées  
✅ **Upload sécurisé** - Validation du type et taille des fichiers  
✅ **JWT** - Authentification stateless  

### À implémenter

- [ ] Authentification à 2 facteurs (2FA)
- [ ] Chiffrement des données sensibles
- [ ] Audit logging
- [ ] Protection CSRF
- [ ] Sanitization des inputs

## 📊 Monitoring

### Health Check

```bash
curl http://localhost:3000/api/v1/health
```

### Métriques

Les métriques peuvent être exposées via :
- Prometheus
- New Relic
- DataDog

## 🧪 Tests

### Tests unitaires

```bash
npm run test
```

### Tests d'intégration

```bash
npm run test:e2e
```

### Couverture de code

```bash
npm run test:cov
```

## 🤝 Contribution

Voir [CONTRIBUTING.md](CONTRIBUTING.md)

## 📄 Licence

MIT License

## 🔗 Liens utiles

- [Documentation NestJS](https://docs.nestjs.com)
- [MongoDB Documentation](https://www.mongodb.com/docs)
- [Swagger/OpenAPI](https://swagger.io/specification/)

---

**Développé avec ❤️ pour AgriTech Africa**
