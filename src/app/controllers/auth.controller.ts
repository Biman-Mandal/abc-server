import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/user.model";
import path from "path";
import { generateOtp, sendSms } from "../services/sms.service";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as jwt.SignOptions["expiresIn"];

export const sendOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number is required" });
  }

  try {
    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = await User.create({
        phoneNumber,
        name: `User ${phoneNumber.slice(-4)}`,
      });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    const smsSent = await sendSms(phoneNumber, otp);
    if (!smsSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP. Please try again.",
      });
    }

    return res.status(200).json({ 
      success: true, 
      message: "OTP sent successfully",
      data: {
        otp: otp
      }
    });
    
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Phone number and OTP are required" });
  }

  try {
    const user = await User.findOne({
      phoneNumber,
      otp,
      otpExpiry: { $gt: Date.now() },
    }).select("+otp +otpExpiry");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { _id: user._id, phoneNumber: user.phoneNumber, role: "user" },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    const resUser = user.toObject();
    delete resUser.otp;
    delete resUser.otpExpiry;

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: resUser,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authUser = req.user as JwtPayload;
  const userId = authUser._id;

  const { name, city, gender, dateOfBirth } = req.body;

  try {
    const updateData: any = { name, city, gender, dateOfBirth };

    if (req.file) {
      updateData.profilePictureUrl = req.file.path.replace(/\\/g, "/");
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!updatedUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.status(200).json({
      success: true,
      message: "Profile updated",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authUser = req.user as JwtPayload;
  try {
    const user = await User.findById(authUser._id).select("-__v");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // convert mongoose doc -> plain object
    const userObj = user.toObject();
    userObj.rating = "4.5";
    return res.status(200).json({ success: true, user: userObj });
  } catch (error) {
    next(error);
  }
};

