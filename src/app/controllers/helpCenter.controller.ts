import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import HelpCenter from "../models/helpCenter.model";

export const createHelpCenter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: "Title and description are required",
    });
  }

  try {
    const helpCenterData: any = { title, description };

    if (req.file) {
      helpCenterData.logo = req.file.path.replace(/\\/g, "/");
    }

    const helpCenter = await HelpCenter.create(helpCenterData);

    res.status(201).json({
      success: true,
      message: "Help center item created successfully",
      data: helpCenter,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllHelpCenter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const filter = { isActive: true };
    
    const helpCenterItems = await HelpCenter.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Help center items retrieved successfully",
      data: helpCenterItems,
    });
  } catch (error) {
    next(error);
  }
};

export const getHelpCenterById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const helpCenter = await HelpCenter.findOne({
      _id: id,
      isActive: true,
    }).select("-__v");

    if (!helpCenter) {
      return res.status(404).json({
        success: false,
        message: "Help center item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Help center item retrieved successfully",
      data: helpCenter,
    });
  } catch (error) {
    next(error);
  }
};

export const updateHelpCenter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { title, description, isActive } = req.body;

  try {
    const updateData: any = {};
    
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    if (req.file) {
      updateData.logo = req.file.path.replace(/\\/g, "/");
    }

    const updatedHelpCenter = await HelpCenter.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedHelpCenter) {
      return res.status(404).json({
        success: false,
        message: "Help center item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Help center item updated successfully",
      data: updatedHelpCenter,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHelpCenter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    // Soft delete by setting isActive to false
    const deletedHelpCenter = await HelpCenter.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    ).select("-__v");

    if (!deletedHelpCenter) {
      return res.status(404).json({
        success: false,
        message: "Help center item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Help center item deleted successfully",
      data: deletedHelpCenter,
    });
  } catch (error) {
    next(error);
  }
};

export const permanentDeleteHelpCenter = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const deletedHelpCenter = await HelpCenter.findByIdAndDelete(id);

    if (!deletedHelpCenter) {
      return res.status(404).json({
        success: false,
        message: "Help center item not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Help center item deleted",
    });
  } catch (error) {
    next(error);
  }
};