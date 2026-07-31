import express from "express";
import {
  createDoctor,
  getAllDoctors,
  getDoctorById,
} from "./doctor.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Route to create doctor (Protected: Requires Authentication & Admin Role)
router.post("/", authenticate, authorize("Admin","Doctor"), createDoctor);

// Route to get all doctors (Protected: Requires Authentication)
router.get("/", authenticate, getAllDoctors);

// Route to get single doctor by ID (Protected: Requires Authentication)
router.get("/:id", authenticate, getDoctorById);

export default router;
