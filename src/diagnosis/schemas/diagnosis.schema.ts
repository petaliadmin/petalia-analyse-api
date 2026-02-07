import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/**
 * Sous-schéma pour les recommandations
 */
@Schema({ _id: false })
export class Recommendation {
  @Prop({ required: true })
  type: string; // 'treatment', 'prevention', 'cultural_practice'

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  priority: number; // 1 = urgent, 2 = important, 3 = optional

  @Prop()
  audioText: string; // Texte formaté pour TTS
}

const RecommendationSchema = SchemaFactory.createForClass(Recommendation);

/**
 * Schéma MongoDB pour les diagnostics de maladies
 */
@Schema({
  timestamps: true,
  collection: 'diagnoses',
})
export class Diagnosis extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId; // Référence à l'utilisateur

  @Prop({ required: true })
  cropType: string; // Type de culture (ex: "Mil", "Maïs")

  @Prop({ required: true })
  cropAgeDays: number; // Âge de la culture en jours

  @Prop({ required: true })
  region: string; // Région géographique

  @Prop({ type: [String], required: true })
  symptoms: string[]; // Liste des symptômes observés

  @Prop({ required: true })
  imageUrl: string; // URL de l'image uploadée

  @Prop()
  imagePath: string; // Chemin local de l'image

  @Prop({ required: true })
  diseaseName: string; // Nom de la maladie détectée

  @Prop()
  diseaseNameLocal: string; // Nom local dans la langue de l'agriculteur

  @Prop({ required: true, min: 0, max: 1 })
  confidence: number; // Niveau de confiance du modèle IA (0-1)

  @Prop({ required: true, enum: ['low', 'medium', 'high'] })
  severity: string; // Sévérité de la maladie

  @Prop()
  description: string; // Description de la maladie

  @Prop({ type: [RecommendationSchema], default: [] })
  recommendations: Recommendation[]; // Liste des recommandations

  @Prop({ default: 'fr' })
  language: string; // Langue du diagnostic

  @Prop({ type: Object })
  aiModelMetadata: {
    modelVersion?: string;
    processingTime?: number;
    alternativeDiseases?: Array<{ name: string; confidence: number }>;
  };

  @Prop({ default: 'pending' })
  status: string; // 'pending', 'completed', 'failed'

  createdAt: Date;
  updatedAt: Date;
}

export const DiagnosisSchema = SchemaFactory.createForClass(Diagnosis);

// Index pour les requêtes fréquentes
DiagnosisSchema.index({ userId: 1, createdAt: -1 });
DiagnosisSchema.index({ cropType: 1 });
DiagnosisSchema.index({ region: 1 });
DiagnosisSchema.index({ diseaseName: 1 });
