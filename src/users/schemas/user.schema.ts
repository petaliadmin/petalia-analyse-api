import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Schéma MongoDB pour les utilisateurs/agriculteurs
 */
@Schema({
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  collection: 'users',
})
export class User extends Document {
  @Prop({ required: true, unique: true })
  phone: string; // Numéro de téléphone (principal identifiant)

  @Prop({ required: true })
  password: string; // Mot de passe hashé avec bcrypt

  @Prop({ required: true })
  name: string; // Nom complet de l'agriculteur

  @Prop({ default: 'fr' })
  language: string; // Langue préférée (fr, wo, ff)

  @Prop()
  region: string; // Région géographique

  @Prop()
  village: string; // Village

  @Prop({ default: 'farmer' })
  role: string; // Rôle: farmer, agent, admin

  @Prop({ default: true })
  isActive: boolean; // Compte actif ou non

  @Prop()
  lastLogin: Date; // Dernière connexion

  @Prop({ type: Object })
  settings: {
    ttsEnabled?: boolean;
    notifications?: boolean;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Index pour la recherche rapide
UserSchema.index({ region: 1 });
