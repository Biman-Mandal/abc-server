import { Request, Response } from "express";
import Rating from "../models/rating.model";
import mongoose from "mongoose";
import { calculateAverageRating } from "../utils/rating.util"; // the common function we created earlier

/**
 * Add a new rating
 * @route POST /api/ratings
 * @body { rating, comment?, rateable_type, rateable_id, ride_id? }
 */
export const addRating = async (req: Request, res: Response) => {
  try {
    const { rating, comment, rateable_type, rateable_id, ride_id } = req.body;

    // Basic validation
    if (!rating || !rateable_type || !rateable_id) {
      return res.status(400).json({
        success: false,
        message: "rating, rateable_type and rateable_id are required",
      });
    }

    // Ensure rateable_type is valid
    if (!["Driver", "User"].includes(rateable_type)) {
      return res.status(400).json({
        success: false,
        message: "rateable_type must be 'Driver' or 'User'",
      });
    }

    // Create rating
    const newRating = await Rating.create({
      rating,
      comment,
      rateable_type,
      rateable_id,
      ride_id,
    });

    return res.status(201).json({
      success: true,
      message: "Rating added successfully",
      data: newRating,
    });
  } catch (error: any) {
    console.error("Error adding rating:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding rating",
      error: error.message,
    });
  }
};

/**
 * Express route handler using the common function
 */
export const getAverageRating = async (req: Request, res: Response) => {
  try {
    const { type, id } = req.params;
    const data = await calculateAverageRating(type, id);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || "Server error while calculating average rating",
    });
  }
};
