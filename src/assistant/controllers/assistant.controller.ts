import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AssistantService } from '../services/assistant.service';
import { AskAssistantDto, AssistantResponseDto } from '../dto/assistant.dto';

/**
 * Contrôleur pour l'assistant agricole IA
 */
@ApiTags('assistant')
@Controller('assistant')
export class AssistantController {
  private readonly logger = new Logger(AssistantController.name);

  constructor(private readonly assistantService: AssistantService) {}

  /**
   * Poser une question à l'assistant IA
   * POST /api/v1/assistant/ask
   */
  @Post('ask')
  @ApiOperation({
    summary: 'Poser une question à l\'assistant agricole',
    description:
      'Obtenir des conseils et recommandations agricoles via l\'IA',
  })
  @ApiResponse({
    status: 200,
    description: 'Réponse de l\'assistant',
    type: AssistantResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Question invalide' })
  @ApiResponse({ status: 503, description: 'Service IA indisponible' })
  async askQuestion(
    @Body() askAssistantDto: AskAssistantDto,
  ): Promise<AssistantResponseDto> {
    this.logger.log(`Assistant question: ${askAssistantDto.question.substring(0, 50)}...`);

    const response = await this.assistantService.getAnswer(
      askAssistantDto.question,
      askAssistantDto.language || 'fr',
      askAssistantDto.context,
    );

    return response;
  }
}
