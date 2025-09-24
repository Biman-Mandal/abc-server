import express from "express";
import {
  calculateRidePrice,
} from "../controllers/user.controller";
import { auth } from "../middleware/auth";

const router = express.Router();

// All routes are protected and require JWT token
// The auth middleware should populate req.user with userId and email
router.post("/calculate-ride-price", auth, calculateRidePrice);

export default router;