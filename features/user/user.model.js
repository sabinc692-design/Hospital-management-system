import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js"

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other"),
      allowNull: false,
    },

    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
    },

    profileImage: {
      type: DataTypes.STRING,
      defaultValue: null,
    },

    role: {
      type: DataTypes.ENUM(
        "Admin",
        "Doctor",
        "Patient",
        "Receptionist"
      ),
      defaultValue: "Patient",
    },

    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    status: {
      type: DataTypes.ENUM(
        "Active",
        "Inactive",
        "Suspended"
      ),
      defaultValue: "Active",
    },
    refreshToken: {
  type: DataTypes.TEXT,
  allowNull: true,
},
  },
  {
    timestamps: true,
  }
);

export default User;