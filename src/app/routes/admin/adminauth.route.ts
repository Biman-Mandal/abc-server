import express from "express";
import {
  adminLogin,
  createAdmin,
  getAdminProfile,
  updateAdminById,
} from "../../controllers/admin/adminAuth.controller";

import { verifyAdmin } from "../../middleware/verifyAdmin";
import { uploadSingle } from "../../middleware/upload.middleware";

const adminAuthRouter = express.Router();

adminAuthRouter.post("/login", adminLogin);

adminAuthRouter.get("/profile", verifyAdmin, getAdminProfile);

adminAuthRouter.post(
  "/create",
  verifyAdmin,
  uploadSingle("profilePictureUrl", "admins"),
  createAdmin
);
adminAuthRouter.put(
  "/:id",
  verifyAdmin,
  uploadSingle("profilePictureUrl", "admin-images"),
  updateAdminById
);
export default adminAuthRouter;
