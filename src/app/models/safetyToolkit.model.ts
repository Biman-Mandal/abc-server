import { model, Schema } from "mongoose";
import { ISafetyToolkit } from "../interfaces/safetyToolkit.interface";

const safetyToolkitSchema = new Schema<ISafetyToolkit>(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [200, "Title is too long"],
      default: null,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description is too long"],
      default: null,
    },
    image: {
      type: String,
      required: [true, "Image is required"],
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for better query performance
safetyToolkitSchema.index({ createdAt: -1 });
safetyToolkitSchema.index({ title: 1 });

const SafetyToolkit = model<ISafetyToolkit>("SafetyToolkit", safetyToolkitSchema);

export default SafetyToolkit;