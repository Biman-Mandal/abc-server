import { Document, Types } from "mongoose";

export interface ICreditTransaction {
  amount: number;
  type: "add_credit" | "ride_deduction";
  timestamp: Date;
  rideId?: Types.ObjectId;
}

export interface ICredit extends Document {
  driver: Types.ObjectId;
  balance: number;
  transactions: ICreditTransaction[];
}
