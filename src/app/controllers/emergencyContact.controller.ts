import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import EmergencyContact from "../models/emergencyContact.model";
import { Iuser } from "../interfaces/user.interface";

export const createEmergencyContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, phone, email } = req.body;
  const user = req.user as Iuser;
  const userId = user._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
    });
  }

  if (!phone && !email) {
    return res.status(400).json({
      success: false,
      message: "At least one contact method (phone or email) is required",
    });
  }

  try {
    const emergencyContact = await EmergencyContact.create({
      user_id: userId,
      name,
      phone: phone || null,
      email: email || null,
    });

    res.status(201).json({
      success: true,
      message: "Emergency contact created successfully",
      data: emergencyContact,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEmergencyContacts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as Iuser;
  const userId = user._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  try {
    // Only get emergency contacts for the authenticated user
    const emergencyContacts = await EmergencyContact.find({ user_id: userId })
      .select("-__v")
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      message: "Emergency contacts retrieved successfully",
      data: emergencyContacts,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmergencyContactById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = req.user as Iuser;
  const userId = user._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  try {
    // Only get emergency contact if it belongs to the authenticated user
    const emergencyContact = await EmergencyContact.findOne({
      _id: id,
      user_id: userId,
    }).select("-__v");

    if (!emergencyContact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Emergency contact retrieved successfully",
      data: emergencyContact,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmergencyContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const { name, phone, email } = req.body;
  const user = req.user as Iuser;
  const userId = user._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  try {
    const updateData: any = {};
    
    if (name) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone || null;
    if (email !== undefined) updateData.email = email || null;

    // Check if emergency contact exists and belongs to the authenticated user
    const existingContact = await EmergencyContact.findOne({
      _id: id,
      user_id: userId,
    });

    if (!existingContact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found or access denied",
      });
    }

    // Check if at least one contact method will remain after update
    const finalPhone = phone !== undefined ? phone : existingContact.phone;
    const finalEmail = email !== undefined ? email : existingContact.email;

    if (!finalPhone && !finalEmail) {
      return res.status(400).json({
        success: false,
        message: "At least one contact method (phone or email) is required",
      });
    }

    const updatedEmergencyContact = await EmergencyContact.findOneAndUpdate(
      { _id: id, user_id: userId },
      updateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-__v");

    res.status(200).json({
      success: true,
      message: "Emergency contact updated successfully",
      data: updatedEmergencyContact,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteEmergencyContact = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.params;
  const user = req.user as Iuser;
  const userId = user._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }

  try {
    // Only delete emergency contact if it belongs to the authenticated user
    const deletedEmergencyContact = await EmergencyContact.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!deletedEmergencyContact) {
      return res.status(404).json({
        success: false,
        message: "Emergency contact not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Emergency contact deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};