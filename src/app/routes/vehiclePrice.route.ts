import express from "express";
import {
  createVehiclePrice,
  getAllVehiclePrices,
  getVehiclePriceById,
  updateVehiclePrice,
  deleteVehiclePrice,
  permanentDeleteVehiclePrice,
  getPricesByVehicle,
} from "../controllers/vehiclePrice.controller";
import { verifyToken } from "../middleware/verifyToken";

const router = express.Router();

// Public routes
router.get("/", getAllVehiclePrices);
router.get("/:id", getVehiclePriceById);
router.get("/vehicle/:vehicleId", getPricesByVehicle);

// Protected routes (require JWT token) - Admin only
router.post("/", verifyToken, createVehiclePrice);
router.put("/:id", verifyToken, updateVehiclePrice);
router.delete("/:id", verifyToken, deleteVehiclePrice);
router.delete("/permanent/:id", verifyToken, permanentDeleteVehiclePrice);

export default router;