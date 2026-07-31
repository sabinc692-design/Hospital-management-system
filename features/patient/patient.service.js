import bcrypt from "bcrypt";
import Patient from "./patient.model.js";
import User from "../user/user.model.js";

// Service to create patient (supports user creation, logged-in user profile completion, or linking explicit userId)
export const createPatientService = async (patientData, loggedInUser = null) => {
  const {
    userId,
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    address,
    profileImage,
    bloodGroup,
    emergencyContactName,
    emergencyContactPhone,
  } = patientData;

  // Determine target user ID
  let targetUserId = userId;
  if (!targetUserId && loggedInUser && loggedInUser.role === "Patient") {
    targetUserId = loggedInUser.id;
  }

  let userRecord = null;

  // Scenario A: User already registered / logged in
  if (targetUserId) {
    userRecord = await User.findByPk(targetUserId);
    if (!userRecord) {
      const error = new Error("User account with specified userId not found.");
      error.statusCode = 404;
      throw error;
    }
  } else {
    // Scenario B: Create a brand new User account with Patient role
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      const error = new Error(
        "Email already registered. If you already have an account, please log in first."
      );
      error.statusCode = 409;
      throw error;
    }

    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      const error = new Error("Phone number already registered.");
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    userRecord = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      gender,
      dateOfBirth,
      address,
      profileImage,
      role: "Patient",
    });

    targetUserId = userRecord.id;
  }

  // Check if patient profile already exists for this user
  const existingProfile = await Patient.findOne({
    where: { userId: targetUserId },
  });
  if (existingProfile) {
    const error = new Error("Patient profile already exists for this user.");
    error.statusCode = 409;
    throw error;
  }

  // Create Patient Profile entry
  const patientProfile = await Patient.create({
    userId: targetUserId,
    firstName: userRecord.firstName,
    lastName: userRecord.lastName,
    bloodGroup,
    emergencyContactName,
    emergencyContactPhone,
  });

  const userResponse = userRecord.toJSON();
  delete userResponse.password;
  userResponse.patientProfile = patientProfile;

  return userResponse;
};

// Service to get all patients
export const getAllPatientsService = async () => {
  const patients = await User.findAll({
    where: { role: "Patient" },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Patient,
        as: "patientProfile",
      },
    ],
  });

  return patients;
};

// Service to get single patient by ID (either Patient.id or User.id)
export const getPatientByIdService = async (id) => {
  let patient = await User.findOne({
    where: { id, role: "Patient" },
    attributes: { exclude: ["password"] },
    include: [{ model: Patient, as: "patientProfile" }],
  });

  if (!patient) {
    const profile = await Patient.findByPk(id);
    if (profile) {
      patient = await User.findByPk(profile.userId, {
        attributes: { exclude: ["password"] },
        include: [{ model: Patient, as: "patientProfile" }],
      });
    }
  }

  if (!patient) {
    const error = new Error("Patient not found.");
    error.statusCode = 404;
    throw error;
  }

  return patient;
};

// Service to update patient
export const updatePatientService = async (id, updateData) => {
  const profile = await Patient.findOne({ where: { id } });

  if (!profile) {
    const error = new Error("Patient profile not found.");
    error.statusCode = 404;
    throw error;
  }

  await profile.update(updateData);

  if (updateData.firstName || updateData.lastName) {
    const user = await User.findByPk(profile.userId);
    if (user) {
      await user.update({
        firstName: updateData.firstName || user.firstName,
        lastName: updateData.lastName || user.lastName,
      });
    }
  }

  return profile;
};

// Service to delete patient
export const deletePatientService = async (id) => {
  const profile = await Patient.findByPk(id);
  if (!profile) {
    const error = new Error("Patient profile not found.");
    error.statusCode = 404;
    throw error;
  }

  const userId = profile.userId;
  await profile.destroy();

  const user = await User.findByPk(userId);
  if (user) {
    await user.destroy();
  }

  return true;
};