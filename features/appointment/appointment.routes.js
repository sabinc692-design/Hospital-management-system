import express from "express";
import appointmentController from "./appointment.controller.js";
import { authenticate, softAuthenticate } from "../../middleware/auth.middleware.js";

const router = express.Router();

// POST — requires authentication
router.post("/", authenticate, appointmentController.createAppointment);
// GET all — protected
router.get("/", authenticate, appointmentController.getAllAppointments);
router.get("/patient/:patientId", authenticate, appointmentController.getAppointmentsByPatient);
router.get("/doctor/:doctorId", authenticate, appointmentController.getAppointmentsByDoctor);
router.get("/:id", authenticate, appointmentController.getAppointmentById);
// PUT — protected
router.put("/:id/assign", authenticate, appointmentController.assignDoctor);
router.put("/:id/respond", authenticate, appointmentController.respondAppointment);
router.put("/:id", authenticate, appointmentController.updateAppointment);
router.patch("/:id/status", authenticate, appointmentController.updateAppointmentStatus);
router.delete("/:id", authenticate, appointmentController.deleteAppointment);

export default router;