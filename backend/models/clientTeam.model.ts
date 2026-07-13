import mongoose, { Schema } from "mongoose";
import { AgentEvents, ROLE } from "../constant/enum";
import { Message } from "../constant/messages";
import { emailAddressRegex, phoneNumberRegex } from "../constant/regex";

export interface IClientTeam extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: string;
  status: string;
  resetPassword: boolean | null;
  otp_verified: boolean;
  login_attempts: number;
  lock: boolean;
  twoFA: boolean;
  ratings: { sender: string; rating: number }[];
  events: {
    sender: string;
    sender_name?: string;
    sender_source: string;
    event_type: AgentEvents;
    // timestamp: Date;
  }[];
  googleId?: string | null;
  organization_id?: mongoose.Types.ObjectId | string | null;
  media?: mongoose.Types.ObjectId | string | null;
  token?: string | null;
  tokenCreatedAt?: Date | null;
  branches?: mongoose.Types.ObjectId[] | [] | null;
  regions?: mongoose.Types.ObjectId[] | [] | null;
  clearTokenIfExpired: () => Promise<void>;
}

const clientTeamSchema = new Schema<IClientTeam>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      match: [emailAddressRegex, Message.validEmailAddress],
    },
    phone: {
      type: String,
      required: false,
      match: [phoneNumberRegex, Message.validPhoneNumber],
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    resetPassword: {
      type: Boolean,
      required: false,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned", "invited", "locked"],
      default: "active",
    },
    role: {
      type: String,
      enum: Object.values(ROLE),
      default: ROLE.USER,
    },
    otp_verified: {
      type: Boolean,
      default: false,
    },
    login_attempts: {
      type: Number,
      default: 0,
    },
    lock: {
      type: Boolean,
      default: false,
    },
    twoFA: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
      required: false,
      select: false,
    },
    tokenCreatedAt: {
      type: Date,
      required: false,
      select: false,
    },
  },
  {
    timestamps: true,
  },
);

// Pre-save middleware to lowercase email
clientTeamSchema.pre("save", function () {
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
});

clientTeamSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (update && typeof update === "object" && "email" in update) {
    (update as mongoose.UpdateQuery<IClientTeam>).email = (
      update as mongoose.UpdateQuery<IClientTeam>
    ).email.toLowerCase();
  }
});

// Method to clear token if expired
clientTeamSchema.methods.clearTokenIfExpired =
  async function (): Promise<void> {
    const now = new Date();
    if (
      this.tokenCreatedAt &&
      now.getTime() - this.tokenCreatedAt.getTime() > 15 * 60 * 1000
    ) {
      this.token = null;
      this.tokenCreatedAt = null;
      await this.save();
    }
  };

// Define the ClientTeams model
const ClientTeams = mongoose.model<IClientTeam>(
  "client_teams",
  clientTeamSchema,
);

export default ClientTeams;
