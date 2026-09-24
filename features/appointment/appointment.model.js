import { DataTypes } from "sequelize";
import sequelize from "../../config/connection.js";

 const Appointment = sequelize.define(
  "Appointment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    patientId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    doctorId: {
      type: DataTypes.UUID,
      allowNull: true,
    },

    appointmentDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    timeSlot: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "assigned",
        "accepted",
        "rejected",
        "confirmed",
        "completed",
        "cancelled"
      ),
      defaultValue: "pending",
    },
  },
  {
    tableName: "Appointments",
    timestamps: true,
  }
);

export default Appointment;

