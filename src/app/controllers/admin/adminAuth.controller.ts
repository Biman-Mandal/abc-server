import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Admin from "../../models/admin.model";
import { IAdmin } from "../../interfaces/admin.interface";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "7d") as jwt.SignOptions["expiresIn"];

const adminLogin = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email }).select("+password");

    if (!admin) {
      res
        .status(401)
        .json({ success: false, message: "Unauthorized: Admin not found" });
      return;
    }

    if (typeof admin.comparePassword !== "function") {
      res.status(500).json({
        success: false,
        message: "Password comparison method not implemented",
      });
      return;
    }

    const isMatch = await admin.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { _id: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );

    const resAdmin = await Admin.findById(admin._id).select(
      "-password -createdAt -updatedAt"
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      admin: resAdmin,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = (req.user as { _id: string })._id;
    const admin = await Admin.findById(adminId).select(
      "-password -createdAt -updatedAt"
    );

    if (!admin) {
      res.status(404).json({ success: false, message: "Admin not found" });
      return;
    }

    res.status(200).json({ success: true, admin });
  } catch (error) {
    next(error);
  }
};

const createAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password, role } = req.body;
  const file = req.file;

  try {
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      res.status(409).json({ success: false, message: "Admin already exists" });
      return;
    }

    const imageUrl = file ? `/uploads/admins/${file.filename}` : undefined;

    const newAdmin = new Admin({
      name,
      email,
      password,
      role: role || "admin",
      profilePictureUrl: imageUrl,
    });

    await newAdmin.save();
    const resAdmin = await Admin.findById(newAdmin._id).select("-password");

    res.status(201).json({
      success: true,
      message: "Admin created successfully",
      admin: resAdmin,
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const adminId = req.params.id;
    const { name, email, password, role } = req.body;
    const file = req.file;

    const updatedData: Partial<IAdmin> = {};

    if (name) updatedData.name = name;
    if (email) updatedData.email = email;
    if (role) updatedData.role = role;
    if (password) updatedData.password = password;
    if (file)
      updatedData.profilePictureUrl = `/uploads/admin-images/${file.filename}`;

    const updatedAdmin = await Admin.findByIdAndUpdate(adminId, updatedData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedAdmin) {
      res.status(404).json({ success: false, message: "Admin not found" });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Admin updated successfully",
      admin: updatedAdmin,
    });
  } catch (error) {
    next(error);
  }
};

export { adminLogin, getAdminProfile, createAdmin, updateAdminById };
