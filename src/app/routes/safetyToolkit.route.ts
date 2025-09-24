import express from "express";
import {
  createSafetyToolkit,
  deleteSafetyToolkit,
  getAllSafetyToolkits,
  getSafetyToolkitById,
  updateSafetyToolkit,
} from "../controllers/safetyToolkit.controller";
import { uploadSingle } from "../middleware/upload.middleware";

const router = express.Router();

// Public routes - no authentication required
router.post("/", uploadSingle("image", "safetyToolkit"), createSafetyToolkit);
router.get("/", getAllSafetyToolkits);
router.get("/:id", getSafetyToolkitById);
router.put("/:id", updateSafetyToolkit);
router.delete("/:id", deleteSafetyToolkit);

export default router;
