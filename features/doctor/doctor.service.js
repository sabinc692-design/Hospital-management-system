import bcrypt from "bcrypt";
import User from "../user/user.model.js";
import Doctor from "./doctor.model.js";
import Department from "../department/department.model.js";
import DoctorDepartment from "../doctorDepartment/doctorDepartment.model.js";

// Service to create a new doctor user and doctor profile
export const createDoctorService = async (doctorData) => {
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
    specialization,
    qualification,
    experienceYears,
    consultationFee,
    licenseNumber,
    bio,
    departmentId,
    isHeadOfDepartment,
  } = doctorData;

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

  // Check if license number already exists (if provided)
  if (licenseNumber) {
    const existingLicense = await Doctor.findOne({ where: { licenseNumber } });
    if (existingLicense) {
      const error = new Error("License number already registered.");
      error.statusCode = 409;
      throw error;
    }
  }

  // If departmentId provided, check if department exists
  if (departmentId) {
    const department = await Department.findByPk(departmentId);
    if (!department) {
      const error = new Error("Specified department does not exist.");
      error.statusCode = 404;
      throw error;
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. Create User record with Doctor role
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
    role: "Doctor",
  });

  // 2. Create Doctor profile entry in Doctors table
  const doctorProfile = await Doctor.create({
    userId: user.id,
    firstName,
    lastName,
    specialization,
    qualification,
    experienceYears: experienceYears || 0,
    consultationFee,
    licenseNumber,
    bio,
  });

  // 3. Assign doctor to department if departmentId is provided
  if (departmentId) {
    await DoctorDepartment.create({
      doctorId: user.id,
      departmentId,
      isHeadOfDepartment: isHeadOfDepartment || false,
    });
  }

  // Exclude password from response
  const userResponse = user.toJSON();
  delete userResponse.password;
  userResponse.doctorProfile = doctorProfile;

  return userResponse;
};

// Service to get all doctors
export const getAllDoctorsService = async () => {
  const doctors = await User.findAll({
    where: { role: "Doctor" },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Doctor,
        as: "doctorProfile",
      },
      {
        model: Department,
        as: "departments",
        through: {
          attributes: ["isHeadOfDepartment", "assignedDate"],
        },
      },
    ],
  });

  return doctors;
};

// Service to get single doctor by ID
export const getDoctorByIdService = async (id) => {
  const doctor = await User.findOne({
    where: { id, role: "Doctor" },
    attributes: { exclude: ["password"] },
    include: [
      {
        model: Doctor,
        as: "doctorProfile",
      },
      {
        model: Department,
        as: "departments",
        through: {
          attributes: ["isHeadOfDepartment", "assignedDate"],
        },
      },
    ],
  });

  if (!doctor) {
    const error = new Error("Doctor not found.");
    error.statusCode = 404;
    throw error;
  }

  return doctor;
};
