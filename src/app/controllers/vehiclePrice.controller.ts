import { NextFunction, Request, Response } from "express";
import VehiclePrice from "../models/vehiclePrice.model";
import Vehicle from "../models/vehicle.model";

export const createVehiclePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { 
    vehicleId, 
    pricePerKm, 
    pricePerMile, 
    currency, 
    basePrice, 
    additionalCharges 
  } = req.body;

  if (!vehicleId) {
    return res.status(400).json({
      success: false,
      message: "Vehicle ID is required",
    });
  }

  if (!pricePerKm && !pricePerMile && !basePrice) {
    return res.status(400).json({
      success: false,
      message: "At least one pricing method (pricePerKm, pricePerMile, or basePrice) is required",
    });
  }

  try {
    // Verify vehicle exists
    const vehicle = await Vehicle.findOne({ 
      _id: vehicleId, 
      isActive: true 
    });

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const priceData: any = { 
      vehicleId,
      currency: currency || 'USD'
    };

    if (pricePerKm !== undefined) priceData.pricePerKm = pricePerKm;
    if (pricePerMile !== undefined) priceData.pricePerMile = pricePerMile;
    if (basePrice !== undefined) priceData.basePrice = basePrice;
    if (additionalCharges) priceData.additionalCharges = additionalCharges;

    const vehiclePrice = await VehiclePrice.create(priceData);

    // Populate vehicle information
    const populatedVehiclePrice = await VehiclePrice.findById(vehiclePrice._id)
      .populate({
        path: 'vehicleId',
        select: 'title fuelType',
        populate: {
          path: 'vehicleTypeId',
          select: 'name'
        }
      })
      .select("-__v");

    res.status(201).json({
      success: true,
      message: "Vehicle price created successfully",
      data: populatedVehiclePrice,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVehiclePrices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter = { isActive: true };
    
    const vehiclePrices = await VehiclePrice.find(filter)
      .populate({
        path: 'vehicleId',
        select: 'title fuelType',
        populate: {
          path: 'vehicleTypeId',
          select: 'name'
        }
      })
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Vehicle prices retrieved successfully",
      data: vehiclePrices,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehiclePriceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const vehiclePrice = await VehiclePrice.findOne({
      _id: id,
      isActive: true,
    })
    .populate({
      path: 'vehicleId',
      select: 'title fuelType',
      populate: {
        path: 'vehicleTypeId',
        select: 'name'
      }
    })
    .select("-__v");

    if (!vehiclePrice) {
      return res.status(404).json({
        success: false,
        message: "Vehicle price not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle price retrieved successfully",
      data: vehiclePrice,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehiclePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { 
    vehicleId, 
    pricePerKm, 
    pricePerMile, 
    currency, 
    basePrice, 
    additionalCharges, 
    isActive 
  } = req.body;

  try {
    const updateData: any = {};
    
    if (vehicleId) {
      // Verify vehicle exists
      const vehicle = await Vehicle.findOne({ 
        _id: vehicleId, 
        isActive: true 
      });

      if (!vehicle) {
        return res.status(404).json({
          success: false,
          message: "Vehicle not found",
        });
      }

      updateData.vehicleId = vehicleId;
    }
    
    if (pricePerKm !== undefined) updateData.pricePerKm = pricePerKm;
    if (pricePerMile !== undefined) updateData.pricePerMile = pricePerMile;
    if (currency) updateData.currency = currency;
    if (basePrice !== undefined) updateData.basePrice = basePrice;
    if (additionalCharges) updateData.additionalCharges = additionalCharges;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedVehiclePrice = await VehiclePrice.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
    .populate({
      path: 'vehicleId',
      select: 'title fuelType',
      populate: {
        path: 'vehicleTypeId',
        select: 'name'
      }
    })
    .select("-__v");

    if (!updatedVehiclePrice) {
      return res.status(404).json({
        success: false,
        message: "Vehicle price not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle price updated successfully",
      data: updatedVehiclePrice,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehiclePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    // Soft delete by setting isActive to false
    const deletedVehiclePrice = await VehiclePrice.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    .populate({
      path: 'vehicleId',
      select: 'title fuelType',
      populate: {
        path: 'vehicleTypeId',
        select: 'name'
      }
    })
    .select("-__v");

    if (!deletedVehiclePrice) {
      return res.status(404).json({
        success: false,
        message: "Vehicle price not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle price deleted successfully",
      data: deletedVehiclePrice,
    });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteVehiclePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const deletedVehiclePrice = await VehiclePrice.findByIdAndDelete(id);

    if (!deletedVehiclePrice) {
      return res.status(404).json({
        success: false,
        message: "Vehicle price not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle price permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getPricesByVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { vehicleId } = req.params;

  try {
    const prices = await VehiclePrice.find({
      vehicleId: vehicleId,
      isActive: true,
    })
    .populate({
      path: 'vehicleId',
      select: 'title fuelType',
      populate: {
        path: 'vehicleTypeId',
        select: 'name'
      }
    })
    .select("-__v")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Vehicle prices retrieved successfully",
      data: prices,
    });
  } catch (error) {
    next(error);
  }
};