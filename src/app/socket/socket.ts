import { Server } from "socket.io";
import http from "http";

let io: Server;

export const initSocket = (httpServer: http.Server): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  return io;
};

export const getIoInstance = (): Server => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
