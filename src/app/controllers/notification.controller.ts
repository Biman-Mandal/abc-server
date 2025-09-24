import { NextFunction, Request, Response } from "express";
import Notification from "../models/notification.model";
import { Iuser } from "../interfaces/user.interface";

// Create notification
export const createNotification = async (
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
    const { title, description, type } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and message are required",
      });
    }

    const notification = new Notification({
      user_id: userId,
      title,
      description,
      type: type || "general", // default type
      is_read: 0,
    });

    await notification.save();

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as Iuser;
  const userId = user._id;
  const { filter } = req.query; // 'read', 'unread', or undefined for all

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required",
    });
  }
  try {
    const query: any = { user_id: userId };
    if (filter == 'read') {
      query.is_read = 1;
    } else if (filter == 'unread') {
      query.is_read = 0;
    }

    const notifications = await Notification.find(query)
      .select("-__v")
      .sort({ createdAt: -1 });

    let message = "Notifications retrieved successfully";
    if (filter == 'read') {
      message = "Read notifications retrieved successfully";
    } else if (filter == 'unread') {
      message = "Unread notifications retrieved successfully";
    }

    res.status(200).json({
      success: true,
      message,
      data: notifications,
      count: notifications.length,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
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
    // Only update notification if it belongs to the authenticated user
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: id, user_id: userId },
      { is_read: 1 },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!updatedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read successfully",
      data: updatedNotification,
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
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
    // Mark all unread notifications as read for the authenticated user
    const result = await Notification.updateMany(
      { user_id: userId, is_read: 0 },
      { is_read: 1 }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (
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
    // Only delete notification if it belongs to the authenticated user
    const deletedNotification = await Notification.findOneAndDelete({
      _id: id,
      user_id: userId,
    });

    if (!deletedNotification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};