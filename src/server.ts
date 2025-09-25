import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import http from "http";
import { initSocket } from "./app/socket/socket";
import mongoDb from "./app/config/db";
import User from "./app/models/user.model";
import {Driver} from "./app/models/driver.model";

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const io = initSocket(server);

io.on("connection", async (socket) => {
  console.log(`New client connected: ${socket.id}`);
  const userId = socket.handshake.query.userId as string;
  const isDriver = socket.handshake.query.isDriver as string;
  if (!userId) {
    console.log("No userId provided. Disconnecting socket:", socket.id);
    socket.disconnect();
    return;
  }

  if(isDriver){
    // Check if user exists in DB
    const driverExits = await Driver.exists({ _id: userId });
    if (!driverExits) {
      console.log(
        `Driver ID ${userId} does not exist. Disconnecting socket:`,
        socket.id
      );
      socket.disconnect();
      return;
    }
  }else{
    // Check if user exists in DB
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      console.log(
        `User ID ${userId} does not exist. Disconnecting socket:`,
        socket.id
      );
      socket.disconnect();
      return;
    }
  }
  socket.join(userId);
  socket.on("updateLocation", (data) => {
    socket.broadcast.emit("driverLocationUpdated", data);
  });

  socket.on("rideRequest", (rideDetails) => {
    console.log("Ride request received:", rideDetails);
  });

  socket.on("disconnect", () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
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
