import { NextFunction, Request, Response } from "express";
import Vehicle from "../models/vehicle.model";
import VehicleType from "../models/vehicleType.model";

export const createVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, vehicleTypeId, fuelType, ownership } = req.body;

  if (!title || !vehicleTypeId) {
    return res.status(400).json({
      success: false,
      message: "Title and vehicle type are required",
    });
  }

  try {
    // Verify vehicle type exists
    const vehicleType = await VehicleType.findOne({ 
      _id: vehicleTypeId, 
      isActive: true 
    });

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    const vehicleData: any = { 
      title: title.trim(), 
      vehicleTypeId,
      fuelType: fuelType || 'diesel'
    };

    if (ownership) vehicleData.ownership = ownership.trim();

    const vehicle = await Vehicle.create(vehicleData);

    // Populate vehicle type information
    const populatedVehicle = await Vehicle.findById(vehicle._id)
      .populate('vehicleTypeId', 'name')
      .select("-__v");

    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: populatedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVehicles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let filter: Record<string, any> = { isActive: true };
    if (req.query.vehicleType === "all") {
      filter = {};
    }
    const vehicles = await Vehicle.find(filter)
      .populate('vehicleTypeId', 'name')
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const vehicle = await Vehicle.findOne({
      _id: id,
      isActive: true,
    })
    .populate('vehicleTypeId', 'name')
    .select("-__v");

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle retrieved successfully",
      data: vehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { title, vehicleTypeId, fuelType, ownership, isActive } = req.body;

  try {
    const updateData: any = {};
    
    if (title) updateData.title = title.trim();
    
    if (vehicleTypeId) {
      // Verify vehicle type exists
      const vehicleType = await VehicleType.findOne({ 
        _id: vehicleTypeId, 
        isActive: true 
      });

      if (!vehicleType) {
        return res.status(404).json({
          success: false,
          message: "Vehicle type not found",
        });
      }

      updateData.vehicleTypeId = vehicleTypeId;
    }
    
    if (fuelType) updateData.fuelType = fuelType;
    if (ownership !== undefined) updateData.ownership = ownership ? ownership.trim() : ownership;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    )
    .populate('vehicleTypeId', 'name')
    .select("-__v");

    if (!updatedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle updated successfully",
      data: updatedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    // Soft delete by setting isActive to false
    const deletedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    )
    .populate('vehicleTypeId', 'name')
    .select("-__v");

    if (!deletedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle deleted successfully",
      data: deletedVehicle,
    });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteVehicle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};

export const getVehiclesByType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { typeId } = req.params;

  try {
    const vehicles = await Vehicle.find({
      vehicleTypeId: typeId,
      isActive: true,
    })
    .populate('vehicleTypeId', 'name')
    .select("-__v")
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: vehicles,
    });
  } catch (error) {
    next(error);
  }
};