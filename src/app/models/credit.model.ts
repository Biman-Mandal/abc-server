import { model, Schema } from "mongoose";
import { ICredit } from "../interfaces/credit.interface";

const creditSchema = new Schema<ICredit>(
  {
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    transactions: [
      {
        amount: { type: Number, required: true },
        type: {
          type: String,
          enum: ["add_credit", "ride_deduction"],
          required: true,
        },
        timestamp: { type: Date, default: Date.now },
        rideId: { type: Schema.Types.ObjectId, ref: "Ride" },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Credit = model<ICredit>("Credit", creditSchema);

export default Credit;
