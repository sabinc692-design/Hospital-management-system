import express from "express";
import {
  createReceptionist,
  getAllReceptionists,
  getReceptionistById,
  updateReceptionist,
  deleteReceptionist,
} from "./Receptionist.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Create Receptionist (Protected: Admin)
router.post("/", authenticate, authorize("Admin","Receptionist"), createReceptionist);

// Get All Receptionists (Protected: Admin, Receptionist)
router.get("/", authenticate, authorize("Admin", "Receptionist"), getAllReceptionists);

// Get Single Receptionist (Protected: Authenticated users)
router.get("/:id", authenticate, getReceptionistById);

// Update Receptionist (Protected: Admin)
router.put("/:id", authenticate, authorize("Admin"), updateReceptionist);

// Delete Receptionist (Protected: Admin)
router.delete("/:id", authenticate, authorize("Admin"), deleteReceptionist);

export default router;
