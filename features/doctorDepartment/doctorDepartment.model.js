import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const DoctorDepartment = sequelize.define(
  "DoctorDepartment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    doctorId: {
      type: DataTypes.UUID,
      allowNull: false, // FK -> Users.id (where role = "Doctor")
    },

    departmentId: {
      type: DataTypes.UUID,
      allowNull: false, // FK -> Departments.id
    },

    isHeadOfDepartment: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    assignedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["doctorId", "departmentId"],
      },
    ],
  }
);

export default DoctorDepartment;