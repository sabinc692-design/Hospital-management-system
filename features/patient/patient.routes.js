import express from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "./patient.controller.js";
import { authenticate, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Create / Complete Patient Profile (Protected: Admin, Receptionist, Patient)
router.post(
  "/",
  authenticate,
  authorize("Admin", "Receptionist", "Patient"),
  createPatient
);

// Get All Patients (Protected: Admin, Receptionist, Doctor)
router.get(
  "/",
  authenticate,
  authorize("Admin", "Receptionist", "Doctor"),
  getAllPatients
);

// Get Single Patient (Protected: Authenticated users)
router.get("/:id", authenticate, getPatientById);

// Update Patient Profile (Protected: Admin, Receptionist, Patient)
router.put(
  "/:id",
  authenticate,
  authorize("Admin", "Receptionist", "Patient"),
  updatePatient
);

// Delete Patient (Protected: Admin)
router.delete("/:id", authenticate, authorize("Admin"), deletePatient);

export default router;