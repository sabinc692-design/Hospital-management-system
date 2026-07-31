import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

const Receptionist = sequelize.define(
  "Receptionist",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true, // enforces one-to-one: one Receptionist profile per User
    },

    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    employeeId: {
      type: DataTypes.STRING,
      unique: true,
    },

    shift: {
      type: DataTypes.ENUM("Morning", "Evening", "Night"),
      defaultValue: "Morning",
    },

    qualification: {
      type: DataTypes.STRING,
    },

    joiningDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    timestamps: true,
  }
);

export default Receptionist;
