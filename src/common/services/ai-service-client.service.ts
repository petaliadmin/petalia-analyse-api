import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';

/**
 * Service pour communiquer avec les microservices IA Python (FastAPI)
 */
@Injectable()
export class AiServiceClient {
  private readonly logger = new Logger(AiServiceClient.name);
  private readonly diseaseDetectionClient: AxiosInstance;
  private readonly soilAnalysisClient: AxiosInstance;
  private readonly assistantClient: AxiosInstance;
  private readonly timeout: number;

  constructor(private configService: ConfigService) {
    this.timeout = this.configService.get<number>('AI_SERVICE_TIMEOUT', 30000);

    // Client pour la détection de maladies
    this.diseaseDetectionClient = axios.create({
      baseURL: this.configService.get<string>('AI_DISEASE_DETECTION_URL'),
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Client pour l'analyse du sol
    this.soilAnalysisClient = axios.create({
      baseURL: this.configService.get<string>('AI_SOIL_ANALYSIS_URL'),
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Client pour l'assistant IA
    this.assistantClient = axios.create({
      baseURL: this.configService.get<string>('AI_ASSISTANT_URL'),
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Détecter la maladie d'une culture à partir d'une image
   */
  async detectDisease(
    imagePath: string,
    cropType: string,
    cropAgeDays: number,
    region: string,
    symptoms: string[],
    language: string = 'fr',
  ): Promise<DiseaseDetectionResponse> {
    try {
      this.logger.log(`Calling AI disease detection for ${cropType}`);

      // Préparer les données multipart
      const formData = new FormData();
      formData.append('image', fs.createReadStream(imagePath));
      formData.append('crop_type', cropType);
      formData.append('crop_age_days', cropAgeDays.toString());
      formData.append('region', region);
      formData.append('symptoms', JSON.stringify(symptoms));
      formData.append('language', language);

      // Appel au microservice Python
      const response = await this.diseaseDetectionClient.post<DiseaseDetectionResponse>(
        '/detect',
        formData,
        {
          headers: {
            ...formData.getHeaders(),
          },
        },
      );

      this.logger.log(`Disease detection completed: ${response.data.disease_name}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling disease detection service: ${error.message}`);
      throw new HttpException(
        'Service IA de détection de maladies indisponible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Analyser les données du sol
   */
  async analyzeSoil(soilData: SoilAnalysisRequest): Promise<SoilAnalysisResponse> {
    try {
      this.logger.log(`Calling AI soil analysis service`);

      const response = await this.soilAnalysisClient.post<SoilAnalysisResponse>(
        '/analyze',
        soilData,
      );

      this.logger.log(`Soil analysis completed`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling soil analysis service: ${error.message}`);
      throw new HttpException(
        'Service IA d\'analyse du sol indisponible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  /**
   * Obtenir une réponse de l'assistant agricole
   */
  async askAssistant(question: string, language: string = 'fr', context?: string): Promise<AssistantResponse> {
    try {
      this.logger.log(`Calling AI assistant service`);

      const response = await this.assistantClient.post<AssistantResponse>('/ask', {
        question,
        language,
        context,
      });

      this.logger.log(`Assistant response generated`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error calling assistant service: ${error.message}`);
      throw new HttpException(
        'Service IA assistant indisponible',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}

/**
 * Interfaces pour les réponses des services IA
 */
export interface DiseaseDetectionResponse {
  disease_name: string;
  disease_name_local?: string;
  confidence: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendations: Array<{
    type: string;
    title: string;
    description: string;
    priority: number;
    audio_text?: string;
  }>;
  alternative_diseases?: Array<{
    name: string;
    confidence: number;
  }>;
  model_version?: string;
  processing_time?: number;
}

export interface SoilAnalysisRequest {
  ph: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  temperature: number;
  humidity: number;
  region: string;
  crop_type?: string;
  language?: string;
}

export interface SoilAnalysisResponse {
  soil_quality: 'poor' | 'fair' | 'good' | 'excellent';
  recommendations: Array<{
    type: string;
    description: string;
    priority: number;
  }>;
  suitable_crops: string[];
  fertilizer_needs: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
}

export interface AssistantResponse {
  answer: string;
  audio_text?: string;
  related_topics?: string[];
  confidence?: number;
}
