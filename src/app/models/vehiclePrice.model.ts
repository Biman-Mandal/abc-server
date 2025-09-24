import { model, Schema } from "mongoose";
import { IVehiclePrice } from "../interfaces/vehiclePrice.interface";

const vehiclePriceSchema = new Schema<IVehiclePrice>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: [true, "Vehicle ID is required"],
    },
    pricePerKm: {
      type: Number,
      min: [0, "Price per km cannot be negative"],
      default: 0
    },
    pricePerMile: {
      type: Number,
      min: [0, "Price per mile cannot be negative"],
      default: 0
    },
    currency: {
      type: String,
      required: [true, "Currency is required"],
      default: "USD",
      trim: true,
      uppercase: true,
      minlength: [3, "Currency code must be 3 characters"],
      maxlength: [3, "Currency code must be 3 characters"],
    },
    basePrice: {
      type: Number,
      min: [0, "Base price cannot be negative"],
      default: 0,
    },
    additionalCharges: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      amount: {
        type: Number,
        required: true,
        min: [0, "Amount cannot be negative"],
      },
      type: {
        type: String,
        enum: ['fixed', 'percentage'],
        required: true,
      },
    }],
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

// Ensure at least one pricing method is provided
vehiclePriceSchema.pre('save', function(next) {
  if (!this.pricePerKm && !this.pricePerMile && !this.basePrice) {
    next(new Error('At least one pricing method (pricePerKm, pricePerMile, or basePrice) must be provided'));
  }
  next();
});

const VehiclePrice = model<IVehiclePrice>("VehiclePrice", vehiclePriceSchema);

export default VehiclePrice;