import express from "express";
import {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  permanentDeleteVehicle,
  getVehiclesByType,
} from "../controllers/vehicle.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Public routes
router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.get("/type/:typeId", getVehiclesByType);

// Protected routes (require JWT token) - Admin only
router.post("/", verifyToken, createVehicle);
router.put("/:id", verifyToken, updateVehicle);
router.delete("/:id", verifyToken, deleteVehicle);
router.delete("/permanent/:id", verifyToken, permanentDeleteVehicle);

export default router;