import type { Request, Response, NextFunction, Express } from "express";
import mongoose from "mongoose";
import type { IDriver } from "../../interfaces/driver.interface";
import { Driver } from "../../models/driver.model";
import Credit from "../../models/credit.model";
import Vehicle from "../../models/vehicle.model";
import VehicleType from "../../models/vehicleType.model";

/**
 * ✅ CREATE DRIVER (Admin)
 */
export const createDriverByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverData: Partial<IDriver> = req.body;

    const {
      vehicleTypeId,
      vehicleId,
      phone,
      email,
      licenseNumber,
      vehicleNumber,
    } = req.body as {
      vehicleTypeId?: string;
      vehicleId?: string;
      phone?: string;
      email?: string;
      licenseNumber?: string;
      vehicleNumber?: string;
    };

    // ✅ Check required vehicle fields
    if (!vehicleTypeId || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: "vehicleTypeId and vehicleId are required",
      });
    }

    // ✅ Unique validation (email, phone, licenseNumber, vehicleNumber)
    const existingDriver = await Driver.findOne({
      $or: [
        email ? { email } : {},
        phone ? { phone } : {},
        vehicleNumber ? { vehicleNumber } : {},
      ],
    });
    if (existingDriver) {
      let field = "";
      if (existingDriver.email === email) field = "email";
      else if (existingDriver.phone === phone) field = "phone";
      else if (existingDriver.vehicleNumber === vehicleNumber)
        field = "vehicleNumber";
      return res.status(409).json({
        success: false,
        message: `Driver with this ${field} already exists.`,
      });
    }

    // ✅ Validate Vehicle Type
    const vt = await VehicleType.findOne({
      _id: vehicleTypeId,
      isActive: true,
    });
    if (!vt) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    // ✅ Validate Vehicle
    const v = await Vehicle.findOne({ _id: vehicleId, isActive: true });
    if (!v) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    driverData.vehicleTypeId = new mongoose.Types.ObjectId(
      vehicleTypeId
    ) as any;
    driverData.vehicleId = new mongoose.Types.ObjectId(vehicleId) as any;

    if ((driverData as any).vehicleType) {
      delete (driverData as any).vehicleType;
    }

    // ✅ File Uploads
    if (req.files) {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (files.carDocument?.[0]) {
        driverData.carDocument = files.carDocument[0].path.replace(/\\/g, "/");
      }
      if (files.taxDocument?.[0]) {
        driverData.taxDocument = files.taxDocument[0].path.replace(/\\/g, "/");
      }
      if (files.profileImage?.[0]) {
        driverData.profileImage = files.profileImage[0].path.replace(
          /\\/g,
          "/"
        );
      }
      driverData.documents = {
        license: files.license?.[0]?.path.replace(/\\/g, "/"),
        aadhar: files.aadhar?.[0]?.path.replace(/\\/g, "/"),
        pan: files.pan?.[0]?.path.replace(/\\/g, "/"),
      };
    }

    // ✅ Create Driver
    const newDriver = new Driver(driverData);
    await newDriver.save();

    // ✅ Create Credit Wallet
    const creditWallet = new Credit({
      driver: newDriver._id,
      balance: 0,
      transactions: [],
    });
    await creditWallet.save();

    res.status(201).json({
      success: true,
      message: "Driver created successfully and credit wallet activated.",
      data: newDriver,
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

/**
 * ✅ GET ALL DRIVERS
 */
export const getAllDrivers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const drivers = await Driver.aggregate([
      {
        $lookup: {
          from: "credits",
          localField: "_id",
          foreignField: "driver",
          as: "creditInfo",
        },
      },
      {
        $unwind: {
          path: "$creditInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          driverName: 1,
          phone: 1,
          vehicleTypeId: 1,
          vehicleId: 1,
          isApproved: 1,
          isBanned: 1,
          isOnline: 1,
          createdAt: 1,
          creditBalance: { $ifNull: ["$creditInfo.balance", 0] },
          vehicleNumber: 1,
          totalEarnings: 1,
          profileImage: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Driver list fetched successfully.",
      data: drivers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ GET DRIVER BY ID
 */
export const getDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driver = await Driver.findById(req.params.id)
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

/**
 * ✅ UPDATE DRIVER BY ID
 */
export const updateDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverId = req.params.id;
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

/**
 * ✅ DELETE DRIVER
 */
export const deleteDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
    if (!deletedDriver) {
      return res
        .status(404)
        .json({ success: false, message: "Driver not found." });
    }

    await Credit.deleteOne({ driver: deletedDriver._id });

    res.status(200).json({
      success: true,
      message: "Driver and their credit wallet deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ ADD CREDITS TO DRIVER
 */
export const addCreditsToDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverId = req.params.id;
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid credit amount.",
      });
    }

    let creditWallet = await Credit.findOne({ driver: driverId });

    if (!creditWallet) {
      const driverExists = await Driver.findById(driverId);
      if (!driverExists) {
        return res
          .status(404)
          .json({ success: false, message: "Driver not found." });
      }

      creditWallet = new Credit({
        driver: driverId,
        balance: 0,
        transactions: [],
      });
    }

    creditWallet.balance += amount;
    creditWallet.transactions.push({
      amount: amount,
      type: "add_credit",
      timestamp: new Date(),
    });

    await creditWallet.save();

    res.status(200).json({
      success: true,
      message: `${amount} credits have been added successfully.`,
      data: creditWallet,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ GET DRIVER CREDIT HISTORY
 */
export const getCreditHistoryByDriverId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverId = req.params.id;
    const creditWallet = await Credit.findOne({ driver: driverId }).lean();

    if (!creditWallet) {
      return res.status(404).json({
        success: false,
        message: "No credit wallet found for this driver.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Credit history fetched successfully.",
      data: creditWallet.transactions,
    });
  } catch (error) {
    next(error);
  }
};
