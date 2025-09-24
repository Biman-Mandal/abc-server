import { model, Schema } from "mongoose";
import { IVehicleType } from "../interfaces/vehicleType.interface";

const vehicleTypeSchema = new Schema<IVehicleType>(
  {
    name: {
      type: String,
      required: [true, "Vehicle type name is required"],
      trim: true,
      maxlength: [255, "Name is too long"],
      unique: true,
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

const VehicleType = model<IVehicleType>("VehicleType", vehicleTypeSchema);

export default VehicleType;