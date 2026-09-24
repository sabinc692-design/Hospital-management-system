import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { API_BASE_URL } from '../../config/api'

const navItems = [
  { label: 'Overview',     icon: '🏠', path: '/admin/overreview' },
  { label: 'Users',        icon: '👥', path: '/admin/users' },
  { label: 'Doctors',      icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Patients',     icon: '🧑‍⚕️', path: '/admin/patients' },
  { label: 'Appointments', icon: '📅', path: '/admin/appointments' },
  { label: 'Reports',      icon: '📊', path: '/admin/reports' },
]

const statusColors = { Confirmed: '#10b981', confirmed: '#10b981', Pending: '#f59e0b', pending: '#f59e0b', assigned: '#3b82f6', accepted: '#10b981', Cancelled: '#ef4444', rejected: '#ef4444', Completed: '#3b82f6' }

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [search, setSearch] = useState('')

  React.useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/appointments`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const apts = data.data.map(a => ({
            id: a.id.substring(0, 8),
            patient: a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Unknown',
            doctor: a.doctor ? `Dr. ${a.doctor.user?.firstName || a.doctor.firstName} ${a.doctor.user?.lastName || a.doctor.lastName}` : 'Unassigned',
            dept: 'General',
            date: new Date(a.appointmentDate).toISOString().split('T')[0],
            time: a.timeSlot || '10:00 AM',
            status: a.status || 'Pending'
          }))
          setAppointments(apts)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const filtered = appointments.filter(a => a.patient.toLowerCase().includes(search.toLowerCase()) || a.doctor.toLowerCase().includes(search.toLowerCase()))

  return (
    <DashboardLayout role="admin" navItems={navItems}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>All Appointments</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Global view of hospital appointments</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input type="text" placeholder="🔍 Search by patient or doctor name..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 1rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
          onFocus={e => e.target.style.borderColor = '#10b981'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1.5fr 1fr',
          padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: '#374151',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '0.5rem',
        }}>
          <span>ID</span><span>Patient</span><span>Doctor</span><span>Department</span><span>Date & Time</span><span>Status</span>
        </div>
        {filtered.map((a, i) => (
          <div key={a.id + i} style={{
            display: 'grid', gridTemplateColumns: '1fr 2fr 2fr 1.5fr 1.5fr 1fr',
            alignItems: 'center', padding: '0.9rem 1.25rem', gap: '0.5rem',
            borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s',
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{a.id}</div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{a.patient}</div>
            <div style={{ fontSize: '0.82rem', color: '#f1f5f9' }}>{a.doctor}</div>
            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{a.dept}</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{a.date}<br/><span style={{ fontSize: '0.7rem', color: '#64748b' }}>{a.time}</span></div>
            <span style={{
              display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700,
              background: (statusColors[a.status] || '#94a3b8')+'20', color: (statusColors[a.status] || '#94a3b8'), border: `1px solid ${(statusColors[a.status] || '#94a3b8')}35`,
            }}>{a.status}</span>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
