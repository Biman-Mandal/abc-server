import express from "express";
import {
  getMyProfile,
  sendOtp,
  updateProfile,
  verifyOtp,
} from "../controllers/auth.controller";
import { verifyToken } from "../middleware/verifyToken";
import { uploadSingle } from "../middleware/upload.middleware";

const router = express.Router();

// Public routes
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

// Protected routes (require JWT token)
router.get("/me", verifyToken, getMyProfile);
router.put(
  "/update-profile",
  verifyToken,
  uploadSingle("profilePicture", "user"),
  updateProfile
);

export default router;
