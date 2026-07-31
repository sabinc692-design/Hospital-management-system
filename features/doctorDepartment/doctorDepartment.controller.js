import doctorDepartmentService from "./doctorDepartment.service.js";

const assignDoctorToDepartment = async (req, res) => {
  try {
    const assignment = await doctorDepartmentService.assignDoctorToDepartment(req.body);
    return res.status(201).json({ success: true, data: assignment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAllAssignments = async (req, res) => {
  try {
    const assignments = await doctorDepartmentService.getAllAssignments();
    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDoctorsByDepartment = async (req, res) => {
  try {
    const doctors = await doctorDepartmentService.getDoctorsByDepartment(req.params.departmentId);
    return res.status(200).json({ success: true, data: doctors });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getDepartmentsByDoctor = async (req, res) => {
  try {
    const departments = await doctorDepartmentService.getDepartmentsByDoctor(req.params.doctorId);
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await doctorDepartmentService.updateAssignment(req.params.id, req.body);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    return res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const removeAssignment = async (req, res) => {
  try {
    const assignment = await doctorDepartmentService.removeAssignment(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }
    return res.status(200).json({ success: true, message: "Assignment removed" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export default {
  assignDoctorToDepartment,
  getAllAssignments,
  getDoctorsByDepartment,
  getDepartmentsByDoctor,
  updateAssignment,
  removeAssignment,
};