import DoctorDepartment from "./doctorDepartment.model.js";

const assignDoctorToDepartment = async (data) => {
  return await DoctorDepartment.create(data);
};

const getAllAssignments = async () => {
  return await DoctorDepartment.findAll();
};

const getDoctorsByDepartment = async (departmentId) => {
  return await DoctorDepartment.findAll({ where: { departmentId } });
};

const getDepartmentsByDoctor = async (doctorId) => {
  return await DoctorDepartment.findAll({ where: { doctorId } });
};

const updateAssignment = async (id, data) => {
  const assignment = await DoctorDepartment.findByPk(id);
  if (!assignment) return null;
  return await assignment.update(data);
};

const removeAssignment = async (id) => {
  const assignment = await DoctorDepartment.findByPk(id);
  if (!assignment) return null;
  await assignment.destroy();
  return assignment;
};

export default {
  assignDoctorToDepartment,
  getAllAssignments,
  getDoctorsByDepartment,
  getDepartmentsByDoctor,
  updateAssignment,
  removeAssignment,
};