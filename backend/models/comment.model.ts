import mongoose, { Schema } from "mongoose";
import { COMMENT_STATUS } from "../constant/enum";

export interface IComment extends mongoose.Document {
  photo: mongoose.Types.ObjectId;
  visitorId: string;
  name: string;
  content: string;
  status: COMMENT_STATUS;
}

const commentSchema = new Schema<IComment>(
  {
    photo: {
      type: Schema.Types.ObjectId,
      ref: "photos",
      required: true,
      index: true,
    },
    visitorId: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(COMMENT_STATUS),
      default: COMMENT_STATUS.PENDING,
    },
  },
  { timestamps: true },
);

const Comment = mongoose.model<IComment>("comments", commentSchema);
export default Comment;
