import express from "express";
import doctorDepartmentController from "./doctorDepartment.controller.js";
// import { authenticate, authorize } from "../auth/auth.middleware.js";

const router = express.Router();

router.post("/", doctorDepartmentController.assignDoctorToDepartment);
router.get("/", doctorDepartmentController.getAllAssignments);
router.get("/department/:departmentId", doctorDepartmentController.getDoctorsByDepartment);
router.get("/doctor/:doctorId", doctorDepartmentController.getDepartmentsByDoctor);
router.put("/:id", doctorDepartmentController.updateAssignment);
router.delete("/:id", doctorDepartmentController.removeAssignment);

export default router;