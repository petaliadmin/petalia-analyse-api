# 🏗️ Architecture du Backend AgriTech

## Vue d'ensemble

Le backend AgriTech est construit avec NestJS et suit une architecture modulaire, servant de **passerelle API (Gateway)** entre l'application mobile Flutter et les microservices IA Python.

## Schéma d'architecture

```
┌─────────────────────┐
│  Flutter Mobile App │
│   (Android/iOS)     │
└──────────┬──────────┘
           │ HTTP/REST
           ▼
┌──────────────────────────────────────┐
│     NestJS API Gateway (Port 3000)   │
│                                      │
│  ┌────────────┐  ┌────────────┐    │
│  │ Diagnosis  │  │   Soil     │    │
│  │  Module    │  │  Module    │    │
│  └────────────┘  └────────────┘    │
│                                      │
│  ┌────────────┐  ┌────────────┐    │
│  │ Assistant  │  │   Users    │    │
│  │  Module    │  │  Module    │    │
│  └────────────┘  └────────────┘    │
│                                      │
│  ┌──────────────────────────────┐  │
│  │  AI Service Client (Common)   │  │
│  └──────────────────────────────┘  │
└───────────┬─────────────┬──────────┘
            │             │
            │             ▼
            │   ┌─────────────────┐
            │   │   MongoDB 7.0   │
            │   │  (NoSQL DB)     │
            │   └─────────────────┘
            │
            ▼
┌───────────────────────────────────────┐
│    Python AI Microservices (FastAPI)  │
│                                        │
│  ┌─────────────┐  ┌─────────────┐   │
│  │  Disease    │  │    Soil     │   │
│  │ Detection   │  │  Analysis   │   │
│  │ (Port 8001) │  │ (Port 8002) │   │
│  └─────────────┘  └─────────────┘   │
│                                        │
│  ┌─────────────┐                     │
│  │  Assistant  │                     │
│  │    AI       │                     │
│  │ (Port 8003) │                     │
│  └─────────────┘                     │
└───────────────────────────────────────┘
```

## Principes architecturaux

### 1. Séparation des responsabilités

- **NestJS** : Logique métier, validation, authentification, persistence
- **Python IA** : Traitement ML/IA, analyse d'images, NLP
- **MongoDB** : Stockage des données structurées

### 2. Architecture modulaire

Chaque fonctionnalité est un module NestJS indépendant :

```
Module
├── controllers/    # Routes HTTP
├── services/       # Logique métier
├── dto/           # Validation des données
├── schemas/       # Modèles MongoDB
└── interfaces/    # Types TypeScript
```

### 3. Client IA centralisé

Le service `AiServiceClient` dans `common/services/` centralise toutes les communications avec les microservices Python :

```typescript
@Injectable()
export class AiServiceClient {
  async detectDisease(...)    // → http://localhost:8001
  async analyzeSoil(...)       // → http://localhost:8002
  async askAssistant(...)      // → http://localhost:8003
}
```

**Avantages** :
- Point unique pour gérer les erreurs
- Timeouts et retries centralisés
- Fallback automatique si service IA indisponible
- Facilite les tests (mock du client)

## Flow de données - Diagnostic

```
1. Mobile → POST /api/v1/diagnosis/crop-disease
   ↓
2. DiagnosisController
   - Valide les données (DTO)
   - Upload de l'image (Multer)
   ↓
3. DiagnosisService
   - Appelle AiServiceClient.detectDisease()
   ↓
4. AiServiceClient
   - HTTP POST vers Python (FastAPI)
   - Envoie l'image en multipart/form-data
   ↓
5. Python IA Service
   - Traite l'image avec CNN
   - Retourne le diagnostic JSON
   ↓
6. DiagnosisService
   - Sauvegarde dans MongoDB
   - Mappe vers DiagnosisResponseDto
   ↓
7. DiagnosisController
   - Retourne JSON au mobile
```

## Modèles de données

### User (MongoDB)

```typescript
{
  _id: ObjectId,
  phone: string,              // Identifiant unique
  password: string,           // Hash bcrypt
  name: string,
  language: 'fr' | 'wo' | 'ff',
  region: string,
  role: 'farmer' | 'agent' | 'admin',
  settings: {
    ttsEnabled: boolean,
    notifications: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Diagnosis (MongoDB)

```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Ref → User
  cropType: string,
  cropAgeDays: number,
  region: string,
  symptoms: string[],
  imageUrl: string,
  imagePath: string,
  diseaseName: string,
  diseaseNameLocal: string,
  confidence: number,         // 0-1
  severity: 'low' | 'medium' | 'high',
  description: string,
  recommendations: [
    {
      type: string,
      title: string,
      description: string,
      priority: number,       // 1-3
      audioText: string
    }
  ],
  language: string,
  status: 'pending' | 'completed' | 'failed',
  createdAt: Date,
  updatedAt: Date
}
```

## Sécurité

### Validation des données

Tous les endpoints utilisent `class-validator` via les DTOs :

```typescript
export class CreateDiagnosisDto {
  @IsString()
  @MaxLength(100)
  cropType: string;

  @IsNumber()
  @Min(1)
  @Max(365)
  cropAgeDays: number;
  
  // ...
}
```

### Upload sécurisé

Configuration Multer avec :
- Limite de taille : 5 MB
- Types autorisés : JPEG, PNG
- Noms de fichiers uniques (UUID)

### Rate Limiting

Protection contre les abus avec `@nestjs/throttler` :
- 100 requêtes / minute par IP

### Headers de sécurité

Helmet.js pour protéger contre :
- XSS
- Clickjacking
- MIME sniffing

## Gestion des erreurs

### Stratégie de fallback

Si un service IA Python est indisponible :

```typescript
try {
  return await this.aiServiceClient.askAssistant(question);
} catch (error) {
  // Retourne une réponse de base
  return this.getFallbackResponse(question);
}
```

### Codes HTTP

- `200` : Succès
- `201` : Ressource créée
- `400` : Données invalides
- `401` : Non authentifié
- `404` : Ressource non trouvée
- `503` : Service IA indisponible

## Performance

### Optimisations MongoDB

Index sur les champs fréquemment requêtés :

```typescript
DiagnosisSchema.index({ userId: 1, createdAt: -1 });
DiagnosisSchema.index({ cropType: 1 });
DiagnosisSchema.index({ region: 1 });
```

### Compression

Responses HTTP compressées avec gzip via `compression`.

### Caching (À venir)

- Redis pour cacher les diagnostics fréquents
- Cache des réponses de l'assistant

## Monitoring et Logs

### Logs structurés

```typescript
this.logger.log(`Creating diagnosis for user ${userId}`);
this.logger.error(`Error calling AI service: ${error.message}`);
```

### Healthcheck

Endpoint de santé pour monitoring :

```bash
GET /api/v1/health
```

## Évolution future

### Version 2.0

1. **Authentification complète**
   - JWT avec refresh tokens
   - OAuth2 (Google, Facebook)
   - 2FA par SMS

2. **Websockets**
   - Notifications en temps réel
   - Chat avec l'assistant en temps réel

3. **Microservices avancés**
   - Service de notifications (Email, SMS, Push)
   - Service de géolocalisation
   - Service météo

4. **Analytics**
   - Tableau de bord admin
   - Statistiques agrégées
   - Rapports PDF automatiques

5. **GraphQL**
   - Alternative à REST
   - Requêtes optimisées

## Bonnes pratiques suivies

✅ **SOLID Principles**  
✅ **Dependency Injection**  
✅ **Repository Pattern** (Mongoose Models)  
✅ **DTO Pattern** (Data Transfer Objects)  
✅ **Separation of Concerns**  
✅ **Error Handling Strategy**  
✅ **API Documentation** (Swagger)  
✅ **Type Safety** (TypeScript)  

---

**Documentation maintenue par l'équipe Backend AgriTech**
