import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import { IDriver } from "../../interfaces/driver.interface";
import { Driver } from "../../models/driver.model";
import Credit from "../../models/credit.model";

export const createDriverByAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverData: Partial<IDriver> = req.body;

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

    const newDriver = new Driver(driverData);
    await newDriver.save();

    const creditWallet = new Credit({
      driver: newDriver._id,
      balance: 0,
      transactions: [],
    });
    await creditWallet.save();

    res.status(201).json({
      success: true,
      message:
        "Driver created successfully and credit wallet has been activated.",
      data: newDriver,
    });
  } catch (error) {
    next(error);
  }
};

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
          vehicleType: 1,
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
      res.status(404).json({ success: false, message: "Driver not found." });
      return;
    }

    const creditWallet = await Credit.findOne({ driver: driver._id }).lean();

    const responseData = {
      ...driver,
      creditBalance: creditWallet ? creditWallet.balance : 0,
      creditTransactions: creditWallet ? creditWallet.transactions : [],
    };

    res.status(200).json({
      success: true,
      message: "Driver details fetched successfully.",
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const updateData: Partial<IDriver> = req.body;

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

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedDriver) {
      res.status(404).json({ success: false, message: "Driver not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Driver details updated successfully.",
      data: updatedDriver,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDriverById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const deletedDriver = await Driver.findByIdAndDelete(req.params.id);
    if (!deletedDriver) {
      res.status(404).json({ success: false, message: "Driver not found." });
      return;
    }

    await Credit.deleteOne({ driver: deletedDriver._id });

    res.status(200).json({
      success: true,
      message: "Driver and their credit wallet have been deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const addCreditsToDriver = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverId = req.params.id;
    const { amount } = req.body;

    if (typeof amount !== "number" || amount <= 0) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid credit amount.",
      });
      return;
    }

    let creditWallet = await Credit.findOne({ driver: driverId });

    if (!creditWallet) {
      const driverExists = await Driver.findById(driverId);
      if (!driverExists) {
        res.status(404).json({ success: false, message: "Driver not found." });
        return;
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

export const getCreditHistoryByDriverId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const driverId = req.params.id;
    const creditWallet = await Credit.findOne({ driver: driverId }).lean();

    if (!creditWallet) {
      res.status(404).json({
        success: false,
        message: "No credit wallet found for this driver.",
      });
      return;
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
