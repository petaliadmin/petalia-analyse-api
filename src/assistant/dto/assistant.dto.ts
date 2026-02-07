import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, MaxLength } from 'class-validator';

/**
 * DTO pour la requête à l'assistant IA
 */
export class AskAssistantDto {
  @ApiProperty({
    description: 'Question de l\'agriculteur',
    example: 'Comment puis-je traiter les taches jaunes sur mon mil ?',
  })
  @IsString()
  @MaxLength(500)
  question: string;

  @ApiProperty({
    description: 'Langue de la réponse',
    example: 'fr',
    enum: ['fr', 'wo', 'ff'],
    required: false,
  })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiProperty({
    description: 'Contexte additionnel (optionnel)',
    example: 'Culture: Mil, Région: Thiès',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  context?: string;
}

/**
 * DTO pour la réponse de l'assistant
 */
export class AssistantResponseDto {
  @ApiProperty({ description: 'Réponse de l\'assistant' })
  answer: string;

  @ApiProperty({ description: 'Texte formaté pour TTS', required: false })
  audioText?: string;

  @ApiProperty({ description: 'Sujets connexes', type: [String], required: false })
  relatedTopics?: string[];
}
