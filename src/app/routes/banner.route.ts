import { Router } from "express";
import { verifyAdmin } from "../middleware/verifyAdmin";
import { uploadSingle } from "../middleware/upload.middleware";
import {
  upsertMainBanner,
  getMainBanner,
  createSecondaryBanner,
  getSecondaryBanners,
  updateSecondaryBanner,
  deleteSecondaryBanner,
  getAllBannersForAdmin,
} from "../controllers/mobile/banner.controller";

const router = Router();

router.post(
  "/main",
  verifyAdmin,
  uploadSingle("image", "banners"),
  upsertMainBanner
);

router.get("/main", getMainBanner);

router.post(
  "/secondary",
  verifyAdmin,
  uploadSingle("image", "banners"),
  createSecondaryBanner
);

router.get("/secondary", getSecondaryBanners);

router.put(
  "/secondary/:id",
  verifyAdmin,
  uploadSingle("image", "banners"),
  updateSecondaryBanner
);

router.delete("/secondary/:id", verifyAdmin, deleteSecondaryBanner);

export default router;
router.get("/admin/all", verifyAdmin, getAllBannersForAdmin);
