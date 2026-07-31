import Department from "./department.model.js";

const createDepartment = async (data) => {
  return await Department.create(data);
};

const getAllDepartments = async () => {
  return await Department.findAll();
};

const getDepartmentById = async (id) => {
  return await Department.findByPk(id);
};

const updateDepartment = async (id, data) => {
  const department = await Department.findByPk(id);
  if (!department) return null;
  return await department.update(data);
};

const deleteDepartment = async (id) => {
  const department = await Department.findByPk(id);
  if (!department) return null;
  await department.destroy();
  return department;
};

export default {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
};