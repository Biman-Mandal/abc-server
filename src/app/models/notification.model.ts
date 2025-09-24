import { model, Schema, Types } from "mongoose";
import { INotification } from "../interfaces/notification.interface";

const notificationSchema = new Schema<INotification>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title is too long"],
    },
    image: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description is too long"],
    },
    is_read: {
      type: Number,
      enum: [0, 1],
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const Notification = model<INotification>("Notification", notificationSchema);

export default Notification;