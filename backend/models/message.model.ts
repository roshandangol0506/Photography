import mongoose, { Schema } from "mongoose";
import { MESSAGE_STATUS } from "../constant/enum";
import { emailAddressRegex } from "../constant/regex";
import { Message } from "../constant/messages";

export interface IContactMessage extends mongoose.Document {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: MESSAGE_STATUS;
}

const messageSchema = new Schema<IContactMessage>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [emailAddressRegex, Message.validEmailAddress],
    },
    phone: { type: String },
    subject: { type: String },
    message: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(MESSAGE_STATUS),
      default: MESSAGE_STATUS.NEW,
    },
  },
  { timestamps: true },
);

const ContactMessage = mongoose.model<IContactMessage>(
  "messages",
  messageSchema,
);
export default ContactMessage;
