import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

// Modules métier
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DiagnosisModule } from './diagnosis/diagnosis.module';
import { SoilModule } from './soil/soil.module';
import { AssistantModule } from './assistant/assistant.module';

/**
 * Module principal de l'application AgriTech
 * Importe et configure tous les modules et services
 */
@Module({
  imports: [
    // Configuration depuis .env
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // MongoDB avec Mongoose
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
        auth: {
          username: configService.get<string>('MONGODB_USER'),
          password: configService.get<string>('MONGODB_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),

    // Rate limiting (protection DDoS)
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [{
          ttl: configService.get<number>('THROTTLE_TTL', 60),
          limit: configService.get<number>('THROTTLE_LIMIT', 100),
        }],
      }),
      inject: [ConfigService],
    }),

    // Upload de fichiers avec Multer
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: configService.get<string>('UPLOAD_DESTINATION', './uploads'),
          filename: (req, file, callback) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
          },
        }),
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE', 5 * 1024 * 1024), // 5 MB
        },
        fileFilter: (req, file, callback) => {
          const allowedTypes = configService
            .get<string>('ALLOWED_IMAGE_TYPES', 'image/jpeg,image/png,image/jpg')
            .split(',');

          if (allowedTypes.includes(file.mimetype)) {
            callback(null, true);
          } else {
            callback(
              new Error(
                `Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`,
              ),
              false,
            );
          }
        },
      }),
      inject: [ConfigService],
    }),

    // Modules métier
    AuthModule,
    UsersModule,
    DiagnosisModule,
    SoilModule,
    AssistantModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
