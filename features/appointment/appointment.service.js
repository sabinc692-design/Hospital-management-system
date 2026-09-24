import Appointment from "./appointment.model.js";
import User from "../user/user.model.js";
import Patient from "../patient/patient.model.js";
import Doctor from "../doctor/doctor.model.js";

const createAppointment = async (data) => {
  return await Appointment.create(data);
};

const getAllAppointments = async () => {
  const appointments = await Appointment.findAll({
    include: [
      {
        model: Patient,
        as: "patient",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone", "gender", "dateOfBirth", "address"],
          },
        ],
      },
      {
        model: Doctor,
        as: "doctor",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return appointments.map((apt) => {
    const plain = apt.get({ plain: true });
    if (!plain.user && plain.patient?.user) {
      plain.user = plain.patient.user;
    }
    return plain;
  });
};

const getAppointmentById = async (id) => {
  const apt = await Appointment.findByPk(id, {
    include: [
      {
        model: Patient,
        as: "patient",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone", "gender", "dateOfBirth", "address"],
          },
        ],
      },
      {
        model: Doctor,
        as: "doctor",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone"],
          },
        ],
      },
    ],
  });

  if (!apt) return null;
  const plain = apt.get({ plain: true });
  if (!plain.user && plain.patient?.user) {
    plain.user = plain.patient.user;
  }
  return plain;
};

const getAppointmentsByPatient = async (patientId) => {
  let pId = patientId;
  const patient = await Patient.findOne({ where: { userId: patientId } });
  if (patient) {
    pId = patient.id;
  }
  const appointments = await Appointment.findAll({
    where: { patientId: pId },
    include: [
      {
        model: Patient,
        as: "patient",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName", "email", "phone", "gender", "dateOfBirth", "address"],
          },
        ],
      },
      {
        model: Doctor,
        as: "doctor",
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  return appointments.map((apt) => {
    const plain = apt.get({ plain: true });
    if (!plain.user && plain.patient?.user) {
      plain.user = plain.patient.user;
    }
    return plain;
  });
};


const getAppointmentsByDoctor = async (doctorId) => {
  return await Appointment.findAll({
    where: { doctorId },
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "firstName", "lastName", "email", "phone", "gender", "dateOfBirth", "address"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const assignDoctor = async (id, doctorId) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  return await appointment.update({ doctorId, status: "assigned" });
};

const respondAppointment = async (id, status) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  if (!["accepted", "rejected"].includes(status)) {
    throw new Error("Invalid status. Must be accepted or rejected.");
  }
  return await appointment.update({ status });
};

const updateAppointment = async (id, data) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  return await appointment.update(data);
};

const updateAppointmentStatus = async (id, status) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  return await appointment.update({ status });
};

const deleteAppointment = async (id) => {
  const appointment = await Appointment.findByPk(id);
  if (!appointment) return null;
  await appointment.destroy();
  return appointment;
};

export default {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  getAppointmentsByPatient,
  getAppointmentsByDoctor,
  assignDoctor,
  respondAppointment,
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};