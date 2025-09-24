import express from "express";
import {
  createVehicleType,
  getAllVehicleTypes,
  getVehicleTypeById,
  updateVehicleType,
  deleteVehicleType,
  permanentDeleteVehicleType,
} from "../controllers/vehicleType.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Public routes
router.get("/", getAllVehicleTypes);
router.get("/:id", getVehicleTypeById);

// Protected routes (require JWT token) - Admin only
router.post("/", verifyToken, createVehicleType);
router.put("/:id", verifyToken, updateVehicleType);
router.delete("/:id", verifyToken, deleteVehicleType);
router.delete("/permanent/:id", verifyToken, permanentDeleteVehicleType);

export default router;