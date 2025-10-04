import { NextFunction, Request, Response } from "express";
import Ride from "../models/ride.model";
import { getIoInstance } from "../socket/socket";
import { Iuser } from "../interfaces/user.interface";
import { IDriver } from "../interfaces/driver.interface";
import mongoose from "mongoose";
import { calculateAverageRating } from "../utils/rating.util"; // the common function we created earlier
import Rating from "../models/rating.model";

export const requestRide = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { pickupLocation, dropoffLocation, fare, estimatedTime } = req.body;
  const user = req.user as Iuser;

  if (!pickupLocation || !dropoffLocation) {
    res
      .status(400)
      .json({ message: "Pickup and dropoff locations are required" });
    return;
  }

  try {
    const newRide = new Ride({
      user: user._id,
      pickupLocation,
      dropoffLocation,
      fare,
      estimatedTime,
      status: "requested",
    });

    await newRide.save();

    const io = getIoInstance();
    io.emit("newRideRequest", newRide);

    res.status(201).json({
      success: true,
      message: "Ride requested successfully. Searching for drivers...",
      data: newRide,
    });
  } catch (error) {
    next(error);
  }
};

export const acceptRide = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rideId } = req.params;
  const driver = req.user as IDriver;

  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }
    if (ride.status !== "requested") {
      res.status(400).json({ message: "Ride is no longer available" });
      return;
    }

    ride.driver = (driver as any)._id;
    ride.status = "accepted";
    await ride.save();

    const populatedRide = await ride.populate({
      path: "driver",
      select: "driverName vehicleModel vehicleNumber rating profileImage",
    });

    const io = getIoInstance();
    io.to(ride.user.toString()).emit("rideAccepted", populatedRide);

    res.status(200).json({
      success: true,
      message: "Ride accepted successfully",
      data: populatedRide,
    });
  } catch (error) {
    next(error);
  }
};

export const getRideStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const ride = await Ride.findById(req.params.rideId)
      .populate("user", "name phoneNumber profilePictureUrl")
      .populate("driver", "driverName vehicleNumber profileImage rating");

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    res.status(200).json({ success: true, data: ride });
  } catch (error) {
    next(error);
  }
};

export const updateRideStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rideId } = req.params;
  const { status } = req.body;
  const validStatuses = ["ongoing", "completed"];

  if (!validStatuses.includes(status)) {
    res.status(400).json({ message: "Invalid status provided" });
    return;
  }

  try {
    const ride = await Ride.findById(rideId);
    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (
      (ride.status === "completed" && status !== "completed") ||
      (ride.status === "ongoing" && status !== "completed")
    ) {
      res.status(400).json({
        message: `Cannot change status from ${ride.status} to ${status}`,
      });
      return;
    }

    ride.status = status;
    await ride.save();

    const io = getIoInstance();
    const notificationData = { rideId: ride._id, status: ride.status, user_id: ride.user, driver_id: ride.driver };
    io.to(ride.user.toString()).emit("rideStatusUpdated", notificationData);
    if (ride.driver) {
      io.to(ride.driver.toString()).emit("rideStatusUpdated", notificationData);
    }

    res.status(200).json({
      success: true,
      message: `Ride status updated to ${status}`,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelRide = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { rideId } = req.params;
  const canceller = req.user as { role?: string; _id: any };
  try {
    const ride = await Ride.findById(rideId);

    if (!ride) {
      res.status(404).json({ message: "Ride not found" });
      return;
    }

    if (ride.status === "completed" || ride.status === "cancelled") {
      res.status(400).json({ message: "This ride cannot be cancelled" });
      return;
    }

    ride.status = "cancelled";
    await ride.save();

    const io = getIoInstance();
    const notificationData = {
      rideId: ride._id,
      status: "cancelled",
      cancelledBy: canceller.role || "user",
    };

    if (ride.driver) {
      io.to(ride.driver.toString()).emit("rideCancelled", notificationData);
      io.to(ride.user.toString()).emit("rideCancelled", notificationData);
    } else {
      io.to(ride.user.toString()).emit("rideCancelled", notificationData);
      io.emit("removeRideRequest", { rideId: ride._id });
    }

    res.status(200).json({ success: true, message: "Ride has been cancelled" });
  } catch (error) {
    next(error);
  }
};

export const rideHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user as { role?: string; _id: any };
  const role = req.role as { role: any };

  try {
    let rides;
    const { status } = req.query;

    const query: any = {};
    if (role === "user") {
      query.user = user._id;
    } else if (role === "driver") {
      query.driver = user._id;
    } else {
      return res.status(403).json({ message: "Unauthorized role" });
    }

    if (status) {
      query.status = status;
    }

    rides = await Ride.find(query)
      .sort({ createdAt: -1 })
      .populate(
        role === "user"
          ? { path: "driver", select: "driverName vehicleModel vehicleNumber profileImage" }
          : { path: "user", select: "name phoneNumber profilePictureUrl" }
      );

    // Assuming 'rides' is an array of Mongoose documents
    const ridesWithRating = await Promise.all(
      rides.map(async (ride: any) => {
        const rideObj = ride.toObject();

        // Determine whose rating to fetch
        const rateableType = role === "user" ? "Driver" : "User";
        const rateableId = role === "user" ? rideObj.driver._id : rideObj.user._id;

        // Fetch rating for this ride by the other party
        const ratingDoc = await Rating.findOne({
          ride_id: rideObj._id,
          rateable_type: rateableType,
          rateable_id: rateableId,
        });

        rideObj.rating = ratingDoc?.rating?.toFixed(1) || "0.0";

        return rideObj;
      })
    );


    return res.status(200).json({
      success: true,
      message: "Ride History Fetched Successfully.",
      data: ridesWithRating,
      count: ridesWithRating.length,
    });
  } catch (error) {
    next(error);
  }
};
