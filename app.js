// import express from "express";
// import dotenv from "dotenv";
// import cookieParser from "cookie-parser";
// import { connectionDB } from "./config/connection.js";
// import sequelize from "./config/connection.js";


// // Models — import
// import "./features/user/user.model.js";
// import Appointment from "./features/appointment/appointment.model.js";
// import "./features/department/department.model.js";
// import "./features/patient/patient.model.js";
// import "./features/doctor/doctor.model.js";
// import "./features/Receptionist/Receptionist.model.js";
// import "./features/doctorDepartment/doctorDepartment.model.js";
// import "./config/associations.js"; // <-- new file, see below

// import authRoutes from "./features/auth/auth.routes.js";
// import departmentRoutes from "./features/department/department.routes.js";
// import patientRoutes from "./features/patient/patient.routes.js";
// import doctorDepartmentRoutes from "./features/doctorDepartment/doctorDepartment.routes.js";
// import appointmentRoutes from "./features/appointment/appointment.routes.js";
// import doctorRoutes from "./features/doctor/doctor.routes.js";
// import receptionistRoutes from "./features/Receptionist/Receptionist.routes.js";
// import userRoutes from "./features/user/user.routes.js";
// dotenv.config();

// import cors from "cors";
// const app = express();

// // Middleware and cros setup
// app.use(cors({ 
//   origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"], 
//   credentials: true 
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser()); // moved above routes

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/patients", patientRoutes);

// app.use("/api/doctor-departments", doctorDepartmentRoutes);
// app.use("/api/appointments", appointmentRoutes);
// app.use("/api/doctors", doctorRoutes);
// app.use("/api/receptionists", receptionistRoutes);


// app.get("/", (req, res) => {
//   res.status(200).json({
//     success: true,
//     message: "Hospital Management System API is running...",
//   });
// });

// console.log("Registered Models:", Object.keys(sequelize.models));

// const PORT = process.env.PORT || 7000;

// const startServer = async () => {
//   try {
//     await connectionDB();
//     app.listen(PORT, () => {
//       console.log(`🚀 Server is running on http://localhost:${PORT}`);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//   }
// };

// startServer();





//for deployemt 

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectionDB } from "./config/connection.js";
import sequelize from "./config/connection.js";

// Models — import
import "./features/user/user.model.js";
import Appointment from "./features/appointment/appointment.model.js";
import "./features/department/department.model.js";
import "./features/patient/patient.model.js";
import "./features/doctor/doctor.model.js";
import "./features/Receptionist/Receptionist.model.js";
import "./features/doctorDepartment/doctorDepartment.model.js";
import "./config/associations.js";

// Routes
import authRoutes from "./features/auth/auth.routes.js";
import departmentRoutes from "./features/department/department.routes.js";
import patientRoutes from "./features/patient/patient.routes.js";
import doctorDepartmentRoutes from "./features/doctorDepartment/doctorDepartment.routes.js";
import appointmentRoutes from "./features/appointment/appointment.routes.js";
import doctorRoutes from "./features/doctor/doctor.routes.js";
import receptionistRoutes from "./features/Receptionist/Receptionist.routes.js";
import userRoutes from "./features/user/user.routes.js";

dotenv.config();

const app = express();

// CORS Configuration for Production (Render & Vercel) & Local Development
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:") ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com") ||
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL)
    ) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/doctor-departments", doctorDepartmentRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/receptionists", receptionistRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Hospital Management System API is running..."
  });
});

console.log("Registered Models:", Object.keys(sequelize.models));

const PORT = process.env.PORT || 7000;

const startServer = async () => {
  try {
    await connectionDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();