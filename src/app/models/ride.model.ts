import { model, Schema, Types } from "mongoose";
import { IRide } from "../interfaces/ride.interface";
const rideSchema = new Schema<IRide>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    driver: {
      type: Schema.Types.ObjectId,
      ref: "Driver",
      required: false,
    },
    pickupLocation: {
      address: {
        type: String,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    dropoffLocation: {
      address: {
        type: String,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    status: {
      type: String,
      required: true,
      enum: [
        "requested",
        "accepted",
        "ongoing",
        "completed",
        "cancelled",
        "driver-not-found",
      ],
      default: "requested",
    },
    fare: {
      type: Number,
    },
    estimatedTime: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Ride = model<IRide>("Ride", rideSchema);

export default Ride;
