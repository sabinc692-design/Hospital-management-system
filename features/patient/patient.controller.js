import {
  createPatientService,
  getAllPatientsService,
  getPatientByIdService,
  updatePatientService,
  deletePatientService,
} from "./patient.service.js";

// Decent Patient Validation Helper
const validatePatientInput = (body, reqUser = null) => {
  const {
    userId,
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    bloodGroup,
    emergencyContactPhone,
  } = body;

  const isExistingUser = userId || (reqUser && reqUser.role === "Patient");

  // Scenario 1: Creating patient by providing brand-new user details
  if (!isExistingUser) {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !phone ||
      !gender ||
      !dateOfBirth
    ) {
      return "Required user fields missing: firstName, lastName, email, password, phone, gender, and dateOfBirth are required.";
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Invalid email format.";
    }

    // Password length validation
    if (typeof password !== "string" || password.length < 6) {
      return "Password must be at least 6 characters long.";
    }

    // Gender validation
    const allowedGenders = ["Male", "Female", "Other"];
    if (!allowedGenders.includes(gender)) {
      return `Invalid gender. Allowed values: ${allowedGenders.join(", ")}.`;
    }

    // Date of Birth validation
    if (isNaN(Date.parse(dateOfBirth))) {
      return "Invalid dateOfBirth format (expected YYYY-MM-DD).";
    }
  }

  // Blood Group validation (if provided)
  if (bloodGroup) {
    const allowedBloodGroups = [
      "A+",
      "A-",
      "B+",
      "B-",
      "AB+",
      "AB-",
      "O+",
      "O-",
    ];
    if (!allowedBloodGroups.includes(bloodGroup)) {
      return `Invalid bloodGroup. Allowed values: ${allowedBloodGroups.join(", ")}.`;
    }
  }

  // Emergency contact phone validation (if provided)
  if (emergencyContactPhone && typeof emergencyContactPhone !== "string") {
    return "Invalid emergencyContactPhone format.";
  }

  return null; // validation passed
};

// Controller: Create Patient Profile
export const createPatient = async (req, res) => {
  try {
    // 1. Run decent validation
    const validationError = validatePatientInput(req.body, req.user);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    // 2. Call service with req.body and logged-in req.user
    const patient = await createPatientService(req.body, req.user);

    return res.status(201).json({
      success: true,
      message: "Patient profile created successfully.",
      data: patient,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Get All Patients
export const getAllPatients = async (req, res) => {
  try {
    const patients = await getAllPatientsService();

    return res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Get Single Patient by ID
export const getPatientById = async (req, res) => {
  try {
    const patient = await getPatientByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Update Patient
export const updatePatient = async (req, res) => {
  try {
    const updated = await updatePatientService(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Patient profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Delete Patient
export const deletePatient = async (req, res) => {
  try {
    await deletePatientService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Patient profile deleted successfully.",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};