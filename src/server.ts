import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import http from "http";
import { initSocket } from "./app/socket/socket";
import mongoDb from "./app/config/db";
import User from "./app/models/user.model";
import {Driver} from "./app/models/driver.model";
import Ride from "./app/models/ride.model";
import mongoose from "mongoose";

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const io = initSocket(server);

// ✅ Common function to restore latest ride
async function restoreLatestRide(socket: any, userId: string, isDriver: any) {
  try {
    // 🔹 Calculate 24 hours ago
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    // 🔹 Fetch latest active ride (only within last 24 hrs)
    const ride = await Ride.findOne(
      isDriver
        ? { driver: userId, status: { $in: ["accepted", "ongoing"] }, createdAt: { $gte: oneDayAgo } }
        : { user: userId, status: { $in: ["accepted", "ongoing"] }, createdAt: { $gte: oneDayAgo } }
    ).sort({ createdAt: -1 });

    if (ride) {
      const populatedRide = await ride.populate(
        isDriver
          ? { path: "user", select: "name phoneNumber profilePictureUrl" }
          : { path: "driver", select: "driverName vehicleModel vehicleNumber rating profileImage" }
      );

      // ✅ Send ride details back to THIS client
      socket.emit("restoreRide", populatedRide);
      console.log(`Restored ride sent to ${isDriver ? "driver" : "user"}: ${userId}`);
    } else {
      // no active ride, tell client explicitly
      socket.emit("restoreRide", null);
    }
  } catch (err) {
    console.error("Error restoring latest ride:", err);
    socket.emit("restoreRide", { error: "Failed to restore ride" });
  }
}

io.on("connection", async (socket) => {
  console.log(`🚀 New client connected: ${socket.id}`);

  const userId = socket.handshake.query.userId?.toString();
  const isDriver = socket.handshake.query.isDriver === "true";

  if (!userId || userId === "null" || userId === "undefined") {
    console.error(`❌ No valid userId provided. Disconnecting socket: ${socket.id}`);
    socket.disconnect();
    return;
  }

  try {
    // Validate Mongo ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`⚠️ Invalid userId (${userId}). Disconnecting socket: ${socket.id}`);
      socket.disconnect();
      return;
    }

    if (isDriver) {
      // Check if driver exists
      const driverExists = await Driver.exists({ _id: userId });
      if (!driverExists) {
        console.error(`❌ Driver ID ${userId} not found. Disconnecting socket: ${socket.id}`);
        socket.disconnect();
        return;
      }
    } else {
      // Check if user exists
      const userExists = await User.exists({ _id: userId });
      if (!userExists) {
        console.error(`❌ User ID ${userId} not found. Disconnecting socket: ${socket.id}`);
        socket.disconnect();
        return;
      }
    }

    // ✅ If all good, join socket room
    socket.join(userId);
    console.log(`✅ Socket ${socket.id} joined room ${userId}`);

    // Restore ride state
    await restoreLatestRide(socket, userId, isDriver);

    // Manual restore event
    socket.on("getRestoreRide", async () => {
      await restoreLatestRide(socket, userId, isDriver);
    });

    // Driver location updates
    socket.on("updateLocation", (data) => {
      socket.broadcast.emit("driverLocationUpdated", data);
    });

    // Ride request
    socket.on("rideRequest", (rideDetails) => {
      console.log("📦 Ride request received:", rideDetails);
    });

    // Disconnect event
    socket.on("disconnect", () => {
      console.log(`👋 Client disconnected: ${socket.id}`);
    });

  } catch (error) {
    console.error(`💥 Error in socket connection (${socket.id}):`, error);
    socket.disconnect();
  }
});


async function main() {
  try {
    await mongoDb();
    server.listen(PORT, () => {
      console.log(`SERVER IS RUNNING ON http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();
