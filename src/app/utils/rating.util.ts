import mongoose from "mongoose";
import Rating from "../models/rating.model";

export const calculateAverageRating = async (type: string, id: string) => {
  if (!["Driver", "User"].includes(type)) {
    throw new Error("type must be 'Driver' or 'User'");
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid rateable_id");
  }

  const result = await Rating.aggregate([
    {
      $match: {
        rateable_type: type,
        rateable_id: new mongoose.Types.ObjectId(id),
      },
    },
    {
      $group: {
        _id: "$rateable_id",
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
      },
    },
  ]);

  if (!result.length) {
    return { averageRating: 0, totalRatings: 0 };
  }

  return result[0];
};