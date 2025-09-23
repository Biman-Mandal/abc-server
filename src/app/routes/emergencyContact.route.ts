import express from "express";
import {
  createEmergencyContact,
  deleteEmergencyContact,
  getAllEmergencyContacts,
  getEmergencyContactById,
  updateEmergencyContact,
} from "../controllers/emergencyContact.controller";
import { auth } from "../middleware/auth";

const router = express.Router();

// All routes are protected and require JWT token
// The auth middleware should populate req.user with userId and email
router.post("/", auth, createEmergencyContact);
router.get("/", auth, getAllEmergencyContacts);
router.get("/:id", auth, getEmergencyContactById);
router.put("/:id", auth, updateEmergencyContact);
router.delete("/:id", auth, deleteEmergencyContact);

export default router;