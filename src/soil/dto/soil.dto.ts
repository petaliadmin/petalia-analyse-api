import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

/**
 * DTO pour l'analyse du sol
 */
export class SoilAnalysisDto {
  @ApiProperty({ description: 'pH du sol', example: 6.5, minimum: 0, maximum: 14 })
  @IsNumber()
  @Min(0)
  @Max(14)
  ph: number;

  @ApiProperty({ description: 'Azote (N) en mg/kg', example: 45 })
  @IsNumber()
  @Min(0)
  nitrogen: number;

  @ApiProperty({ description: 'Phosphore (P) en mg/kg', example: 30 })
  @IsNumber()
  @Min(0)
  phosphorus: number;

  @ApiProperty({ description: 'Potassium (K) en mg/kg', example: 120 })
  @IsNumber()
  @Min(0)
  potassium: number;

  @ApiProperty({ description: 'Température du sol en °C', example: 28 })
  @IsNumber()
  @Min(-10)
  @Max(60)
  temperature: number;

  @ApiProperty({ description: 'Humidité du sol en %', example: 35 })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty({ description: 'Région', example: 'Thiès' })
  @IsString()
  region: string;

  @ApiProperty({ description: 'Type de culture prévu', required: false })
  @IsOptional()
  @IsString()
  cropType?: string;

  @ApiProperty({ description: 'Langue', enum: ['fr', 'wo', 'ff'], required: false })
  @IsOptional()
  @IsString()
  language?: string;
}

/**
 * DTO pour la réponse d'analyse du sol
 */
export class SoilAnalysisResponseDto {
  @ApiProperty({ description: 'Qualité du sol' })
  soilQuality: 'poor' | 'fair' | 'good' | 'excellent';

  @ApiProperty({ description: 'Recommandations', type: 'array' })
  recommendations: Array<{
    type: string;
    description: string;
    priority: number;
  }>;

  @ApiProperty({ description: 'Cultures adaptées', type: [String] })
  suitableCrops: string[];

  @ApiProperty({ description: 'Besoins en fertilisants' })
  fertilizerNeeds: {
    nitrogen: string;
    phosphorus: string;
    potassium: string;
  };
}
