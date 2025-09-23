import { Document, Types } from "mongoose";

export interface IBanner extends Document {
  title?: string;
  imageUrl: string;
  link?: string;
  isActive: boolean;
  type: "main" | "secondary";
  addedBy: Types.ObjectId;
}
