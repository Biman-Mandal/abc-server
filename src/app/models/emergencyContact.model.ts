import { model, Schema, Types } from "mongoose";
import { IEmergencyContact } from "../interfaces/emergencyContact.interface";

const emergencyContactSchema = new Schema<IEmergencyContact>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name is too long"],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[0-9]{10,15}$/, "Please provide a valid phone number"],
      default: null,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Validation to ensure at least one contact method is provided
emergencyContactSchema.pre("save", function (next) {
  if (!this.phone && !this.email) {
    const error = new Error("At least one contact method (phone or email) is required");
    return next(error);
  }
  next();
});

// Compound index for better query performance
emergencyContactSchema.index({ user_id: 1, createdAt: -1 });

const EmergencyContact = model<IEmergencyContact>("EmergencyContact", emergencyContactSchema);

export default EmergencyContact;