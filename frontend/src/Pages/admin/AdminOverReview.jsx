import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { api } from '../../config/api'

const navItems = [
  { label: 'Overview',     icon: '🏠', path: '/admin/overreview' },
  { label: 'Users',        icon: '👥', path: '/admin/users' },
  { label: 'Doctors',      icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Patients',     icon: '🧑‍⚕️', path: '/admin/patients' },
  { label: 'Appointments', icon: '📅', path: '/admin/appointments' },
  { label: 'Reports',      icon: '📊', path: '/admin/reports' },
]

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`,
      borderRadius: 16, padding: '1.5rem', transition: 'all 0.3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color+'55'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = color+'25'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: color+'18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{icon}</div>
      </div>
      <div style={{ fontSize: '2rem', fontWeight: 900, lineHeight: 1, margin: '0.75rem 0 0.3rem' }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>{label}</div>
    </div>
  )
}

export default function AdminOverReview() {
  const userName = localStorage.getItem('userName') || 'Admin'
  const [usersCount, setUsersCount] = useState(0)
  const [doctors, setDoctors] = useState([])
  const [patientsCount, setPatientsCount] = useState(0)
  const [appointmentsCount, setAppointmentsCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    try {
      const [uRes, dRes, pRes, aRes] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/doctors'),
        api.get('/api/patients'),
        api.get('/api/appointments'),
      ])
      if (uRes.data && uRes.data.data) setUsersCount(uRes.data.data.length)
      if (dRes.data && dRes.data.data) setDoctors(dRes.data.data)
      if (pRes.data && pRes.data.data) setPatientsCount(pRes.data.data.length)
      if (aRes.data && aRes.data.data) setAppointmentsCount(aRes.data.data.length)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const pendingDoctors = doctors.filter(d => d.status === 'Pending Approval' || d.status === 'Pending').length
  const activeDoctors = doctors.filter(d => d.status === 'Active' || d.status === 'Approved').length

  const stats = [
    { icon: '👥', label: 'Total Registered Users', value: loading ? '...' : usersCount.toString(), color: '#f59e0b' },
    { icon: '👨‍⚕️', label: 'Active Doctors', value: loading ? '...' : activeDoctors.toString(), color: '#3b82f6' },
    { icon: '⏳', label: 'Pending Doctor Approvals', value: loading ? '...' : pendingDoctors.toString(), color: '#f59e0b' },
    { icon: '🧑‍⚕️', label: 'Registered Patients', value: loading ? '...' : patientsCount.toString(), color: '#06b6d4' },
    { icon: '📅', label: 'Total Appointments', value: loading ? '...' : appointmentsCount.toString(), color: '#10b981' },
  ]

  // Group active doctors by department
  const deptCounts = {}
  doctors.forEach(d => {
    const spec = d.specialization || d.department || 'General'
    deptCounts[spec] = (deptCounts[spec] || 0) + 1
  })
  const deptEntries = Object.entries(deptCounts)

  return (
    <DashboardLayout role="admin" navItems={navItems}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(59,130,246,0.08))',
        border: '1px solid rgba(245,158,11,0.2)', borderRadius: 16,
        padding: '1.5rem 2rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, marginBottom: '0.3rem' }}>
            Welcome back, {userName}! 🛡️
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            Real-time management for Doctors, Users, Patients & Approvals
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <a href="/admin/doctors" style={{
            padding: '0.6rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
          }}>👨‍⚕️ Manage Doctors & Approvals</a>
          <a href="/admin/users" style={{
            padding: '0.6rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg,#f59e0b,#3b82f6)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
          }}>👥 System Users</a>
        </div>
      </div>

      {/* Pending Doctor Registration Alert */}
      {pendingDoctors > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.75rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>🔔</span>
            <div>
              <div style={{ fontWeight: 800, color: '#f59e0b', fontSize: '0.9rem' }}>Doctor Registration Approvals Pending</div>
              <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{pendingDoctors} doctor registration request(s) require Admin approval before they can log in.</div>
            </div>
          </div>
          <a href="/admin/doctors" style={{
            padding: '0.5rem 1rem', borderRadius: 8, background: '#f59e0b', color: '#000',
            fontWeight: 800, fontSize: '0.8rem', textDecoration: 'none'
          }}>Review & Approve →</a>
        </div>
      )}

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Charts + System status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
        {/* Department chart */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>🏥 Doctors by Department / Specialization</h3>
          {deptEntries.length === 0 ? (
            <div style={{ color: '#64748b', fontSize: '0.85rem' }}>No doctor department data available.</div>
          ) : (
            deptEntries.map(([dept, count]) => (
              <div key={dept} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <span style={{ width: 120, fontSize: '0.78rem', color: '#94a3b8', flexShrink: 0 }}>{dept}</span>
                <div style={{ flex: 1, height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (count / doctors.length) * 100)}%`, height: '100%', background: '#3b82f6', borderRadius: 5, transition: 'width 1s ease' }} />
                </div>
                <span style={{ width: 28, fontSize: '0.78rem', color: '#94a3b8', textAlign: 'right', flexShrink: 0 }}>{count}</span>
              </div>
            ))
          )}
        </div>

        {/* System Health */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.5rem' }}>
          <h3 style={{ margin: '0 0 1.25rem', fontSize: '0.95rem', fontWeight: 700 }}>⚙️ System & Server Status</h3>
          {[
            { label: 'Server Status',  value: 'Active', color: '#10b981', bar: 100 },
            { label: 'Database Health', value: 'Connected', color: '#06b6d4', bar: 100 },
            { label: 'API Gateway', value: 'Online (Port 5000)', color: '#3b82f6', bar: 100 },
          ].map(m => (
            <div key={m.label} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{m.label}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: m.color }}>{m.value}</span>
              </div>
              <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${m.bar}%`, height: '100%', background: m.color, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
