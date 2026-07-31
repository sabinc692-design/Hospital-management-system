import dotenv from "dotenv";
dotenv.config();

import { connectionDB } from "../config/connection.js";
import User from "../features/user/user.model.js";
import Doctor from "../features/doctor/doctor.model.js";
import "../config/associations.js";

const backfillDoctorProfiles = async () => {
  try {
    await connectionDB();

    // Find all users with role 'Doctor'
    const doctorUsers = await User.findAll({
      where: { role: "Doctor" },
      include: [{ model: Doctor, as: "doctorProfile" }],
    });

    console.log(`Found ${doctorUsers.length} doctor user(s) in Users table.`);

    let updatedCount = 0;

    for (const user of doctorUsers) {
      if (!user.doctorProfile) {
        console.log(
          `Creating Doctor profile for user: ${user.firstName} ${user.lastName} (${user.email})`
        );
        await Doctor.create({
          userId: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          specialization: "General Medicine",
          qualification: "MBBS",
          experienceYears: 1,
          consultationFee: 500.0,
          bio: "General practitioner profile auto-migrated.",
        });
        updatedCount++;
      } else {
        console.log(
          `Updating Doctor profile name for user: ${user.firstName} ${user.lastName} (${user.email})`
        );
        await user.doctorProfile.update({
          firstName: user.firstName,
          lastName: user.lastName,
        });
        updatedCount++;
      }
    }

    console.log(`🎉 Successfully updated ${updatedCount} doctor profile(s) with name!`);
    process.exit(0);
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
};

backfillDoctorProfiles();
