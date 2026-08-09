import mongoose, { Schema } from "mongoose";
import { COMMENT_STATUS } from "../constant/enum";

export interface IComment extends mongoose.Document {
  photo: mongoose.Types.ObjectId;
  // Null for a top-level comment; set to the comment being replied to.
  parent?: mongoose.Types.ObjectId | null;
  visitorId: string;
  name: string;
  content: string;
  // Replies written by an admin from the dashboard, rendered as the owner.
  isAdminReply: boolean;
  likeCount: number;
  // Visitor ids, so a like can be toggled back off by the same visitor.
  likedBy: string[];
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
    parent: {
      type: Schema.Types.ObjectId,
      ref: "comments",
      default: null,
      index: true,
    },
    visitorId: { type: String, required: true },
    name: { type: String, required: true },
    content: { type: String, required: true },
    isAdminReply: { type: Boolean, default: false },
    likeCount: { type: Number, default: 0 },
    likedBy: { type: [String], default: [] },
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
