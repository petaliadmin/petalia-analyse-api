import { Injectable, Logger } from '@nestjs/common';
import { AiServiceClient } from '../../common/services/ai-service-client.service';
import { SoilAnalysisDto, SoilAnalysisResponseDto } from '../dto/soil.dto';

/**
 * Service pour analyser les données du sol
 */
@Injectable()
export class SoilService {
  private readonly logger = new Logger(SoilService.name);

  constructor(private aiServiceClient: AiServiceClient) {}

  /**
   * Analyser les données du sol via le service IA
   */
  async analyzeSoil(soilAnalysisDto: SoilAnalysisDto): Promise<SoilAnalysisResponseDto> {
    try {
      this.logger.log(`Analyzing soil data`);

      // Appeler le service IA pour l'analyse
      const aiResponse = await this.aiServiceClient.analyzeSoil({
        ph: soilAnalysisDto.ph,
        nitrogen: soilAnalysisDto.nitrogen,
        phosphorus: soilAnalysisDto.phosphorus,
        potassium: soilAnalysisDto.potassium,
        temperature: soilAnalysisDto.temperature,
        humidity: soilAnalysisDto.humidity,
        region: soilAnalysisDto.region,
        crop_type: soilAnalysisDto.cropType,
        language: soilAnalysisDto.language || 'fr',
      });

      return {
        soilQuality: aiResponse.soil_quality,
        recommendations: aiResponse.recommendations,
        suitableCrops: aiResponse.suitable_crops,
        fertilizerNeeds: aiResponse.fertilizer_needs,
      };
    } catch (error) {
      this.logger.error(`Error analyzing soil: ${error.message}`);

      // Réponse de secours basique
      return this.getBasicRecommendations(soilAnalysisDto);
    }
  }

  /**
   * Recommandations de base si le service IA est indisponible
   */
  private getBasicRecommendations(soilData: SoilAnalysisDto): SoilAnalysisResponseDto {
    const { ph, nitrogen, phosphorus, potassium } = soilData;

    // Logique basique de recommandation
    let soilQuality: 'poor' | 'fair' | 'good' | 'excellent' = 'fair';
    const recommendations: Array<{ type: string; description: string; priority: number }> = [];

    // Évaluation du pH
    if (ph < 5.5 || ph > 7.5) {
      soilQuality = 'poor';
      recommendations.push({
        type: 'correction_ph',
        description:
          ph < 5.5
            ? 'Le sol est trop acide. Ajouter de la chaux pour augmenter le pH.'
            : 'Le sol est trop alcalin. Ajouter du soufre ou du compost.',
        priority: 1,
      });
    } else if (ph >= 6.0 && ph <= 7.0) {
      soilQuality = 'good';
    }

    // Évaluation NPK
    if (nitrogen < 30) {
      recommendations.push({
        type: 'fertilizer',
        description: 'Azote faible. Appliquer un engrais riche en azote (urée ou compost).',
        priority: 1,
      });
    }

    if (phosphorus < 20) {
      recommendations.push({
        type: 'fertilizer',
        description: 'Phosphore faible. Appliquer du phosphate naturel ou du fumier.',
        priority: 2,
      });
    }

    if (potassium < 80) {
      recommendations.push({
        type: 'fertilizer',
        description: 'Potassium faible. Utiliser de la cendre de bois ou du chlorure de potassium.',
        priority: 2,
      });
    }

    // Cultures adaptées selon le pH
    let suitableCrops: string[] = [];
    if (ph >= 6.0 && ph <= 7.0) {
      suitableCrops = ['Maïs', 'Tomate', 'Oignon', 'Haricot'];
    } else if (ph < 6.0) {
      suitableCrops = ['Manioc', 'Patate douce', 'Ananas'];
    } else {
      suitableCrops = ['Mil', 'Sorgho'];
    }

    return {
      soilQuality,
      recommendations,
      suitableCrops,
      fertilizerNeeds: {
        nitrogen: nitrogen < 30 ? 'Élevé' : nitrogen < 60 ? 'Moyen' : 'Faible',
        phosphorus: phosphorus < 20 ? 'Élevé' : phosphorus < 40 ? 'Moyen' : 'Faible',
        potassium: potassium < 80 ? 'Élevé' : potassium < 150 ? 'Moyen' : 'Faible',
      },
    };
  }
}
