import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const navItems = [
  { label: 'Overview',          icon: '🏠', path: '/reciptionist/overreview' },
  { label: 'Available Doctors', icon: '👨‍⚕️', path: '/reciptionist/availabledoctor' },
  { label: 'Incoming Patients', icon: '🚶', path: '/reciptionist/incomingpatient' },
]



const initialAppointments = []

export default function IncomingPatients() {
  const [appointments, setAppointments] = useState([])
  const [doctorsList, setDoctorsList]   = useState([])
  const [filter, setFilter]             = useState('All')
  const [selectedApt, setSelectedApt]   = useState(null)
  const [selectedDoc, setSelectedDoc]   = useState('')
  const [assigning, setAssigning]       = useState(false)

  const fetchRealData = async () => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    // 1. Fetch Doctors
    // /api/doctors returns User objects: { id, firstName, lastName, doctorProfile: { specialization } }
    try {
      const docRes = await axios.get(`${API_BASE_URL}/api/doctors`, { headers })
      if (docRes.data?.data) {
        const docs = docRes.data.data.map(d => ({
          id: d.doctorProfile?.id || d.id,
          name: `Dr. ${d.firstName || ''} ${d.lastName || ''}`.trim(),
          spec: d.doctorProfile?.specialization || 'General'
        }))
        setDoctorsList(docs)
      }
    } catch (e) {
      console.log('Fetch doctors notice:', e.message)
    }

    // 2. Fetch Appointments
    // /api/appointments returns appointments with patient user info nested
    let fetched = []
    try {
      const aptRes = await axios.get(`${API_BASE_URL}/api/appointments`, { headers })
      if (aptRes.data?.data) {
        fetched = aptRes.data.data.map(a => {
          // Patient info can come from a.Patient.User (via association) or a.user (direct join)
          const patUser = a.Patient?.User || a.Patient?.user || a.user || {}
          // Doctor info — /api/doctors returns User, but appointment doctor is a Doctor record with user alias
          const docUser = a.Doctor?.User || a.Doctor?.user || {}
          const docFirstName = docUser.firstName || a.Doctor?.firstName || ''
          const docLastName  = docUser.lastName  || a.Doctor?.lastName  || ''

          return {
            id: a.id,
            patientName: patUser.fullName || `${patUser.firstName || ''} ${patUser.lastName || ''}`.trim() || 'Patient',
            patientDetails: {
              age: patUser.dateOfBirth ? Math.floor((new Date() - new Date(patUser.dateOfBirth)) / 31557600000) : 'N/A',
              gender: patUser.gender || 'N/A',
              phone: patUser.phone || 'N/A',
              email: patUser.email || 'N/A',
              bloodGroup: a.Patient?.bloodGroup || 'N/A',
              address: patUser.address || 'N/A'
            },
            date: a.appointmentDate ? new Date(a.appointmentDate).toISOString().split('T')[0] : 'N/A',
            timeSlot: a.timeSlot || 'N/A',
            reason: a.reason || 'Medical Problem',
            doctor: (docFirstName || docLastName) ? `Dr. ${docFirstName} ${docLastName}`.trim() : null,
            doctorId: a.doctorId,
            status: a.status || 'Pending',
            createdAt: a.createdAt
          }
        })
      }
    } catch (e) {
      console.log('Fetch appointments notice:', e.message)
    }

    setAppointments(fetched)
  }

  useEffect(() => {
    fetchRealData()
    const handleStorage = () => fetchRealData()
    window.addEventListener('storage', handleStorage)
    const interval = setInterval(fetchRealData, 3000)
    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  const handleAssignDoctor = async (e) => {
    e.preventDefault()
    if (!selectedApt || !selectedDoc) return alert('Please select a doctor to assign.')

    setAssigning(true)
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      await axios.put(
        `${API_BASE_URL}/api/appointments/${selectedApt.id}/assign`,
        { doctorId: selectedDoc },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setSelectedApt(null)
      setSelectedDoc('')
      await fetchRealData()   // Refresh from live DB
    } catch (err) {
      alert('Failed to assign doctor: ' + (err.response?.data?.message || err.message))
    } finally {
      setAssigning(false)
    }
  }

  const filtered = filter === 'All'
    ? appointments
    : filter === 'Unassigned'
    ? appointments.filter(a => a.status === 'pending' || !a.doctor)
    : appointments.filter(a => a.status === filter.toLowerCase())

  const getStatusBadge = (status) => {
    switch(status) {
      case 'pending': return { label: '🟡 Unassigned', bg: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: 'rgba(245,158,11,0.3)' }
      case 'assigned': return { label: '🔵 Assigned (Pending Doctor Acceptance)', bg: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: 'rgba(59,130,246,0.3)' }
      case 'accepted':
      case 'confirmed': return { label: '🟢 Accepted by Doctor', bg: 'rgba(16,185,129,0.15)', color: '#10b981', border: 'rgba(16,185,129,0.3)' }
      case 'rejected': return { label: '🔴 Rejected by Doctor', bg: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'rgba(239,68,68,0.3)' }
      default: return { label: status, bg: 'rgba(148,163,184,0.15)', color: '#94a3b8', border: 'rgba(148,163,184,0.3)' }
    }
  }

  return (
    <DashboardLayout role="receptionist" navItems={navItems}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Incoming Patient Appointments</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review patient medical conditions & assign fitting doctors</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['All', 'Unassigned', 'Assigned', 'Accepted', 'Rejected'].map(f => {
          const count = f === 'All'
            ? appointments.length
            : f === 'Unassigned'
            ? appointments.filter(a => a.status === 'pending' || !a.doctor).length
            : appointments.filter(a => a.status === f.toLowerCase()).length

          return (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.45rem 1rem', borderRadius: 10,
              border: `1px solid ${filter === f ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
              background: filter === f ? 'rgba(139,92,246,0.15)' : 'transparent',
              color: filter === f ? '#8b5cf6' : '#64748b',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
            }}>{f} <span style={{ fontWeight: 800 }}>({count})</span></button>
          )
        })}
      </div>

      {/* Assign Modal */}
      {selectedApt && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(139,92,246,0.3)',
            borderRadius: 20, padding: '2rem', maxWidth: 540, width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
            animation: 'fadeIn 0.25s ease'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                👨‍⚕️ Assign Doctor to Patient
              </h3>
              <button onClick={() => setSelectedApt(null)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Patient Registration Details */}
            <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: '1rem', marginBottom: '1.25rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontWeight: 700, color: '#8b5cf6', marginBottom: '0.5rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                📋 Patient Profile & Registration Details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', fontSize: '0.82rem', color: '#cbd5e1' }}>
                <div><strong>Full Name:</strong> {selectedApt.patientName}</div>
                <div><strong>Age / Gender:</strong> {selectedApt.patientDetails?.age || '30'} yrs · {selectedApt.patientDetails?.gender || 'N/A'}</div>
                <div><strong>Phone:</strong> {selectedApt.patientDetails?.phone || 'N/A'}</div>
                <div><strong>Email:</strong> {selectedApt.patientDetails?.email || 'N/A'}</div>
                <div><strong>Blood Group:</strong> {selectedApt.patientDetails?.bloodGroup || 'O+'}</div>
                <div><strong>Address:</strong> {selectedApt.patientDetails?.address || 'N/A'}</div>
              </div>
            </div>

            {/* Medical Problem / Symptoms */}
            <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div style={{ fontWeight: 700, color: '#f59e0b', marginBottom: '0.4rem', fontSize: '0.82rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                🩺 Patient Stated Medical Condition
              </div>
              <div style={{ fontSize: '0.9rem', color: '#f8fafc', fontWeight: 500, lineHeight: 1.5 }}>
                "{selectedApt.reason}"
              </div>
              <div style={{ marginTop: '0.6rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                Preferred Slot: <strong>{selectedApt.date}</strong> at <strong>{selectedApt.timeSlot || selectedApt.time}</strong>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAssignDoctor}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Select Fitting Doctor
                </label>
                <select value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)} required style={{
                  width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #8b5cf6',
                  borderRadius: 10, padding: '0.8rem 1rem', color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', fontFamily: 'inherit'
                }}>
                  <option value="" style={{ background: '#0f172a' }}>Choose a doctor...</option>
                  {doctorsList.map(d => (
                    <option key={d.id} value={d.id} style={{ background: '#0f172a' }}>
                      {d.name} — {d.spec}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSelectedApt(null)} style={{
                  padding: '0.65rem 1.25rem', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: '#94a3b8', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                }}>Cancel</button>

                <button type="submit" disabled={assigning} style={{
                  padding: '0.65rem 1.5rem', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
                  color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 15px rgba(139,92,246,0.3)'
                }}>
                  {assigning ? 'Assigning...' : 'Assign Doctor →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Appointment cards list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
            No appointments found for filter "{filter}".
          </div>
        ) : (
          filtered.map(apt => {
            const badge = getStatusBadge(apt.status)
            return (
              <div key={apt.id} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: '1.25rem 1.5rem',
                display: 'grid', gridTemplateColumns: '2fr 2.5fr 1.5fr 1fr',
                alignItems: 'center', gap: '1.25rem'
              }}>
                {/* Patient Info */}
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f1f5f9' }}>{apt.patientName}</div>
                  <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.2rem' }}>
                    {apt.patientDetails?.gender || 'Male'} · Age {apt.patientDetails?.age || '30'} · {apt.patientDetails?.phone || '+1 555-0192'}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748b', marginTop: '0.15rem' }}>
                    Blood: <span style={{ color: '#06b6d4' }}>{apt.patientDetails?.bloodGroup || 'O+'}</span>
                  </div>
                </div>

                {/* Medical Problem & Preferred Schedule */}
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#f1f5f9', fontWeight: 600 }}>
                    🩺 "{apt.reason}"
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
                    📅 {apt.date} at {apt.timeSlot || apt.time}
                  </div>
                </div>

                {/* Doctor & Status */}
                <div>
                  <span style={{
                    display: 'inline-block', padding: '0.3rem 0.75rem', borderRadius: 100,
                    fontSize: '0.72rem', fontWeight: 700, marginBottom: '0.4rem',
                    background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`
                  }}>{badge.label}</span>

                  <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                    Doctor: <strong style={{ color: apt.doctor ? '#8b5cf6' : '#f59e0b' }}>{apt.doctor || 'Unassigned'}</strong>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => { setSelectedApt(apt); setSelectedDoc(apt.doctorId || ''); }} style={{
                    padding: '0.55rem 1.1rem', borderRadius: 10, border: 'none',
                    background: apt.doctor ? 'rgba(139,92,246,0.18)' : 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
                    color: apt.doctor ? '#8b5cf6' : '#fff', fontWeight: 700, fontSize: '0.8rem',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                    boxShadow: apt.doctor ? 'none' : '0 4px 15px rgba(139,92,246,0.3)'
                  }}>
                    {apt.doctor ? 'Reassign Doctor ✎' : 'Assign Doctor +'}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </DashboardLayout>
  )
}