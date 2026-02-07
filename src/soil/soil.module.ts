import { Module } from '@nestjs/common';
import { SoilController } from './controllers/soil.controller';
import { SoilService } from './services/soil.service';
import { AiServiceClient } from '../common/services/ai-service-client.service';

/**
 * Module pour l'analyse des données du sol
 */
@Module({
  controllers: [SoilController],
  providers: [SoilService, AiServiceClient],
  exports: [SoilService],
})
export class SoilModule {}
