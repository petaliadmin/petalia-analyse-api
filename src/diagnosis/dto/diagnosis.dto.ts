import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsArray,
  IsOptional,
  Min,
  Max,
  ArrayMinSize,
  MaxLength,
} from 'class-validator';

/**
 * DTO pour la requête de diagnostic de maladie
 */
export class CreateDiagnosisDto {
  @ApiProperty({
    description: 'Type de culture',
    example: 'Mil (Souna)',
  })
  @IsString()
  @MaxLength(100)
  cropType: string;

  @ApiProperty({
    description: 'Âge de la culture en jours',
    example: 45,
    minimum: 1,
    maximum: 365,
  })
  @IsNumber()
  @Min(1)
  @Max(365)
  cropAgeDays: number;

  @ApiProperty({
    description: 'Région géographique',
    example: 'Thiès',
  })
  @IsString()
  @MaxLength(100)
  region: string;

  @ApiProperty({
    description: 'Liste des symptômes observés',
    example: ['Taches jaunes sur feuilles', 'Feuilles sèches'],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  symptoms: string[];

  @ApiProperty({
    description: 'Langue pour les recommandations',
    example: 'fr',
    enum: ['fr', 'wo', 'ff'],
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;
}

/**
 * DTO pour la réponse de diagnostic
 */
export class DiagnosisResponseDto {
  @ApiProperty({ description: 'ID du diagnostic' })
  id: string;

  @ApiProperty({ description: 'Nom de la maladie détectée' })
  diseaseName: string;

  @ApiProperty({ description: 'Nom local de la maladie', required: false })
  diseaseNameLocal?: string;

  @ApiProperty({ description: 'Niveau de confiance (0-1)', example: 0.92 })
  confidence: number;

  @ApiProperty({
    description: 'Sévérité de la maladie',
    enum: ['low', 'medium', 'high'],
  })
  severity: string;

  @ApiProperty({ description: 'Description de la maladie' })
  description: string;

  @ApiProperty({ description: 'URL de l\'image uploadée' })
  imageUrl: string;

  @ApiProperty({ description: 'Liste des recommandations', type: 'array' })
  recommendations: RecommendationDto[];

  @ApiProperty({ description: 'Date de création' })
  createdAt: Date;
}

/**
 * DTO pour une recommandation
 */
export class RecommendationDto {
  @ApiProperty({ description: 'Type de recommandation' })
  type: string;

  @ApiProperty({ description: 'Titre de la recommandation' })
  title: string;

  @ApiProperty({ description: 'Description détaillée' })
  description: string;

  @ApiProperty({ description: 'Niveau de priorité (1-3)' })
  priority: number;

  @ApiProperty({ description: 'Texte formaté pour audio', required: false })
  audioText?: string;
}

/**
 * DTO pour le filtre d'historique
 */
export class DiagnosisFilterDto {
  @ApiProperty({ required: false, description: 'Type de culture' })
  @IsOptional()
  @IsString()
  cropType?: string;

  @ApiProperty({ required: false, description: 'Région' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({
    required: false,
    description: 'Nombre de résultats',
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    required: false,
    description: 'Offset pour la pagination',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number = 0;
}
