import React from 'react'
import './App.css'
import Landingpage from './components/Landingpage'
import Login from './components/Login'
import Register from './components/Register'
import { Routes, Route } from 'react-router-dom'
 {/* Patient route */}
import OverReview from './Pages/patient/OverReview'
import Doctors from './Pages/patient/Doctors'
import Appointment from './Pages/patient/Appointment'

 {/* Doctor route */}
import DoctorOverReview from './Pages/doctor/DoctorOverReview'
import PatientRequest from './Pages/doctor/PatientRequest'



 {/* Reciptionist route */}

import ReceptionistOverReview from './Pages/receptionist/ReceptionistOverReview'
import AvailableDoctors from './Pages/receptionist/AvailableDoctors'
import IncomingPatients from './Pages/receptionist/IncomingPatients'
// admin Routes
import AdminOverReview from './Pages/admin/AdminOverReview'
import AdminUsers from './Pages/admin/AdminUsers'
import AdminDoctors from './Pages/admin/AdminDoctors'
import AdminPatients from './Pages/admin/AdminPatients'
import AdminAppointments from './Pages/admin/AdminAppointments'
import AdminReport from './Pages/admin/AdminReport'





function App() {
  return (
    <Routes>
      <Route path="/"         element={<Landingpage />} />
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />



       {/* Patient route */}
          <Route path="/patient/overreview"         element={<OverReview />} />
      <Route path="/patient/doctors"    element={<Doctors />} />
      <Route path="/patient/appointmet" element={<Appointment />} />

       {/* doctor */}
          <Route path="/doctor/overreview"         element={<DoctorOverReview />} />
      <Route path="/doctor/patientrequest"    element={<PatientRequest />} />
     

      {/* reciptionist route */}
          <Route path="/reciptionist/overreview"         element={<ReceptionistOverReview />} />
      <Route path="/reciptionist/availabledoctor"    element={<AvailableDoctors />} />
      <Route path="/reciptionist/incomingpatient" element={<IncomingPatients />} />

      {/* admin routes */}


         <Route path="/admin/overreview" element={< AdminOverReview/>}></Route>
  
  <Route path="/admin/users" element={<AdminUsers />} />
  <Route path="/admin/doctors" element={<AdminDoctors />} />
  <Route path="/admin/patients" element={<AdminPatients />} />
  <Route path="/admin/appointments" element={<AdminAppointments />} />
  <Route path="/admin/reports" element={<AdminReport />} />






    </Routes>
  )
}

export default App
