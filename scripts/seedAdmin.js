import dotenv from "dotenv";
dotenv.config();

import { connectionDB } from "../config/connection.js";
import User from "../features/user/user.model.js";
import bcrypt from "bcrypt";
import "../config/associations.js";

const seedAdmin = async () => {
  try {
    await connectionDB();

    const adminEmail = process.env.ADMIN_EMAIL || "admin@hospital.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

    if (existingAdmin) {
      console.log(`✅ Admin already exists: ${adminEmail}`);
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await User.create({
      firstName: "Super",
      lastName: "Admin",
      email: adminEmail,
      password: hashedPassword,
      phone: process.env.ADMIN_PHONE || "+9800000000",
      gender: "Male",
      dateOfBirth: "1990-01-01",
      address: "Hospital Headquarters",
      role: "Admin",
      isVerified: true,
      status: "Active",
    });

    console.log("🎉 Admin seeded successfully!");
    console.log(`   Email    : ${admin.email}`);
    console.log(`   Password : ${adminPassword}`);
    console.log(`   Role     : ${admin.role}`);
    console.log(`   ID       : ${admin.id}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Admin seeding failed:", error.message);
    process.exit(1);
  }
};

seedAdmin();
