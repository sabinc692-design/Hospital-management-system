import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const navItems = [
  { label: 'Overview',    icon: '🏠', path: '/patient/overreview' },
  { label: 'Doctors',     icon: '👨‍⚕️', path: '/patient/doctors' },
  { label: 'Appointment', icon: '📅', path: '/patient/appointmet' },
]

const timeSlots = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
                   '02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM']

const initialAppointments = []

export default function Appointment() {
  const [date, setDate]       = useState('')
  const [slot, setSlot]       = useState('')
  const [reason, setReason]   = useState('')
  const [success, setSuccess] = useState(false)
  const [tab, setTab]         = useState('book') // 'book' | 'history'
  const [appointmentsList, setAppointmentsList] = useState([])

  const fetchRealAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const storedUserObj = JSON.parse(localStorage.getItem('user') || '{}')
      const res = await axios.get(`${API_BASE_URL}/api/appointments`, { headers })
      if (res.data?.data) {
        // Filter: only show THIS patient's appointments
        const myId = storedUserObj.id
        const all = res.data.data
        const mine = myId ? all.filter(a => a.patientId === myId || a.user?.id === myId) : all
        const fetched = mine.map(a => ({
          id: a.id,
          patientName: a.user ? `${a.user.firstName} ${a.user.lastName}`.trim() : 'Patient',
          date: new Date(a.appointmentDate).toISOString().split('T')[0],
          timeSlot: a.timeSlot || '10:00 AM',
          reason: a.reason || 'Medical check-up',
          doctor: a.doctor ? `Dr. ${a.doctor.user?.firstName || a.doctor.firstName} ${a.doctor.user?.lastName || a.doctor.lastName || ''}`.trim() : null,
          status: a.status || 'pending',
          createdAt: a.createdAt
        }))
        setAppointmentsList(fetched)
      }
    } catch (err) {
      console.log('Appointments fetch notice:', err.message)
    }
  }


  useEffect(() => {
    fetchRealAppointments()
    const handleStorage = () => fetchRealAppointments()
    window.addEventListener('storage', handleStorage)
    const interval = setInterval(fetchRealAppointments, 3000)
    return () => {
      window.removeEventListener('storage', handleStorage)
      clearInterval(interval)
    }
  }, [])

  const inputStyle = () => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10, padding: '0.75rem 1rem',
    color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
  })

  const handleBook = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return alert('Please describe your medical problem or symptoms.')
    if (!date) return alert('Please select a preferred date.')

    const storedUserObj = JSON.parse(localStorage.getItem('user') || '{}')
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}

    try {
      const response = await axios.post(`${API_BASE_URL}/api/appointments`, {
        appointmentDate: date,
        timeSlot: slot || '10:00 AM',
        reason: reason.trim(),
        status: 'pending'
        // patientId is auto-set from token on backend
      }, { headers })

      if (response.data?.success) {
        setSuccess(true)
        setDate('')
        setSlot('')
        setReason('')
        setTimeout(() => setSuccess(false), 4000)
        // Refresh the list from server
        fetchRealAppointments()
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message
      alert('Failed to book appointment: ' + msg + '\n\nPlease make sure you are logged in.')
    }

  }

  const getStatusBadge = (status, doctorName) => {
    if (status === 'pending') {
      return {
        label: '🟡 Pending Doctor Assignment',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: 'rgba(245, 158, 11, 0.3)'
      }
    }
    if (status === 'assigned') {
      return {
        label: `🔵 Assigned to ${doctorName || 'Doctor'} (Pending Acceptance)`,
        color: '#3b82f6',
        bg: 'rgba(59, 130, 246, 0.15)',
        border: 'rgba(59, 130, 246, 0.3)'
      }
    }
    if (status === 'accepted' || status === 'confirmed') {
      return {
        label: `🟢 Accepted by ${doctorName || 'Doctor'}`,
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.15)',
        border: 'rgba(16, 185, 129, 0.3)'
      }
    }
    if (status === 'rejected') {
      return {
        label: '🔴 Rejected by Doctor',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.15)',
        border: 'rgba(239, 68, 68, 0.3)'
      }
    }
    return {
      label: status,
      color: '#94a3b8',
      bg: 'rgba(148, 163, 184, 0.15)',
      border: 'rgba(148, 163, 184, 0.3)'
    }
  }

  return (
    <DashboardLayout role="patient" navItems={navItems}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Appointments</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>State your medical condition & track doctor assignment</p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
        {[['book','📅 Book Appointment'],['history','📋 Appointment History']].map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            padding: '0.55rem 1.25rem', borderRadius: 10,
            border: `1px solid ${tab === key ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
            background: tab === key ? 'rgba(6,182,212,0.15)' : 'transparent',
            color: tab === key ? '#06b6d4' : '#64748b',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
          }}>{label}</button>
        ))}
      </div>

      {/* Book Tab */}
      {tab === 'book' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 16, padding: '2rem',
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.5rem' }}>Request New Appointment</h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.5rem' }}>
              State your medical problem. Our receptionist will review your details and assign the best fitting doctor for your condition.
            </p>

            {success && (
              <div style={{
                background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: 10, padding: '0.85rem 1rem', marginBottom: '1.25rem',
                color: '#10b981', fontSize: '0.875rem', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>✅ Appointment submitted! A receptionist will assign a doctor shortly.</div>
            )}

            <form onSubmit={handleBook} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Medical Problems / Symptoms *</label>
                <textarea value={reason} onChange={e => setReason(e.target.value)} rows={4} required
                  placeholder="Describe your medical condition, symptoms, or reason for visit in detail..."
                  style={{ ...inputStyle(), resize: 'vertical' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.4rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                  style={{ ...inputStyle(), colorScheme: 'dark' }}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.6rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preferred Time Slot</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.4rem' }}>
                  {timeSlots.map(t => (
                    <button key={t} type="button" onClick={() => setSlot(t)} style={{
                      padding: '0.45rem', borderRadius: 8, fontSize: '0.75rem',
                      border: `1px solid ${slot === t ? '#06b6d4' : 'rgba(255,255,255,0.08)'}`,
                      background: slot === t ? 'rgba(6,182,212,0.18)' : 'transparent',
                      color: slot === t ? '#06b6d4' : '#64748b',
                      cursor: 'pointer', fontFamily: 'inherit', fontWeight: slot === t ? 600 : 400, transition: 'all 0.15s',
                    }}>{t}</button>
                  ))}
                </div>
              </div>

              <button type="submit" style={{
                padding: '0.85rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 15px rgba(6,182,212,0.3)',
                marginTop: '0.5rem'
              }}>Submit Appointment Request →</button>
            </form>
          </div>

          {/* Workflow guide card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 16, padding: '1.5rem',
            }}>
              <h4 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700, color: '#06b6d4' }}>
                💡 How Appointment Scheduling Works
              </h4>
              <ol style={{ paddingLeft: '1.2rem', margin: 0, fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.8 }}>
                <li><strong>State Symptoms:</strong> Submit your appointment request with your medical symptoms.</li>
                <li><strong>Receptionist Assignment:</strong> Our medical receptionist reviews your profile and assigns the specialist doctor best suited for your condition.</li>
                <li><strong>Doctor Confirmation:</strong> The assigned doctor reviews your request and accepts or rejects the appointment.</li>
                <li><strong>Real-time Updates:</strong> Check your appointment history tab anytime to track live status updates!</li>
              </ol>
            </div>

            {[
              { icon: '🕐', title: 'Appointment Hours', body: 'Monday – Friday: 8 AM – 8 PM\nSaturday: 9 AM – 5 PM\nSunday: Emergency Only' },
              { icon: '📞', title: 'Need Assistance?', body: 'Call us at +1 (800) MEDICARE\nor email appointments@medicare-hms.com' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 14, padding: '1.25rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.title}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.7, margin: 0, whiteSpace: 'pre-line' }}>{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Your Appointment History & Live Status</h3>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Total: {appointmentsList.length}</span>
          </div>

          {appointmentsList.length === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
              No appointments found. Book your first appointment above!
            </div>
          ) : (
            appointmentsList.map((a) => {
              const badge = getStatusBadge(a.status, a.doctor)
              return (
                <div key={a.id} style={{
                  display: 'grid', gridTemplateColumns: '2fr 1.2fr 1.2fr 2fr',
                  alignItems: 'center', padding: '1.1rem 1.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', gap: '1rem', fontSize: '0.85rem',
                }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f1f5f9' }}>{a.reason}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                      Doctor: <strong style={{ color: a.doctor ? '#06b6d4' : '#f59e0b' }}>{a.doctor || 'Unassigned (Waiting for Receptionist)'}</strong>
                    </div>
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                    📅 {a.date}
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '0.82rem' }}>
                    🕐 {a.timeSlot || a.time}
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block', padding: '0.35rem 0.75rem', borderRadius: 100,
                      fontSize: '0.75rem', fontWeight: 700,
                      background: badge.bg, color: badge.color,
                      border: `1px solid ${badge.border}`,
                    }}>{badge.label}</span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}
    </DashboardLayout>
  )
}
