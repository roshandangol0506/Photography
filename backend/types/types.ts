import mongoose, { Document } from 'mongoose';

interface IntegrationDocumentType extends Document {
  page_id: string;
  page_name?: string;
  page_access_token: string;
  app_id?: string;
  app_secret: string;
  organization_id?: mongoose.Schema.Types.ObjectId;
  client_id?: mongoose.Schema.Types.ObjectId;
  client_team_id?: mongoose.Schema.Types.ObjectId;
  subscribed_date: Date;
  createdAt?: Date;
  updatedAt?: Date;
  branchId?: string;
  source?: string;
  regionId?: string;
}

export type { IntegrationDocumentType };
