import Appointment from "./appointment.model.js";

const createAppointment = async (data) => {
  return await Appointment.create(data);
};

const getAllAppointments = async () => {
  return await Appointment.findAll();
};

const getAppointmentById = async (id) => {
  return await Appointment.findByPk(id);
};

const getAppointmentsByPatient = async (patientId) => {
  return await Appointment.findAll({ where: { patientId } });
};

const getAppointmentsByDoctor = async (doctorId) => {
  return await Appointment.findAll({ where: { doctorId } });
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
  updateAppointment,
  updateAppointmentStatus,
  deleteAppointment,
};