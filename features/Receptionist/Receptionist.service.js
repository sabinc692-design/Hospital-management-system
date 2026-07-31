import bcrypt from "bcrypt";
import Receptionist from "./Receptionist.model.js";
import User from "../user/user.model.js";

// Service to create a new Receptionist user and profile
export const createReceptionistService = async (receptionistData) => {
  const {
    firstName,
    lastName,
    email,
    password,
    phone,
    gender,
    dateOfBirth,
    address,
    profileImage,
    employeeId,
    shift,
    qualification,
    joiningDate,
  } = receptionistData;

  // Check if email already exists
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    const error = new Error("Email already registered.");
    error.statusCode = 409;
    throw error;
  }

  // Check if phone number already exists
  const existingPhone = await User.findOne({ where: { phone } });
  if (existingPhone) {
    const error = new Error("Phone number already registered.");
    error.statusCode = 409;
    throw error;
  }

  // Check if employeeId already exists (if provided)
  if (employeeId) {
    const existingEmp = await Receptionist.findOne({ where: { employeeId } });
    if (existingEmp) {
      const error = new Error("Employee ID already exists.");
      error.statusCode = 409;
      throw error;
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create User record with Receptionist role
  const user = await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword,
    phone,
    gender,
    dateOfBirth,
    address,
    profileImage,
    role: "Receptionist",
  });

  // 2. Create Receptionist profile
  const receptionistProfile = await Receptionist.create({
    userId: user.id,
    firstName,
    lastName,
    employeeId: employeeId || `REC-${Date.now().toString().slice(-6)}`,
    shift: shift || "Morning",
    qualification,
    joiningDate: joiningDate || new Date(),
  });

  const userResponse = user.toJSON();
  delete userResponse.password;
  userResponse.receptionistProfile = receptionistProfile;

  return userResponse;
};

// Service to get all receptionists
export const getAllReceptionistsService = async () => {
  const receptionists = await User.findAll({
    where: { role: "Receptionist" },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Receptionist,
        as: "receptionistProfile",
      },
    ],
  });

  return receptionists;
};

// Service to get single receptionist by ID
export const getReceptionistByIdService = async (id) => {
  let receptionist = await User.findOne({
    where: { id, role: "Receptionist" },
    attributes: { exclude: ["password"] },
    include: [{ model: Receptionist, as: "receptionistProfile" }],
  });

  if (!receptionist) {
    const profile = await Receptionist.findByPk(id);
    if (profile) {
      receptionist = await User.findByPk(profile.userId, {
        attributes: { exclude: ["password"] },
        include: [{ model: Receptionist, as: "receptionistProfile" }],
      });
    }
  }

  if (!receptionist) {
    const error = new Error("Receptionist not found.");
    error.statusCode = 404;
    throw error;
  }

  return receptionist;
};

// Service to update receptionist
export const updateReceptionistService = async (id, updateData) => {
  const profile = await Receptionist.findOne({ where: { id } });

  if (!profile) {
    const error = new Error("Receptionist profile not found.");
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

// Service to delete receptionist
export const deleteReceptionistService = async (id) => {
  const profile = await Receptionist.findByPk(id);
  if (!profile) {
    const error = new Error("Receptionist profile not found.");
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
