import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../user/user.model.js"; 

// Register Service

export const registerService = async (userData) => {
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
    role,
  } = userData;

  // Check if email already exists
  const existingEmail = await User.findOne({
    where: { email },
  });

  if (existingEmail) {
    const error = new Error("Email already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Check if phone already exists
  const existingPhone = await User.findOne({
    where: { phone },
  });

  if (existingPhone) {
    const error = new Error("Phone number already exists.");
    error.statusCode = 409;
    throw error;
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
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
    role,
  });

  // Remove password before returning
  const userResponse = user.toJSON();
  delete userResponse.password;

  return userResponse;
};


// Login Service

export const loginService = async ({ email, password }) => {
  // Find user
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error("Invalid email or password.");
    error.statusCode = 401;
    throw error;
  }


  const accessToken = jwt.sign(
  {
    id: user.id,
    role: user.role,
    email: user.email,
  },
  process.env.JWT_ACCESS_SECRET,
  {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
  }
);
// console.log("ACCESS SECRET:", process.env.JWT_ACCESS_SECRET);
// console.log("REFRESH SECRET:", process.env.JWT_REFRESH_SECRET);

const refreshToken = jwt.sign(
  {
    id: user.id,
  },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRES,
  }
);

  // Remove password
  const userResponse = user.toJSON();
  delete userResponse.password;

  return {
  accessToken,
  refreshToken,
  user: userResponse,
};
};

// ============================
// Refresh Token Service
// ============================

export const refreshTokenService = async (token) => {
  try {
    // Verify Refresh Token
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    );

    // Find User
    const user = await User.findByPk(decoded.id);

    if (!user) {
      const error = new Error("User not found.");
      error.statusCode = 404;
      throw error;
    }

    // Generate New Access Token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_ACCESS_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES,
      }
    );

    return accessToken;
  } catch (err) {
    const error = new Error("Invalid or expired refresh token.");
    error.statusCode = 401;
    throw error;
  }
};







// import bcrypt from "bcrypt";
// console.log(" bcrypt loaded");

// import jwt from "jsonwebtoken";
// console.log(" jsonwebtoken loaded");

// import User from "../user/user.model.js";
// console.log(" User model loaded");

// export const registerService = async () => {};

// export const loginService = async () => {};