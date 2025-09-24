import { NextFunction, Request, Response } from "express";
import VehicleType from "../models/vehicleType.model";

export const createVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Vehicle type name is required",
    });
  }

  try {
    const existingVehicleType = await VehicleType.findOne({ 
      name: name.trim(),
      isActive: true 
    });

    if (existingVehicleType) {
      return res.status(409).json({
        success: false,
        message: "Vehicle type with this name already exists",
      });
    }

    const vehicleType = await VehicleType.create({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: "Vehicle type created successfully",
      data: vehicleType,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllVehicleTypes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filter = { isActive: true };
    
    const vehicleTypes = await VehicleType.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Vehicle types retrieved successfully",
      data: vehicleTypes,
    });
  } catch (error) {
    next(error);
  }
};

export const getVehicleTypeById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const vehicleType = await VehicleType.findOne({
      _id: id,
      isActive: true,
    }).select("-__v");

    if (!vehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle type retrieved successfully",
      data: vehicleType,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name, isActive } = req.body;

  try {
    const updateData: any = {};
    
    if (name) {
      // Check for duplicate name
      const existingVehicleType = await VehicleType.findOne({ 
        name: name.trim(),
        _id: { $ne: id },
        isActive: true 
      });

      if (existingVehicleType) {
        return res.status(409).json({
          success: false,
          message: "Vehicle type with this name already exists",
        });
      }

      updateData.name = name.trim();
    }
    
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedVehicleType = await VehicleType.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedVehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle type updated successfully",
      data: updatedVehicleType,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    // Soft delete by setting isActive to false
    const deletedVehicleType = await VehicleType.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-__v");

    if (!deletedVehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle type deleted successfully",
      data: deletedVehicleType,
    });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteVehicleType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const deletedVehicleType = await VehicleType.findByIdAndDelete(id);

    if (!deletedVehicleType) {
      return res.status(404).json({
        success: false,
        message: "Vehicle type not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Vehicle type permanently deleted",
    });
  } catch (error) {
    next(error);
  }
};