import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';
import { DiagnosisService } from '../services/diagnosis.service';
import {
  CreateDiagnosisDto,
  DiagnosisResponseDto,
  DiagnosisFilterDto,
} from '../dto/diagnosis.dto';

/**
 * Contrôleur pour les diagnostics de maladies des cultures
 */
@ApiTags('diagnosis')
@Controller('diagnosis')
export class DiagnosisController {
  private readonly logger = new Logger(DiagnosisController.name);

  constructor(private readonly diagnosisService: DiagnosisService) {}

  /**
   * Endpoint principal: Soumettre un diagnostic avec image
   * POST /api/v1/diagnosis/crop-disease
   */
  @Post('crop-disease')
  @ApiOperation({
    summary: 'Diagnostic de maladie de culture',
    description:
      'Upload une image de culture et obtient un diagnostic IA avec recommandations',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['image', 'crop_type', 'crop_age_days', 'region', 'symptoms'],
      properties: {
        image: {
          type: 'string',
          format: 'binary',
          description: 'Image de la culture malade (JPEG/PNG, max 5MB)',
        },
        crop_type: {
          type: 'string',
          example: 'Mil (Souna)',
        },
        crop_age_days: {
          type: 'number',
          example: 45,
        },
        region: {
          type: 'string',
          example: 'Thiès',
        },
        symptoms: {
          type: 'string',
          description: 'Liste des symptômes séparés par des virgules',
          example: 'Taches jaunes sur feuilles,Feuilles sèches',
        },
        language: {
          type: 'string',
          enum: ['fr', 'wo', 'ff'],
          default: 'fr',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Diagnostic créé avec succès',
    type: DiagnosisResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  @ApiResponse({ status: 503, description: 'Service IA indisponible' })
  @UseInterceptors(FileInterceptor('image'))
  async submitDiagnosis(
    @UploadedFile() file: Express.Multer.File,
    @Body('crop_type') cropType: string,
    @Body('crop_age_days') cropAgeDays: string,
    @Body('region') region: string,
    @Body('symptoms') symptomsString: string,
    @Body('language') language?: string,
  ): Promise<DiagnosisResponseDto> {
    // Validation du fichier
    if (!file) {
      throw new HttpException('Image requise', HttpStatus.BAD_REQUEST);
    }

    // Validation des champs
    if (!cropType || !cropAgeDays || !region || !symptomsString) {
      throw new HttpException('Tous les champs sont requis', HttpStatus.BAD_REQUEST);
    }

    this.logger.log(`New diagnosis request for ${cropType} in ${region}`);

    // Parser les symptômes (séparés par des virgules)
    const symptoms = symptomsString.split(',').map((s) => s.trim());

    // Créer le DTO
    const createDiagnosisDto: CreateDiagnosisDto = {
      cropType,
      cropAgeDays: parseInt(cropAgeDays, 10),
      region,
      symptoms,
      language: language || 'fr',
    };

    // Appeler le service
    const diagnosis = await this.diagnosisService.createDiagnosis(
      createDiagnosisDto,
      file,
      'user-id-placeholder', // TODO: Obtenir depuis JWT après authentification
    );

    return diagnosis;
  }

  /**
   * Obtenir l'historique des diagnostics de l'utilisateur
   * GET /api/v1/diagnosis/history
   */
  @Get('history')
  @ApiOperation({
    summary: 'Historique des diagnostics',
    description: 'Obtenir la liste des diagnostics de l\'utilisateur',
  })
  @ApiResponse({
    status: 200,
    description: 'Liste des diagnostics',
    type: [DiagnosisResponseDto],
  })
  async getDiagnosisHistory(
    @Query() filterDto: DiagnosisFilterDto,
  ): Promise<DiagnosisResponseDto[]> {
    this.logger.log('Fetching diagnosis history');

    const diagnoses = await this.diagnosisService.getUserDiagnoses(
      'user-id-placeholder', // TODO: Obtenir depuis JWT
      filterDto,
    );

    return diagnoses;
  }

  /**
   * Obtenir un diagnostic spécifique par ID
   * GET /api/v1/diagnosis/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtenir un diagnostic par ID',
    description: 'Récupérer les détails complets d\'un diagnostic',
  })
  @ApiResponse({
    status: 200,
    description: 'Diagnostic trouvé',
    type: DiagnosisResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Diagnostic non trouvé' })
  async getDiagnosisById(@Param('id') id: string): Promise<DiagnosisResponseDto> {
    this.logger.log(`Fetching diagnosis ${id}`);

    const diagnosis = await this.diagnosisService.getDiagnosisById(id);

    if (!diagnosis) {
      throw new HttpException('Diagnostic non trouvé', HttpStatus.NOT_FOUND);
    }

    return diagnosis;
  }

  /**
   * Obtenir des statistiques sur les diagnostics
   * GET /api/v1/diagnosis/stats/overview
   */
  @Get('stats/overview')
  @ApiOperation({
    summary: 'Statistiques des diagnostics',
    description: 'Vue d\'ensemble des statistiques de diagnostics',
  })
  async getDiagnosisStats() {
    this.logger.log('Fetching diagnosis statistics');
    return await this.diagnosisService.getStatistics('user-id-placeholder');
  }
}
