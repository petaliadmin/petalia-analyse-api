import { Injectable, Logger } from '@nestjs/common';
import { AiServiceClient } from '../../common/services/ai-service-client.service';
import { AssistantResponseDto } from '../dto/assistant.dto';

/**
 * Service pour gérer l'assistant agricole IA
 */
@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);

  constructor(private aiServiceClient: AiServiceClient) {}

  /**
   * Obtenir une réponse de l'assistant IA
   */
  async getAnswer(
    question: string,
    language: string = 'fr',
    context?: string,
  ): Promise<AssistantResponseDto> {
    try {
      this.logger.log(`Getting answer for question in ${language}`);

      // Appeler le service IA assistant
      const aiResponse = await this.aiServiceClient.askAssistant(
        question,
        language,
        context,
      );

      return {
        answer: aiResponse.answer,
        audioText: aiResponse.audio_text,
        relatedTopics: aiResponse.related_topics,
      };
    } catch (error) {
      this.logger.error(`Error getting assistant answer: ${error.message}`);

      // Réponse de secours en cas d'erreur
      return this.getFallbackResponse(question, language);
    }
  }

  /**
   * Réponse de secours si le service IA est indisponible
   */
  private getFallbackResponse(question: string, language: string): AssistantResponseDto {
    const lowerQuestion = question.toLowerCase();

    // Réponses basiques selon la langue
    if (language === 'fr') {
      if (lowerQuestion.includes('arrosage') || lowerQuestion.includes('eau')) {
        return {
          answer:
            'Pour l\'arrosage, il est recommandé d\'arroser tôt le matin ou en fin de journée. La quantité dépend du type de culture et du sol. En général, 20-30 litres par m² par semaine pour la plupart des cultures.',
          audioText:
            'Arrosez tôt le matin ou en fin de journée. 20 à 30 litres par mètre carré par semaine.',
        };
      }

      if (lowerQuestion.includes('engrais') || lowerQuestion.includes('fertilisant')) {
        return {
          answer:
            'Les engrais organiques comme le compost ou le fumier sont excellents. Pour les cultures, l\'engrais NPK (azote, phosphore, potassium) est souvent utilisé. Appliquez avant la saison des pluies.',
          audioText:
            'Utilisez du compost ou du fumier. L\'engrais NPK est recommandé avant la saison des pluies.',
        };
      }

      if (lowerQuestion.includes('mil') || lowerQuestion.includes('souna')) {
        return {
          answer:
            'Le mil (souna) nécessite un sol bien drainé et peu d\'eau. Semez au début de la saison des pluies. Récolte après 90-120 jours. Résiste bien à la sécheresse.',
          audioText:
            'Le mil préfère les sols drainés. Semez au début de la saison des pluies. Récolte après 3 à 4 mois.',
        };
      }

      return {
        answer:
          'Je suis désolé, le service IA est temporairement indisponible. Veuillez réessayer plus tard ou reformuler votre question.',
        audioText:
          'Service temporairement indisponible. Veuillez réessayer plus tard.',
      };
    }

    // Wolof
    if (language === 'wo') {
      return {
        answer:
          'Damay jàppale, service IA bi dafa amul. Jëm tay ndax nga laaj ci mbind.',
        audioText: 'Service bi amul. Jëm tay.',
      };
    }

    // Pulaar
    if (language === 'ff') {
      return {
        answer: 'Mi jaabii-mo. Service IA ngonɗii. Fuɗɗito kadi.',
        audioText: 'Service ngonɗii. Fuɗɗito kadi.',
      };
    }

    return {
      answer: 'Service temporairement indisponible.',
    };
  }
}
