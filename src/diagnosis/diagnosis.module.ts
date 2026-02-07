import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DiagnosisController } from './controllers/diagnosis.controller';
import { DiagnosisService } from './services/diagnosis.service';
import { Diagnosis, DiagnosisSchema } from './schemas/diagnosis.schema';
import { AiServiceClient } from '../common/services/ai-service-client.service';

/**
 * Module pour la gestion des diagnostics de maladies
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Diagnosis.name, schema: DiagnosisSchema },
    ]),
  ],
  controllers: [DiagnosisController],
  providers: [DiagnosisService, AiServiceClient],
  exports: [DiagnosisService],
})
export class DiagnosisModule {}
