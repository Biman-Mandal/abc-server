import express from "express";
import { verifyToken } from "../middleware/verifyToken";
import { addRating, getAverageRating } from "../controllers/rating.controller";

const router = express.Router();

// Public route to get average rating for a Driver or User
router.get("/average/:type/:id", getAverageRating);

// Protected route to add a rating (requires JWT token)
router.post("/", verifyToken, addRating);

export default router;
