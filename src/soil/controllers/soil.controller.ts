import { Controller, Post, Body, Logger } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SoilService } from '../services/soil.service';
import { SoilAnalysisDto, SoilAnalysisResponseDto } from '../dto/soil.dto';

/**
 * Contrôleur pour l'analyse des données du sol
 */
@ApiTags('soil')
@Controller('soil')
export class SoilController {
  private readonly logger = new Logger(SoilController.name);

  constructor(private readonly soilService: SoilService) {}

  /**
   * Analyser les données du sol
   * POST /api/v1/soil/analyze
   */
  @Post('analyze')
  @ApiOperation({
    summary: 'Analyser les données du sol',
    description:
      'Obtenir des recommandations basées sur les mesures du sol (pH, NPK, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'Analyse du sol complétée',
    type: SoilAnalysisResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 503, description: 'Service IA indisponible' })
  async analyzeSoil(
    @Body() soilAnalysisDto: SoilAnalysisDto,
  ): Promise<SoilAnalysisResponseDto> {
    this.logger.log(
      `Soil analysis request for region ${soilAnalysisDto.region}`,
    );

    const result = await this.soilService.analyzeSoil(soilAnalysisDto);
    return result;
  }
}
