import { NextFunction, Request, Response } from "express";
import SafetyToolkit from "../models/safetyToolkit.model";

export const createSafetyToolkit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description, image } = req.body;
    const safetyToolkit: any = { title, description };

    if (req.file) {
      safetyToolkit.image = req.file.path.replace(/\\/g, "/");
    }
    const safetyToolkitResponse = await SafetyToolkit.create(safetyToolkit);

    res.status(201).json({
      success: true,
      message: "Safety toolkit created successfully",
      data: safetyToolkitResponse,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllSafetyToolkits = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const search = req.query.search as string;

    let query: any = {};

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      };
    }

    const safetyToolkits = await SafetyToolkit.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Safety toolkits retrieved successfully",
      data: safetyToolkits,
    });
  } catch (error) {
    next(error);
  }
};

export const getSafetyToolkitById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const safetyToolkit = await SafetyToolkit.findById(id).select("-__v");

    if (!safetyToolkit) {
      return res.status(404).json({
        success: false,
        message: "Safety toolkit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Safety toolkit retrieved successfully",
      data: safetyToolkit,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSafetyToolkit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { title, description, image } = req.body;

  try {
    const updateData: any = {};
    
    if (title !== undefined) updateData.title = title || null;
    if (description !== undefined) updateData.description = description || null;
    if (image !== undefined) updateData.image = image;

    const updatedSafetyToolkit = await SafetyToolkit.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    if (!updatedSafetyToolkit) {
      return res.status(404).json({
        success: false,
        message: "Safety toolkit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Safety toolkit updated successfully",
      data: updatedSafetyToolkit,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSafetyToolkit = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;

  try {
    const deletedSafetyToolkit = await SafetyToolkit.findByIdAndDelete(id);

    if (!deletedSafetyToolkit) {
      return res.status(404).json({
        success: false,
        message: "Safety toolkit not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Safety toolkit deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};