import { Document, Types } from "mongoose";

export interface ISupportTicket extends Document {
  userId: Types.ObjectId;
  rideId?: Types.ObjectId;
  subject: string;
  description: string;
  category: "payment" | "driver_behavior" | "technical" | "other";
  status: "open" | "in_progress" | "resolved";
  messages: {
    sender: Types.ObjectId;
    message: string;
    timestamp: Date;
  }[];
}