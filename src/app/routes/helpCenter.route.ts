import express from "express";
import {
  createHelpCenter,
  getAllHelpCenter,
  getHelpCenterById,
  updateHelpCenter,
  deleteHelpCenter,
  permanentDeleteHelpCenter,
} from "../controllers/helpCenter.controller";
import { verifyToken } from "../middleware/verifyToken";
import { uploadSingle } from "../middleware/upload.middleware";

const router = express.Router();

// Public routes
router.get("/", getAllHelpCenter);
router.get("/:id", getHelpCenterById);

// Protected routes (require JWT token) - Admin only
router.post(
  "/",
  verifyToken,
  uploadSingle("logo", "helpCenter"),
  createHelpCenter
);

router.put(
  "/:id",
  verifyToken,
  uploadSingle("logo", "helpCenter"),
  updateHelpCenter
);

router.delete("/:id", verifyToken, deleteHelpCenter);
router.delete("/permanent/:id", verifyToken, permanentDeleteHelpCenter);

export default router;