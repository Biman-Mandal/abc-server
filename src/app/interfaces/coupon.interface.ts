import { Document } from "mongoose";

export interface ICoupon extends Document {
  code: string;
  discountType: "Percentage" | "Flat";
  discountValue: number;
  maxDiscount?: number;
  minRideValue?: number;
  expiryDate: Date;
  isActive: boolean;
}
