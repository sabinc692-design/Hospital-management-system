import appointmentService from "./appointment.service.js";
import Patient from "../patient/patient.model.js";

const createAppointment = async (req, res) => {
  try {
    const data = { ...req.body };

    let patientId = data.patientId;
    if (req.user && req.user.id) {
      // Find or create Patient profile for this User
      let patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) {
        patient = await Patient.create({
          userId: req.user.id,
          firstName: req.user.firstName || "Patient",
          lastName: req.user.lastName || "",
        });
      }
      patientId = patient.id;
    } else if (patientId) {
      // If patientId was passed, check if it's a User ID instead of Patient profile ID
      let patient = await Patient.findByPk(patientId);
      if (!patient) {
        patient = await Patient.findOne({ where: { userId: patientId } });
        if (patient) {
          patientId = patient.id;
        }
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, message: "Patient profile not found. Please log in as a patient." });
    }

    data.patientId = patientId;
    const appointment = await appointmentService.createAppointment(data);
    return res.status(201).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


const getAllAppointments = async (req, res) => {
  try {
    const appointments = await appointmentService.getAllAppointments();
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentsByPatient = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByPatient(req.params.patientId);
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const getAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await appointmentService.getAppointmentsByDoctor(req.params.doctorId);
    return res.status(200).json({ success: true, data: appointments });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const assignDoctor = async (req, res) => {
  try {
    const { doctorId } = req.body;
    if (!doctorId) {
      return res.status(400).json({ success: false, message: "Doctor ID is required for assignment" });
    }
    const appointment = await appointmentService.assignDoctor(req.params.id, doctorId);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, message: "Doctor assigned successfully", data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const respondAppointment = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be accepted or rejected" });
    }
    const appointment = await appointmentService.respondAppointment(req.params.id, status);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, message: `Appointment ${status} successfully`, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id, req.body);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await appointmentService.updateAppointmentStatus(req.params.id, status);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, data: appointment });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAppointment = async (req, res) => {
  try {
    const appointment = await appointmentService.deleteAppointment(req.params.id);
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }
    return res.status(200).json({ success: true, message: "Appointment deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
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