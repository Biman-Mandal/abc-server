import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import {
  IDriver,
  IDriverMethods,
  DriverModelType,
} from "../interfaces/driver.interface";

const driverSchema = new Schema<IDriver, DriverModelType>(
  {
    driverName: {
      type: String,
      trim: true,
      maxlength: [50, "Name is too long"],
      required: [true, "Driver name is required"],
    },
    email: {
      type: String,
      trim: true,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      trim: true,
      required: [true, "Phone number is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      select: false, // Hide password by default
    },

    vehicleType: {
      type: String,
      enum: ["bike", "car", "truck", "bus", "auto", "toto"],
      required: true,
    },
    vehicleNumber: {
      type: String,
      trim: true,
      required: [true, "Vehicle number is required"],
      unique: true,
    },
    vehicleModel: {
      type: String,
      required: true,
    },
    vehicleBrand: {
      type: String,
      required: true,
    },
    licenseType: {
      type: String,
      enum: ["private", "commercial"],
      required: true,
    },
    licenseExpiryDate: {
      type: Date,
      required: true,
    },
    taxinfo: {
      type: String,
      required: [true, "Tax information is required"],
    },
    taxDocument: {
      type: String,
      required: [true, "Tax document is required"],
    },
    carDocument: {
      type: String,
      required: [true, "Car document is required"],
    },
    smokeCheckStatus: {
      type: String,
      enum: ["passed", "failed", "pending"],
      required: true,
    },
    smokeTestDate: {
      type: Date,
      required: [true, "Smoke test date is required"],
    },
    profileImage: {
      type: String,
    },
    documents: {
      license: String,
      aadhar: String,
      pan: String,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [0, 0],
      },
    },

    isApproved: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },
    rideHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Ride",
      },
    ],
    rating: {
      type: Number,
      default: 5,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        return ret;
      },
    },
  }
);

driverSchema.index({ location: "2dsphere" });

driverSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

driverSchema.methods.comparePassword = async function (
  this: IDriver,
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const Driver = model<IDriver, DriverModelType>("Driver", driverSchema);
