import { Model, Types } from "mongoose";

export interface IDriver {
  driverName: string;
  email: string; // Changed from phone
  phone: string; // Made phone optional or can be primary
  password: string;
  vehicleTypeId: Types.ObjectId;
  vehicleId: Types.ObjectId;

  vehicleType: "bike" | "car" | "truck" | "bus" | "auto" | "toto";
  vehicleNumber: string;
  vehicleModel: string;
  vehicleBrand: string;

  licenseType: "private" | "commercial";
  licenseExpiryDate: Date;

  taxinfo: string;
  taxDocument: string;
  carDocument: string;
  smokeCheckStatus: "passed" | "failed" | "pending";
  smokeTestDate: Date;

  licenseNumber?: string;
  profileImage?: string;
  documents?: {
    license?: string;
    aadhar?: string;
    pan?: string;
  };

  location?: {
    type: "Point";
    coordinates: [number, number]; // [longitude, latitude]
  };

  isApproved: boolean;
  isBanned: boolean;
  isOnline: boolean;

  totalEarnings?: number;
  rideHistory?: Types.ObjectId[];
  rating?: number;
}

export interface IDriverMethods {
  comparePassword(enteredPassword: string): Promise<boolean>;
}

export type DriverModelType = Model<IDriver, {}, IDriverMethods>;
