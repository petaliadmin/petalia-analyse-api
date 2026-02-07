import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Diagnosis } from '../schemas/diagnosis.schema';
import { CreateDiagnosisDto, DiagnosisResponseDto, DiagnosisFilterDto } from '../dto/diagnosis.dto';
import { AiServiceClient } from '../../common/services/ai-service-client.service';

/**
 * Service pour gérer les diagnostics de maladies
 */
@Injectable()
export class DiagnosisService {
  private readonly logger = new Logger(DiagnosisService.name);

  constructor(
    @InjectModel(Diagnosis.name) private diagnosisModel: Model<Diagnosis>,
    private aiServiceClient: AiServiceClient,
  ) {}

  /**
   * Créer un nouveau diagnostic
   */
  async createDiagnosis(
    createDiagnosisDto: CreateDiagnosisDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<DiagnosisResponseDto> {
    try {
      this.logger.log(`Creating diagnosis for user ${userId}`);

      // Appeler le service IA pour détecter la maladie
      const aiResponse = await this.aiServiceClient.detectDisease(
        file.path,
        createDiagnosisDto.cropType,
        createDiagnosisDto.cropAgeDays,
        createDiagnosisDto.region,
        createDiagnosisDto.symptoms,
        createDiagnosisDto.language || 'fr',
      );

      // Créer l'entrée en base de données
      const diagnosis = new this.diagnosisModel({
        userId,
        cropType: createDiagnosisDto.cropType,
        cropAgeDays: createDiagnosisDto.cropAgeDays,
        region: createDiagnosisDto.region,
        symptoms: createDiagnosisDto.symptoms,
        imageUrl: `/uploads/${file.filename}`, // URL publique
        imagePath: file.path, // Chemin serveur
        diseaseName: aiResponse.disease_name,
        diseaseNameLocal: aiResponse.disease_name_local,
        confidence: aiResponse.confidence,
        severity: aiResponse.severity,
        description: aiResponse.description,
        recommendations: aiResponse.recommendations,
        language: createDiagnosisDto.language || 'fr',
        aiModelMetadata: {
          modelVersion: aiResponse.model_version,
          processingTime: aiResponse.processing_time,
          alternativeDiseases: aiResponse.alternative_diseases,
        },
        status: 'completed',
      });

      await diagnosis.save();

      this.logger.log(`Diagnosis created successfully: ${diagnosis._id}`);

      // Retourner le DTO de réponse
      return this.mapToResponseDto(diagnosis);
    } catch (error) {
      this.logger.error(`Error creating diagnosis: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtenir les diagnostics d'un utilisateur
   */
  async getUserDiagnoses(
    userId: string,
    filterDto: DiagnosisFilterDto,
  ): Promise<DiagnosisResponseDto[]> {
    const query: any = { userId };

    // Filtres optionnels
    if (filterDto.cropType) {
      query.cropType = filterDto.cropType;
    }
    if (filterDto.region) {
      query.region = filterDto.region;
    }

    const diagnoses = await this.diagnosisModel
      .find(query)
      .sort({ createdAt: -1 })
      .limit(filterDto.limit || 20)
      .skip(filterDto.offset || 0)
      .exec();

    return diagnoses.map((d) => this.mapToResponseDto(d));
  }

  /**
   * Obtenir un diagnostic par ID
   */
  async getDiagnosisById(id: string): Promise<DiagnosisResponseDto | null> {
    const diagnosis = await this.diagnosisModel.findById(id).exec();
    return diagnosis ? this.mapToResponseDto(diagnosis) : null;
  }

  /**
   * Obtenir des statistiques
   */
  async getStatistics(userId: string) {
    const totalDiagnoses = await this.diagnosisModel.countDocuments({ userId });

    const diseaseDistribution = await this.diagnosisModel.aggregate([
      { $match: { userId } },
      { $group: { _id: '$diseaseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const cropDistribution = await this.diagnosisModel.aggregate([
      { $match: { userId } },
      { $group: { _id: '$cropType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const avgConfidence = await this.diagnosisModel.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avgConfidence: { $avg: '$confidence' } } },
    ]);

    return {
      totalDiagnoses,
      diseaseDistribution,
      cropDistribution,
      averageConfidence: avgConfidence[0]?.avgConfidence || 0,
    };
  }

  /**
   * Mapper un document Mongoose vers un DTO
   */
  private mapToResponseDto(diagnosis: Diagnosis): DiagnosisResponseDto {
    return {
      id: diagnosis._id.toString(),
      diseaseName: diagnosis.diseaseName,
      diseaseNameLocal: diagnosis.diseaseNameLocal,
      confidence: diagnosis.confidence,
      severity: diagnosis.severity,
      description: diagnosis.description,
      imageUrl: diagnosis.imageUrl,
      recommendations: diagnosis.recommendations,
      createdAt: diagnosis.createdAt,
    };
  }
}
