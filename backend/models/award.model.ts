import mongoose, { Schema } from "mongoose";

export interface IAward extends mongoose.Document {
  title: string;
  organization?: string;
  year: number;
  description?: string;
  image?: string;
  order: number;
  isActive: boolean;
}

const awardSchema = new Schema<IAward>(
  {
    title: { type: String, required: true },
    organization: { type: String },
    year: { type: Number, required: true },
    description: { type: String },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Award = mongoose.model<IAward>("awards", awardSchema);
export default Award;
