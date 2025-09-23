import express from "express";
import {
  deleteUserById,
  getAllUsers,
  getUserById,
  updateUserById,
} from "../../controllers/admin/manageUsers.controller";
import { uploadSingle } from "../../middleware/upload.middleware";
import { verifyAdmin } from "../../middleware/verifyAdmin";

const router = express.Router();

router.get("/", verifyAdmin, getAllUsers);
router.get("/:id", verifyAdmin, getUserById);
router.put(
  "/:id",
  verifyAdmin,
  uploadSingle("profilePictureUrl", "user-images"),
  updateUserById
);
router.delete("/:id", verifyAdmin, deleteUserById);

export default router;
