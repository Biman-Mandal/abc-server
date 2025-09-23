import express from "express";
import {
  requestRide,
  acceptRide,
  getRideStatus,
  updateRideStatus,
  cancelRide,
} from "../controllers/ride.controller";
import { auth } from "../middleware/auth";

const rideRouter = express.Router();

rideRouter.post("/request", auth, requestRide);

rideRouter.post("/:rideId/accept", auth, acceptRide);

rideRouter.get("/:rideId/status", auth, getRideStatus);

rideRouter.patch("/:rideId/update-status", auth, updateRideStatus);

rideRouter.post("/:rideId/cancel", auth, cancelRide);

export default rideRouter;
