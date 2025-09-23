import { model, Schema } from "mongoose";
import { Iuser } from "../interfaces/user.interface";

const userSchema = new Schema<Iuser>(
  {
    name: {
      type: String,
      trim: true,
      maxlength: [50, "Name is too long"],
    },
    phoneNumber: {
      type: String,
      required: true,
      unique: true,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    city: {
      type: String,
    },
    dateOfBirth: {
      type: Date,
    },
    profilePictureUrl: {
      type: String,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    otp: {
      type: String,
      select: false,
    },
    otpExpiry: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const User = model<Iuser>("User", userSchema);

export default User;
