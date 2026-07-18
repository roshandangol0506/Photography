import mongoose, { Schema } from "mongoose";

export interface ILike extends mongoose.Document {
  photo: mongoose.Types.ObjectId;
  visitorId: string;
}

const likeSchema = new Schema<ILike>(
  {
    photo: { type: Schema.Types.ObjectId, ref: "photos", required: true },
    visitorId: { type: String, required: true },
  },
  { timestamps: true },
);

likeSchema.index({ photo: 1, visitorId: 1 }, { unique: true });

const Like = mongoose.model<ILike>("likes", likeSchema);
export default Like;
