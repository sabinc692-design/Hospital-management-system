import express from "express";
import departmentController from "./department.controller.js";
// import { authenticate, authorize } from "../auth/auth.middleware.js"; // uncomment once you tell me your auth middleware path

const router = express.Router();

router.post("/", departmentController.createDepartment);
router.get("/", departmentController.getAllDepartments);
router.get("/:id", departmentController.getDepartmentById);
router.put("/:id", departmentController.updateDepartment);
router.delete("/:id", departmentController.deleteDepartment);

export default router;