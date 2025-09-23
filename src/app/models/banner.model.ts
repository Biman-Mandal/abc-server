import { Schema, model } from "mongoose";
import { IBanner } from "../interfaces/banner.interface";

const bannerSchema = new Schema<IBanner>(
  {
    title: {
      type: String,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    type: {
      type: String,
      enum: ["main", "secondary"],
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Banner = model<IBanner>("Banner", bannerSchema);
export default Banner;
