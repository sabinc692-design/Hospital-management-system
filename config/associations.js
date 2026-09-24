import User from "../features/user/user.model.js";
import Department from "../features/department/department.model.js";
import Patient from "../features/patient/patient.model.js";
import Doctor from "../features/doctor/doctor.model.js";
import Receptionist from "../features/Receptionist/Receptionist.model.js";
import DoctorDepartment from "../features/doctorDepartment/doctorDepartment.model.js";
import Appointment from "../features/appointment/appointment.model.js";

Patient.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Patient, { foreignKey: "userId", as: "patientProfile" });

Doctor.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Doctor, { foreignKey: "userId", as: "doctorProfile" });

Receptionist.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasOne(Receptionist, { foreignKey: "userId", as: "receptionistProfile" });

Appointment.belongsTo(Patient, { foreignKey: "patientId", as: "patient" });
Patient.hasMany(Appointment, { foreignKey: "patientId", as: "appointments" });

Appointment.belongsTo(Doctor, { foreignKey: "doctorId", as: "doctor" });
Doctor.hasMany(Appointment, { foreignKey: "doctorId", as: "appointments" });

Appointment.belongsTo(User, { foreignKey: "patientId", as: "user" });

User.belongsToMany(Department, {
  through: DoctorDepartment,
  foreignKey: "doctorId",
  as: "departments",
});
Department.belongsToMany(User, {
  through: DoctorDepartment,
  foreignKey: "departmentId",
  as: "doctors",
});