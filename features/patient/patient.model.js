import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const Patient = sequelize.define(
  "Patient",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // enforces one-to-one: one Patient profile per User
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    bloodGroup: {
      type: DataTypes.ENUM(
        "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
      ),
    },

    emergencyContactName: {
      type: DataTypes.STRING,
    },

    emergencyContactPhone: {
      type: DataTypes.STRING,
    },
  },
  {
    timestamps: true,
  }
);

export default Patient;