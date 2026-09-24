import bcrypt from "bcrypt";
import User from "./user.model.js";
import Doctor from "../doctor/doctor.model.js";
import Patient from "../patient/patient.model.js";
import Receptionist from "../Receptionist/Receptionist.model.js";

// Create Doctor by Admin (Auto-approved, Active)
export const createDoctorByAdmin = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      dateOfBirth,
      address,
      specialization,
      qualification,
      consultationFee,
      licenseNumber,
      department
    } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password || "Doctor@123", 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone: phone || `+1 (555) ${Math.floor(100000 + Math.random() * 900000)}`,
      gender: gender || "Male",
      dateOfBirth: dateOfBirth || "1985-01-01",
      address: address || "Hospital Main Ward",
      role: "Doctor",
      status: "Active",
      isVerified: true
    });

    const doctorProfile = await Doctor.create({
      userId: user.id,
      firstName,
      lastName,
      specialization: specialization || "General Medicine",
      qualification: qualification || "MBBS, MD",
      consultationFee: consultationFee || 100.00,
      licenseNumber: licenseNumber || `DOC-${Date.now()}`
    });

    const userRes = user.toJSON();
    delete userRes.password;

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully by Admin.",
      data: { user: userRes, doctorProfile, department }
    });
  } catch (error) {
    console.error("Create Doctor Error:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
};

// Approve Doctor Registration
export const approveDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role !== "Doctor") {
      return res.status(400).json({ success: false, message: "User is not a Doctor." });
    }

    await user.update({ status: "Active", isVerified: true });

    return res.status(200).json({
      success: true,
      message: `Doctor ${user.firstName} ${user.lastName} has been approved successfully!`,
      data: user
    });
  } catch (error) {
    console.error("Approve Doctor Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ["password"] },
      include: [
        { model: Doctor, as: "doctorProfile", required: false },
        { model: Patient, as: "patientProfile", required: false },
        { model: Receptionist, as: "receptionistProfile", required: false },
      ],
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single User
export const getSingleUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      attributes: { exclude: ["password"] },
      include: [
        { model: Doctor, as: "doctorProfile", required: false },
        { model: Patient, as: "patientProfile", required: false },
        { model: Receptionist, as: "receptionistProfile", required: false },
      ]
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Update User
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await user.update(req.body);

    const userRes = user.toJSON();
    delete userRes.password;

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      data: userRes,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    await user.destroy();

    return res.status(200).json({
      success: true,
      message: "User deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  createDoctorByAdmin,
  approveDoctor,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
};