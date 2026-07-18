import mongoose, { Schema } from "mongoose";
import { VISIBILITY, STORAGE_PROVIDER } from "../constant/enum";

export interface IPhotoImages {
  thumb: string;
  medium: string;
  large: string;
  blurDataURL: string;
}

export interface IPhoto extends mongoose.Document {
  title: string;
  slug: string;
  description?: string;
  images: IPhotoImages;
  storageProvider: STORAGE_PROVIDER;
  storageKeys: string[];
  category?: mongoose.Types.ObjectId | null;
  collections: mongoose.Types.ObjectId[];
  tags: string[];
  camera?: string;
  lens?: string;
  location?: string;
  dateTaken?: Date | null;
  isBackground: boolean;
  isSideScroll: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isHome: boolean;
  visibility: VISIBILITY;
  order: number;
  viewCount: number;
  likeCount: number;
  commentCount: number;
}

const photoSchema = new Schema<IPhoto>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    images: {
      thumb: { type: String, required: true },
      medium: { type: String, required: true },
      large: { type: String, required: true },
      blurDataURL: { type: String, required: true },
    },
    storageProvider: {
      type: String,
      enum: Object.values(STORAGE_PROVIDER),
      required: true,
    },
    storageKeys: { type: [String], default: [] },
    category: { type: Schema.Types.ObjectId, ref: "categories", default: null },
    collections: [{ type: Schema.Types.ObjectId, ref: "collections" }],
    tags: { type: [String], default: [] },
    camera: { type: String },
    lens: { type: String },
    location: { type: String },
    dateTaken: { type: Date, default: null },
    isBackground: { type: Boolean, default: false },
    isSideScroll: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isHome: { type: Boolean, default: false },
    visibility: {
      type: String,
      enum: Object.values(VISIBILITY),
      default: VISIBILITY.DRAFT,
    },
    order: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

photoSchema.index({ visibility: 1, isBackground: 1 });
photoSchema.index({ visibility: 1, isSideScroll: 1 });
photoSchema.index({ visibility: 1, isFeatured: 1 });
photoSchema.index({ visibility: 1, isTrending: 1 });
photoSchema.index({ visibility: 1, isHome: 1 });
photoSchema.index({ category: 1 });
photoSchema.index({ tags: 1 });

const Photo = mongoose.model<IPhoto>("photos", photoSchema);
export default Photo;
