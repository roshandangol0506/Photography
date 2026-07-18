import mongoose, { Schema } from "mongoose";

export interface IVisitor extends mongoose.Document {
  uniqueId: string;
  name?: string | null;
  visitCount: number;
  firstVisit: Date;
  lastVisit: Date;
  device?: string;
  browser?: string;
  platform?: string;
}

const visitorSchema = new Schema<IVisitor>(
  {
    uniqueId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: false, default: null },
    visitCount: { type: Number, default: 1 },
    firstVisit: { type: Date, default: Date.now },
    lastVisit: { type: Date, default: Date.now },
    device: { type: String },
    browser: { type: String },
    platform: { type: String },
  },
  { timestamps: true },
);

const Visitor = mongoose.model<IVisitor>("visitors", visitorSchema);
export default Visitor;
