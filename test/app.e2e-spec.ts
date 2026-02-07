import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * Tests E2E pour l'API AgriTech
 */
describe('AgriTech API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    // Configuration identique à main.ts
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Assistant Module', () => {
    it('/api/v1/assistant/ask (POST) - should return an answer', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/assistant/ask')
        .send({
          question: 'Comment arroser le mil ?',
          language: 'fr',
        })
        .expect(200);

      expect(response.body).toHaveProperty('answer');
      expect(response.body.answer).toBeDefined();
    });

    it('/api/v1/assistant/ask (POST) - should reject invalid data', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/assistant/ask')
        .send({
          // Question manquante
          language: 'fr',
        })
        .expect(400);
    });
  });

  describe('Soil Analysis Module', () => {
    it('/api/v1/soil/analyze (POST) - should analyze soil data', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/soil/analyze')
        .send({
          ph: 6.5,
          nitrogen: 45,
          phosphorus: 30,
          potassium: 120,
          temperature: 28,
          humidity: 35,
          region: 'Thiès',
          cropType: 'Maïs',
          language: 'fr',
        })
        .expect(200);

      expect(response.body).toHaveProperty('soilQuality');
      expect(response.body).toHaveProperty('recommendations');
      expect(response.body).toHaveProperty('suitableCrops');
    });
  });

  describe('Diagnosis Module', () => {
    it('/api/v1/diagnosis/history (GET) - should return diagnosis history', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/diagnosis/history')
        .query({ limit: 10, offset: 0 })
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });
});
