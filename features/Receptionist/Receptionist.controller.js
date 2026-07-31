import {
  createReceptionistService,
  getAllReceptionistsService,
  getReceptionistByIdService,
  updateReceptionistService,
  deleteReceptionistService,
} from "./Receptionist.service.js";

// Input validation for Receptionist
const validateReceptionistInput = (body) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    shift,
  } = body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !password ||
    !phone ||
    !gender ||
    !dateOfBirth
  ) {
    return "Required fields missing: firstName, lastName, email, password, phone, gender, and dateOfBirth are required.";
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
    return `Invalid gender. Allowed values: ${allowedGenders.join(", ")}.`;
  }

  // Validate dateOfBirth format
  if (isNaN(Date.parse(dateOfBirth))) {
    return "Invalid dateOfBirth format (expected YYYY-MM-DD).";
  }

  // Validate shift (if provided)
  if (shift) {
    const allowedShifts = ["Morning", "Evening", "Night"];
    if (!allowedShifts.includes(shift)) {
      return `Invalid shift. Allowed values: ${allowedShifts.join(", ")}.`;
    }
  }

  return null; // validation passed
};

// Controller: Create Receptionist
export const createReceptionist = async (req, res) => {
  try {
    const validationError = validateReceptionistInput(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const receptionist = await createReceptionistService(req.body);

    return res.status(201).json({
      success: true,
      message: "Receptionist created successfully.",
      data: receptionist,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Get All Receptionists
export const getAllReceptionists = async (req, res) => {
  try {
    const receptionists = await getAllReceptionistsService();

    return res.status(200).json({
      success: true,
      count: receptionists.length,
      data: receptionists,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Get Single Receptionist
export const getReceptionistById = async (req, res) => {
  try {
    const receptionist = await getReceptionistByIdService(req.params.id);

    return res.status(200).json({
      success: true,
      data: receptionist,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Update Receptionist
export const updateReceptionist = async (req, res) => {
  try {
    const updated = await updateReceptionistService(req.params.id, req.body);

    return res.status(200).json({
      success: true,
      message: "Receptionist profile updated successfully.",
      data: updated,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};

// Controller: Delete Receptionist
export const deleteReceptionist = async (req, res) => {
  try {
    await deleteReceptionistService(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Receptionist deleted successfully.",
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};
