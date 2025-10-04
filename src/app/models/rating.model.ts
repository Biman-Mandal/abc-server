import { Schema, model, Types } from "mongoose";
import { IRating } from "../interfaces/rating.interface";

const ratingSchema = new Schema<IRating>(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
    rateable_type: {
      type: String,
      enum: ["Driver", "User"], // only these two models are allowed
      default: "Driver",
      required: true,
    },
    rateable_id: {
      type: Schema.Types.ObjectId,
      refPath: "rateable_type", // dynamically reference based on rateable_type
      required: true,
    },
    ride_id: {
      type: Schema.Types.ObjectId,
      ref: "rides",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Rating = model<IRating>("Rating", ratingSchema);

export default Rating;
