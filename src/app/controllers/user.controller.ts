import { Request, Response, NextFunction } from "express";
import Vehicle from "../models/vehicle.model";
import VehiclePrice from "../models/vehiclePrice.model";
import axios from "axios";

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY as string;

export const calculateRidePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng, vehicleId } = req.body;

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng || !vehicleId) {
      return res.status(400).json({
        success: false,
        message: "pickupLat, pickupLng, dropoffLat, dropoffLng and vehicleId are required",
      });
    }

    // 1. Get distance from Google Maps Distance Matrix API
    const googleUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${pickupLat},${pickupLng}&destinations=${dropoffLat},${dropoffLng}&key=${GOOGLE_API_KEY}`;

    const { data: googleRes } = await axios.get(googleUrl);

    if (!googleRes.rows[0].elements[0].distance) {
      return res.status(400).json({
        success: false,
        message: "Could not calculate distance from Google Maps API",
      });
    }

    const distanceMeters = googleRes.rows[0].elements[0].distance.value; // in meters
    const distanceKm = distanceMeters / 1000;
    const distanceMiles = distanceKm * 0.621371;

    // 2. Fetch Vehicle & VehiclePrice
    const vehicle = await Vehicle.findById(vehicleId)
      .populate("vehicleTypeId")
      .lean();

    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found",
      });
    }

    const vehiclePrice = await VehiclePrice.findOne({ vehicleId, isActive: true }).lean();
    if (!vehiclePrice) {
      return res.status(404).json({
        success: false,
        message: "Vehicle price not found",
      });
    }

    // 3. Calculate total price
    let totalPrice = 0;

    // Base price
    totalPrice += vehiclePrice.basePrice || 0;

    // Distance price
    if (vehiclePrice.pricePerKm) {
      totalPrice += vehiclePrice.pricePerKm * distanceKm;
    } else if (vehiclePrice.pricePerMile) {
      totalPrice += vehiclePrice.pricePerMile * distanceMiles;
    }

    // Additional charges
    if (vehiclePrice.additionalCharges && vehiclePrice.additionalCharges.length > 0) {
      vehiclePrice.additionalCharges.forEach((charge) => {
        if (charge.type === "fixed") {
          totalPrice += charge.amount;
        } else if (charge.type === "percentage") {
          totalPrice += (totalPrice * charge.amount) / 100;
        }
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        vehicle,
        vehiclePrice,
        distance: {
          km: distanceKm.toFixed(2),
          miles: distanceMiles.toFixed(2),
        },
        totalPrice: totalPrice.toFixed(2),
        currency: vehiclePrice.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};
