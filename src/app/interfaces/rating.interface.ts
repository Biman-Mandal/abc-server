import { Types, Document } from "mongoose";

export interface IRating extends Document {
  rating: number;
  comment?: string;
  rateable_type: "Driver" | "User";
  rateable_id: Types.ObjectId;
  ride_id?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}
