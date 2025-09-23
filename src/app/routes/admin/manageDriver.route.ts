import express from "express";
import {
  createDriverByAdmin,
  deleteDriverById,
  getAllDrivers,
  getDriverById,
  updateDriverById,
  addCreditsToDriver,
  getCreditHistoryByDriverId,
} from "../../controllers/admin/manageDriver.controller";
import { uploadMultiple } from "../../middleware/upload.middleware";
import { verifyAdmin } from "../../middleware/verifyAdmin";

const driverRouter = express.Router();

const driverUploadFields = [
  { name: "carDocument", maxCount: 1 },
  { name: "taxDocument", maxCount: 1 },
  { name: "profileImage", maxCount: 1 },
  { name: "license", maxCount: 1 },
  { name: "aadhar", maxCount: 1 },
  { name: "pan", maxCount: 1 },
];

driverRouter.post(
  "/create-driver",
  verifyAdmin,
  uploadMultiple(driverUploadFields, "driver-docs"),
  createDriverByAdmin
);

driverRouter.get("/", verifyAdmin, getAllDrivers);
driverRouter.get("/:id", verifyAdmin, getDriverById);
driverRouter.get(
  "/:id/credit-history",
  verifyAdmin,
  getCreditHistoryByDriverId
);

driverRouter.put(
  "/:id",
  verifyAdmin,
  uploadMultiple(driverUploadFields, "driver-docs"),
  updateDriverById
);

driverRouter.post("/:id/add-credits", verifyAdmin, addCreditsToDriver);

driverRouter.delete("/:id", verifyAdmin, deleteDriverById);

export default driverRouter;
