import { Schema, model } from "mongoose";
import { ISupportTicket } from "../interfaces/support.interface";

const supportTicketSchema = new Schema<ISupportTicket>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rideId: { type: Schema.Types.ObjectId, ref: 'Ride' },
  subject: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  category: {
    type: String,
    enum: ["payment", "driver_behavior", "technical", "other"],
    required: true,
  },
  status: {
    type: String,
    enum: ["open", "in_progress", "resolved"],
    default: "open",
  },
  messages: [{
    sender: { type: Schema.Types.ObjectId, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
  versionKey: false,
});

const SupportTicket = model<ISupportTicket>("SupportTicket", supportTicketSchema);
export default SupportTicket;