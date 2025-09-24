import express from "express";
import {
  getAllNotifications,
  deleteNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
} from "../controllers/notification.controller";
import { auth } from "../middleware/auth";
import { uploadSingle } from "../middleware/upload.middleware";

const router = express.Router();

// All routes are protected and require JWT token
// The auth middleware should populate req.user with userId and email

// Get notifications with optional filtering
// Query params: ?filter=read | ?filter=unread | no filter for all
router.post("/", auth, uploadSingle("image", "notifications"), createNotification);

router.get("/", auth, getAllNotifications);

// Mark specific notification as read
router.put("/:id/read", auth, markNotificationAsRead);

// Mark all notifications as read
router.put("/mark-all-read", auth, markAllNotificationsAsRead);

// Delete notification
router.delete("/:id", auth, deleteNotification);

export default router;