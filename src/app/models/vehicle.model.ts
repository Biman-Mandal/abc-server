import { model, Schema } from "mongoose";
import { IVehicle } from "../interfaces/vehicle.interface";

const vehicleSchema = new Schema<IVehicle>(
  {
    title: {
      type: String,
      required: [true, "Vehicle title is required"],
      trim: true,
      maxlength: [255, "Title is too long"],
    },
    vehicleTypeId: {
      type: Schema.Types.ObjectId,
      ref: "VehicleType",
      required: [true, "Vehicle type is required"],
    },
    fuelType: {
      type: String,
      enum: {
        values: ['gas', 'diesel', 'hybrid', 'electric'],
        message: 'Fuel type must be gas, diesel, hybrid, or electric'
      },
      required: [true, "Fuel type is required"],
      default: 'diesel',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Vehicle = model<IVehicle>("Vehicle", vehicleSchema);

export default Vehicle;