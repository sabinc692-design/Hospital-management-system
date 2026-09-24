import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const navItems = [
  { label: 'Overview',    icon: '🏠', path: '/patient/overreview' },
  { label: 'Doctors',     icon: '👨‍⚕️', path: '/patient/doctors' },
  { label: 'Appointment', icon: '📅', path: '/patient/appointmet' },
]

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: `1px solid ${color}25`,
      borderRadius: 16, padding: '1.5rem',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      transition: 'all 0.3s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = color + '25'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: color + '18', border: `1px solid ${color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
      }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{sub}</div>}
    </div>
  )
}

function AppointmentRow({ doctor, dept, date, time, status }) {
  const statusColors = { Approved: '#10b981', Pending: '#f59e0b', Cancelled: '#ef4444', Rejected: '#ef4444', DoctorAssigned: '#3b82f6' }
  const displayColor = statusColors[status] || '#f59e0b'
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr',
      alignItems: 'center', padding: '0.85rem 1rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontSize: '0.85rem', gap: '0.5rem',
    }}>
      <div style={{ fontWeight: 600 }}>{doctor || 'Not assigned yet'}</div>
      <div style={{ color: '#64748b' }}>{dept || 'General'}</div>
      <div style={{ color: '#94a3b8' }}>{date || 'N/A'}</div>
      <div style={{ color: '#94a3b8' }}>{time || 'N/A'}</div>
      <span style={{
        display: 'inline-block', padding: '0.2rem 0.65rem',
        borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
        background: displayColor + '20',
        color: displayColor,
        border: `1px solid ${displayColor}40`,
      }}>{status}</span>
    </div>
  )
}

export default function OverReview() {
  const userName = localStorage.getItem('userName') || 'Patient'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const storedUserObj = JSON.parse(localStorage.getItem('user') || '{}')
      const myId = storedUserObj.id

      const res = await axios.get('http://localhost:5001/api/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.data && res.data.data) {
        const all = res.data.data
        const mine = myId ? all.filter(a => a.patientId === myId || a.user?.id === myId || a.patient?.userId === myId) : all
        setAppointments(mine)
      }
    } catch (err) {
      console.error('Fetch appointments error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 3000)
    return () => clearInterval(interval)
  }, [])


  const approvedCount = appointments.filter(a => a.status === 'accepted' || a.status === 'confirmed').length
  const pendingCount = appointments.filter(a => a.status === 'pending' || a.status === 'assigned').length

  const stats = [
    { icon: '📅', label: 'Total Appointments', value: appointments.length.toString(), sub: `${pendingCount} pending / in review`, color: '#06b6d4' },
    { icon: '👨‍⚕️', label: 'Approved Appointments', value: approvedCount.toString(), sub: 'Confirmed consultations', color: '#3b82f6' },
    { icon: '💊', label: 'Active Requests', value: pendingCount.toString(), sub: 'Awaiting doctor assignment/confirmation', color: '#8b5cf6' },
  ]

  return (
    <DashboardLayout role="patient" navItems={navItems}>
      {/* Welcome banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(59,130,246,0.08))',
        border: '1px solid rgba(6,182,212,0.2)',
        borderRadius: 16, padding: '1.5rem 2rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, marginBottom: '0.3rem' }}>
            Good morning, {userName}! 👋
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Here's a summary of your health activity.
          </p>
        </div>
        <a href="/patient/appointmet" style={{
          padding: '0.6rem 1.25rem', borderRadius: 10,
          background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
          color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
          boxShadow: '0 4px 15px rgba(6,182,212,0.3)',
        }}>+ Book Appointment</a>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Upcoming appointments table */}
      <div style={{
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 16, overflow: 'hidden',
      }}>
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Recent Appointments</h3>
          <a href="/patient/appointmet" style={{ fontSize: '0.78rem', color: '#06b6d4', textDecoration: 'none' }}>View all →</a>
        </div>
        {/* Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 1fr 1fr',
          padding: '0.65rem 1rem', fontSize: '0.72rem',
          color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255,255,255,0.02)',
        }}>
          <span>Doctor</span><span>Department</span><span>Date</span><span>Time</span><span>Status</span>
        </div>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>Loading appointments...</div>
        ) : appointments.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No appointments booked yet.</div>
        ) : (
          appointments.map((a) => {
            const docUser = a.doctor?.user || a.Doctor?.user || {}
            const docName = (docUser.firstName || docUser.lastName)
              ? `Dr. ${docUser.firstName || ''} ${docUser.lastName || ''}`.trim()
              : (a.doctor ? `Dr. ${a.doctor.firstName || ''} ${a.doctor.lastName || ''}`.trim() : null)
            const deptName = a.doctor?.specialization || a.doctor?.user?.specialization || 'General'
            const displayDate = a.appointmentDate ? new Date(a.appointmentDate).toISOString().split('T')[0] : 'N/A'
            const formattedStatus = a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'

            return (
              <AppointmentRow 
                key={a.id}
                doctor={docName}
                dept={deptName}
                date={displayDate}
                time={a.timeSlot || '10:00 AM'}
                status={formattedStatus}
              />
            )
          })
        )}
      </div>


      {/* Health tip */}
      <div style={{
        marginTop: '1.5rem',
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 14, padding: '1rem 1.25rem',
        display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
      }}>
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>💡</span>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem', color: '#10b981' }}>Health Tip of the Day</div>
          <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>
            Regular health check-ups can detect problems early. Stay hydrated, maintain an active lifestyle, and follow your doctor's recommendations.
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}