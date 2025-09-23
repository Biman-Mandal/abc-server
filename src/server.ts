import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import http from "http";
import { initSocket } from "./app/socket/socket";
import mongoDb from "./app/config/db";

const PORT = process.env.PORT || 8080;

const server = http.createServer(app);

const io = initSocket(server);

io.on("connection", (socket) => {
  console.log(`New client connected: ${socket.id}`);

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
