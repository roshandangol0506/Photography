import mongoose, { Schema } from "mongoose";
import { LEAD_STATUS, LEAD_TYPE } from "../constant/enum";
import { emailAddressRegex } from "../constant/regex";
import { Message } from "../constant/messages";

export interface ILead extends mongoose.Document {
  fullName: string;
  email: string;
  phone?: string;
  description?: string;
  type: LEAD_TYPE;
  status: LEAD_STATUS;
  // Only set for a booking; contact enquiries have no slot.
  bookingDate?: Date | null;
  category?: mongoose.Types.ObjectId | null;
}

const leadSchema = new Schema<ILead>(
  {
    fullName: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [emailAddressRegex, Message.validEmailAddress],
    },
    phone: { type: String },
    description: { type: String },
    type: {
      type: String,
      enum: Object.values(LEAD_TYPE),
      default: LEAD_TYPE.BOOK_A_DEMO,
    },
    status: {
      type: String,
      enum: Object.values(LEAD_STATUS),
      default: LEAD_STATUS.PENDING,
    },
    bookingDate: { type: Date, default: null },
    category: { type: Schema.Types.ObjectId, ref: "categories", default: null },
  },
  { timestamps: true },
);

leadSchema.index({ status: 1, createdAt: -1 });

const Lead = mongoose.model<ILead>("leads", leadSchema);
export default Lead;
