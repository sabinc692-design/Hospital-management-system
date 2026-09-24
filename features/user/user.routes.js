import express from "express";
import {
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  approveDoctor,
  createDoctorByAdmin,
} from "./user.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/create-doctor", createDoctorByAdmin);
router.put("/:id/approve-doctor", approveDoctor);
router.get("/:id", getSingleUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;
