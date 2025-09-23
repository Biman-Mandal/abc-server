import { model, Schema } from "mongoose";
import { IHelpCenter } from "../interfaces/helpCenter.interface";

const helpCenterSchema = new Schema<IHelpCenter>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title is too long"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description is too long"],
    },
    logo: {
      type: String,
      default: "",
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

const HelpCenter = model<IHelpCenter>("HelpCenter", helpCenterSchema);

export default HelpCenter;