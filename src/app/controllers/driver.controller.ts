import type { Request, Response, NextFunction, Express } from "express";
import type { IDriver } from "../interfaces/driver.interface";
import { Driver } from "../models/driver.model";
import Credit from "../models/credit.model";
import Ride from "../models/ride.model";
import VehicleType from "../models/vehicleType.model";
import Vehicle from "../models/vehicle.model";

/**
 * ✅ GET DRIVER BY ID
 */
export const getDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverData = req.user as IDriver;
    const driverId = driverData._id;
    const driver = await Driver.findById(driverId).lean().select("-password");
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found." });
    }

    const creditWallet = await Credit.findOne({ driver: driver._id }).lean();

    // compute total distance (km) from completed rides
    const rides = await Ride.find({
      driver: driver._id,
      status: "completed",
    })
      .select("pickupLocation dropoffLocation")
      .lean();

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const haversineKm = (
      lat1: number,
      lon1: number,
      lat2: number,
      lon2: number
    ) => {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
          Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    let totalRideDistanceKm = 0;
    for (const r of rides) {
      const p = r?.pickupLocation;
      const d = r?.dropoffLocation;
      if (
        p &&
        d &&
        typeof p.lat === "number" &&
        typeof p.lng === "number" &&
        typeof d.lat === "number" &&
        typeof d.lng === "number"
      ) {
        totalRideDistanceKm += haversineKm(p.lat, p.lng, d.lat, d.lng);
      }
    }
    totalRideDistanceKm = Number(totalRideDistanceKm.toFixed(2));

    // compute duration on app in human-readable format
    // compute full duration on app
    const createdAt = (driver as any)?.createdAt
      ? new Date((driver as any).createdAt)
      : new Date();
    const now = new Date();

    let diffMs = now.getTime() - createdAt.getTime();

    // calculate each unit
    const msInHour = 1000 * 60 * 60;
    const msInDay = msInHour * 24;

    // total hours
    const totalHours = Math.floor(diffMs / msInHour);
    const hours = totalHours % 24;

    // total days
    const totalDays = Math.floor(diffMs / msInDay);
    const days = totalDays % 30;

    // months
    const months =
      (now.getFullYear() - createdAt.getFullYear()) * 12 +
      (now.getMonth() - createdAt.getMonth());

    // years
    const years = Math.floor(months / 12);
    const remMonths = months % 12;

    // build human-readable string
    let durationOnApp = "";
    if (years > 0) durationOnApp += `${years} year${years > 1 ? "s" : ""} `;
    if (remMonths > 0)
      durationOnApp += `${remMonths} month${remMonths > 1 ? "s" : ""} `;
    if (days > 0) durationOnApp += `${days} day${days > 1 ? "s" : ""} `;
    if (hours > 0 || durationOnApp === "")
      durationOnApp += `${hours} hour${hours > 1 ? "s" : ""}`;
    durationOnApp = durationOnApp.trim();

    res.status(200).json({
      success: true,
      message: "Driver details fetched successfully.",
      data: {
        ...driver,
        creditBalance: creditWallet ? creditWallet.balance : 0,
        creditTransactions: creditWallet ? creditWallet.transactions : [],
        totalRideDistanceKm,
        durationOnApp,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverData = req.user as IDriver;
    const driverId = driverData._id;
    const updateData: Partial<IDriver> = req.body;

    const { phone, email, licenseNumber, vehicleNumber } = req.body;

    const existingDriver = await Driver.findById(driverId);
    if (!existingDriver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found." });
    }

    // ✅ Unique validation (exclude self)
    if (phone || email || licenseNumber || vehicleNumber) {
      const duplicate = await Driver.findOne({
        _id: { $ne: driverId },
        $or: [
          phone ? { phone } : {},
          email ? { email } : {},
          vehicleNumber ? { vehicleNumber } : {},
        ],
      });

      if (duplicate) {
        let field = "";
        if (duplicate.email === email) field = "email";
        else if (duplicate.phone === phone) field = "phone";
        else if (duplicate.vehicleNumber === vehicleNumber)
          field = "vehicleNumber";

        return res.status(409).json({
          success: false,
          message: `Another driver with this ${field} already exists.`,
        });
      }
    }

    // ✅ Validate Vehicle Type
    if ((updateData as any).vehicleTypeId) {
      const vt = await VehicleType.findOne({
        _id: (updateData as any).vehicleTypeId,
        isActive: true,
      });
      if (!vt) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle type not found" });
      }
    }

    // ✅ Validate Vehicle
    if ((updateData as any).vehicleId) {
      const v = await Vehicle.findOne({
        _id: (updateData as any).vehicleId,
        isActive: true,
      });
      if (!v) {
        return res
          .status(404)
          .json({ success: false, message: "Vehicle not found" });
      }
    }

    if ((updateData as any).vehicleType) {
      delete (updateData as any).vehicleType;
    }

    // ✅ File Uploads
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.carDocument?.[0]) {
        updateData.carDocument = files.carDocument[0].path.replace(/\\/g, "/");
      }
      if (files.taxDocument?.[0]) {
        updateData.taxDocument = files.taxDocument[0].path.replace(/\\/g, "/");
      }
      if (files.profileImage?.[0]) {
        updateData.profileImage = files.profileImage[0].path.replace(
          /\\/g,
          "/"
        );
      }
      updateData.documents = {
        license: files.license?.[0]?.path.replace(/\\/g, "/"),
        aadhar: files.aadhar?.[0]?.path.replace(/\\/g, "/"),
        pan: files.pan?.[0]?.path.replace(/\\/g, "/"),
      };
    }

    const updatedDriver = await Driver.findByIdAndUpdate(driverId, updateData, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Driver details updated successfully.",
      data: updatedDriver,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `Duplicate ${field}. Please use a unique ${field}.`,
      });
    }
    next(error);
  }
};
