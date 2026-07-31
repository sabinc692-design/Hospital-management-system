import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const Doctor = sequelize.define(
  "Doctor",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // enforces one-to-one: one Doctor profile per User
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    specialization: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    qualification: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    experienceYears: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    consultationFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },

    licenseNumber: {
      type: DataTypes.STRING,
      unique: true,
    },

    bio: {
      type: DataTypes.TEXT,
    },
  },
  {
    timestamps: true,
  }
);

export default Doctor;
