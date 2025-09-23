import { Document } from "mongoose";

export interface Iuser extends Document {
  name?: string;
  phoneNumber: string;
  gender?: "Male" | "Female" | "Other";
  city?: string;
  dateOfBirth?: Date;
  profilePictureUrl?: string;
  isActive: boolean;
  otp?: string;
  otpExpiry?: Date;
}
