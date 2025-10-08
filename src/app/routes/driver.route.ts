import express from "express";
import { getDriver, updateDriver } from "../controllers/driver.controller";
import { auth } from "../middleware/auth";
import { uploadSingle, uploadMultiple } from "../middleware/upload.middleware";

const router = express.Router();
const driverUploadFields = [
  { name: "carDocument", maxCount: 1 },
  { name: "taxDocument", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
  { name: "pan", maxCount: 1 },
];
// All routes are protected and require JWT token
// The auth middleware should populate req.user with userId and email
router.get("/get-profile", auth, getDriver);
router.put(
  "/update",
  auth,
  uploadMultiple(driverUploadFields, "driver-docs"),
  updateDriver
);

export default router;
