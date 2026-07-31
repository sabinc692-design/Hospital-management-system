import express from "express";
import appointmentController from "./appointment.controller.js";
// import { authenticate } from "../auth/auth.middleware.js"; // add once you're ready to protect routes

const router = express.Router();

router.post("/", appointmentController.createAppointment);
router.get("/", appointmentController.getAllAppointments);
router.get("/:id", appointmentController.getAppointmentById);
router.get("/patient/:patientId", appointmentController.getAppointmentsByPatient);
router.get("/doctor/:doctorId", appointmentController.getAppointmentsByDoctor);
router.put("/:id", appointmentController.updateAppointment);
router.patch("/:id/status", appointmentController.updateAppointmentStatus);
router.delete("/:id", appointmentController.deleteAppointment);

export default router;