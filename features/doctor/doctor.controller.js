import {
  createDoctorService,
  getAllDoctorsService,
  getDoctorByIdService,
} from "./doctor.service.js";

// Bare minimum validation helper
const validateDoctorInput = (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    specialization,
    qualification,
    consultationFee,
  } = body;

  // Check required user and doctor profile fields
  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !gender ||
    !dateOfBirth ||
    !specialization ||
    !qualification ||
    consultationFee === undefined ||
    consultationFee === null ||
    consultationFee === ""
  ) {
    return "Required fields missing: firstName, lastName, email, password, phone, gender, dateOfBirth, specialization, qualification, and consultationFee are required.";
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Invalid email format.";
  }

  // Validate password length
  if (typeof password !== "string" || password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  // Validate gender
  const allowedGenders = ["Male", "Female", "Other"];
  if (!allowedGenders.includes(gender)) {
    return `Invalid gender. Allowed values are: ${allowedGenders.join(", ")}.`;
  }

  // Validate dateOfBirth format
  if (isNaN(Date.parse(dateOfBirth))) {
    return "Invalid dateOfBirth. Please provide a valid date string (YYYY-MM-DD).";
  }

  // Validate consultationFee number
  if (isNaN(Number(consultationFee)) || Number(consultationFee) < 0) {
    return "Invalid consultationFee. Please provide a non-negative number.";
  }

  return null; // validation passed
};

// Controller to create doctor
export const createDoctor = async (req, res) => {
  try {
    // 1. Bare minimum validation
    const validationError = validateDoctorInput(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // 2. Call Doctor Service
    const doctor = await createDoctorService(req.body);

    return res.status(201).json({
      success: true,
      message: "Doctor created successfully with profile.",
      data: doctor,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller to get all doctors
export const getAllDoctors = async (req, res) => {
  try {
    const doctors = await getAllDoctorsService();

    return res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller to get single doctor
export const getDoctorById = async (req, res) => {
  try {
    const doctor = await getDoctorByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: doctor,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
