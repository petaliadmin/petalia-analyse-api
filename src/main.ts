import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import compression = require('compression');
import helmet from 'helmet';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';

const server = express();

/**
 * Bootstrap de l'application NestJS
 * Point d'entrée principal du backend AgriTech
 */
async function bootstrap() {
  // Créer l'application NestJS
  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Configuration depuis les variables d'environnement
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 3000);
  const apiPrefix = configService.get<string>('API_PREFIX', 'api/v1');
  const corsOrigins = configService.get<string>('CORS_ORIGINS', '*').split(',');

  // Préfixe global pour toutes les routes
  app.setGlobalPrefix(apiPrefix);

  // Validation globale avec class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Supprimer les propriétés non déclarées
      forbidNonWhitelisted: true, // Erreur si propriétés non déclarées
      transform: true, // Transformer automatiquement les types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Sécurité
  app.use(helmet()); // Protection headers HTTP
  app.use(compression()); // Compression gzip

  // CORS - Autoriser les requêtes cross-origin
  app.enableCors({
    origin: corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Documentation Swagger
  const config = new DocumentBuilder()
    .setTitle('AgriTech Africa API')
    .setDescription(
      'API REST pour la plateforme AgriTech - Diagnostic IA des maladies des cultures',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentification et autorisation')
    .addTag('users', 'Gestion des utilisateurs et agriculteurs')
    .addTag('diagnosis', 'Diagnostic des maladies des cultures')
    .addTag('soil', 'Analyse des données du sol')
    .addTag('assistant', 'Assistant agricole IA')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT pour authentification',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.init();

  return app;
}

// For local development
if (process.env.NODE_ENV !== 'production') {
  bootstrap().then(async (app) => {
    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT', 3000);
    await app.listen(port);

    console.log(`
    AgriTech Backend is running!
    Server: http://localhost:${port}
    API Docs: http://localhost:${port}/api/docs
    Environment: ${configService.get('NODE_ENV')}
    API Prefix: /${configService.get<string>('API_PREFIX', 'api/v1')}
  `);
  });
}

// For Vercel serverless
export default bootstrap().then(() => server);
