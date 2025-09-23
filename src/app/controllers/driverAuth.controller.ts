import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { Driver } from "../models/driver.model";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
}

const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as jwt.SignOptions["expiresIn"];

export const driverLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    res
      .status(400)
      .json({ success: false, message: "Phone and password are required" });
    return;
  }

  try {
    const driver = await Driver.findOne({ phone }).select("+password");

    if (!driver) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isPasswordCorrect = await driver.comparePassword(password);

    if (!isPasswordCorrect) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign({ _id: driver._id, role: "driver" }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    const { password: _, ...driverData } = driver.toObject();

    res.status(200).json({
      success: true,
      message: "Driver login successful",
      token,
      driver: driverData,
    });
  } catch (error) {
    next(error);
  }
};
