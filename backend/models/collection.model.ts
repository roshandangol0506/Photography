import mongoose, { Schema } from "mongoose";

export interface ICollection extends mongoose.Document {
  name: string;
  slug: string;
  description?: string;
  coverImage?: string;
  // Placement flag: surfaces this collection in the home page's
  // shared-background showcase band.
  isBackgroundList: boolean;
  order: number;
  isActive: boolean;
}

const collectionSchema = new Schema<ICollection>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    coverImage: { type: String },
    isBackgroundList: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Collection = mongoose.model<ICollection>("collections", collectionSchema);
export default Collection;
