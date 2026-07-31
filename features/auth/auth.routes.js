console.log("auth.routes.js loaded");
import express from "express";
import {
  register,
  login,
  refreshToken,
} from "./auth.controller.js";
const router = express.Router();

// Register User
router.post("/register", register);

// Login User
router.post("/login", login);
// token
router.post("/refresh-token", refreshToken);
export default router;