import type { Request, Response, NextFunction, Express } from "express";
import type { IDriver } from "../interfaces/driver.interface";
import { Driver } from "../models/driver.model";
import Credit from "../models/credit.model";

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
    const driver = await Driver.findById(driverId)
      .lean()
      .select("-password");
    if (!driver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found." });
    }

    const creditWallet = await Credit.findOne({ driver: driver._id }).lean();

    res.status(200).json({
      success: true,
      message: "Driver details fetched successfully.",
      data: {
        ...driver,
        creditBalance: creditWallet ? creditWallet.balance : 0,
        creditTransactions: creditWallet ? creditWallet.transactions : [],
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