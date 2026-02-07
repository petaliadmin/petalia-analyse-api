import { Module } from '@nestjs/common';
import { AssistantController } from './controllers/assistant.controller';
import { AssistantService } from './services/assistant.service';
import { AiServiceClient } from '../common/services/ai-service-client.service';

/**
 * Module pour l'assistant agricole IA
 */
@Module({
  controllers: [AssistantController],
  providers: [AssistantService, AiServiceClient],
  exports: [AssistantService],
})
export class AssistantModule {}
