import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../models/admin.model";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const verifyAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
      return;
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET) as {
      _id: string;
      email: string;
      role: string;
    };

    if (!decoded || decoded.role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Forbidden: Admin access required",
      });
      return;
    }

    // Check if admin actually exists in DB
    const admin = await Admin.findById(decoded._id);
    if (!admin) {
      res.status(404).json({
        success: false,
        message: "Admin not found",
      });
      return;
    }

    // Attach admin data to request
    req.user = {
      _id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
    };

    next();
  } catch (error) {
    console.error("Error in verifyAdmin middleware:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
    return;
  }
};
