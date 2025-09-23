import { Request, Response, NextFunction } from "express";
import Banner from "../../models/banner.model";
import { IAdmin } from "../../interfaces/admin.interface";

export const upsertMainBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { link, isActive } = req.body;
    const admin = req.user as IAdmin;

    if (!req.file) {
      res
        .status(400)
        .json({ success: false, message: "Banner image is required" });
      return;
    }

    const imageUrl = req.file.path.replace(/\\/g, "/");

    const mainBanner = await Banner.findOneAndUpdate(
      { type: "main" },
      {
        title: undefined,
        link,
        isActive: isActive !== undefined ? isActive : true,
        imageUrl,
        type: "main",
        addedBy: admin._id,
      },
      { new: true, upsert: true }
    );

    res.status(201).json({
      success: true,
      message: "Main banner updated successfully",
      data: mainBanner,
    });
  } catch (error) {
    next(error);
  }
};

export const getMainBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const mainBanner = await Banner.findOne({ type: "main", isActive: true });

    if (!mainBanner) {
      res
        .status(404)
        .json({ success: false, message: "Main banner not found" });
      return;
    }

    res.status(200).json({ success: true, data: mainBanner });
  } catch (error) {
    next(error);
  }
};

export const createSecondaryBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, link, isActive } = req.body;
    const admin = req.user as IAdmin;

    if (!req.file) {
      res
        .status(400)
        .json({ success: false, message: "Banner image is required" });
      return;
    }

    const imageUrl = req.file.path.replace(/\\/g, "/");

    const newBanner = await Banner.create({
      title,
      imageUrl,
      link,
      isActive,
      type: "secondary",
      addedBy: admin._id,
    });

    res.status(201).json({
      success: true,
      message: "Secondary banner created successfully",
      data: newBanner,
    });
  } catch (error) {
    next(error);
  }
};

export const getSecondaryBanners = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banners = await Banner.find({
      type: "secondary",
      isActive: true,
    }).sort({ createdAt: -1 });
    res
      .status(200)
      .json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};

export const updateSecondaryBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const { title, link, isActive } = req.body;

    const banner = await Banner.findById(id);

    if (!banner || banner.type !== "secondary") {
      res
        .status(404)
        .json({ success: false, message: "Secondary banner not found" });
      return;
    }

    banner.title = title ?? banner.title;
    banner.link = link ?? banner.link;
    banner.isActive = isActive ?? banner.isActive;

    if (req.file) {
      banner.imageUrl = req.file.path.replace(/\\/g, "/");
    }

    const updatedBanner = await banner.save();

    res.status(200).json({
      success: true,
      message: "Secondary banner updated successfully",
      data: updatedBanner,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSecondaryBanner = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findOne({ _id: id, type: "secondary" });

    if (!banner) {
      res
        .status(404)
        .json({ success: false, message: "Secondary banner not found" });
      return;
    }

    await banner.deleteOne();

    res.status(200).json({
      success: true,
      message: "Secondary banner deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getAllBannersForAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const banners = await Banner.find({ type: "secondary" }).sort({
      createdAt: -1,
    });
    res
      .status(200)
      .json({ success: true, count: banners.length, data: banners });
  } catch (error) {
    next(error);
  }
};
