import { Types } from "mongoose";

export interface INotification {
  _id?: Types.ObjectId;
  user_id: Types.ObjectId;
  title: string;
  image?: string;
  description: string;
  is_read: number; // 0 = unread, 1 = read
  createdAt?: Date;
  updatedAt?: Date;
}