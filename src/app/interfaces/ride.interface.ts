import { Document, Types } from "mongoose";

export interface IRide extends Document {
  user: Types.ObjectId;
  driver?: Types.ObjectId;
  pickupLocation: {
    address?: string;
    lat: number;
    lng: number;
  };
  dropoffLocation: {
    address?: string;
    lat: number;
    lng: number;
  };
  status:
    | "requested"
    | "accepted"
    | "ongoing"
    | "completed"
    | "cancelled"
    | "driver-not-found";
  fare?: number;
  estimatedTime?: string;
}
