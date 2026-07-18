import mongoose, { Schema } from "mongoose";

export interface IVisitLog extends mongoose.Document {
  visitorId: string;
  path: string;
  createdAt: Date;
}

const visitLogSchema = new Schema<IVisitLog>(
  {
    visitorId: { type: String, required: true, index: true },
    path: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

visitLogSchema.index({ createdAt: 1 });

const VisitLog = mongoose.model<IVisitLog>("visit_logs", visitLogSchema);
export default VisitLog;
