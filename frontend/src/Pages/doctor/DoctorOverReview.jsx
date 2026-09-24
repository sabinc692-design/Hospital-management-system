import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { api } from '../../config/api'

const navItems = [
  { label: 'Overview',        icon: '🏠', path: '/doctor/overreview' },
  { label: 'Patient Requests',icon: '📋', path: '/doctor/patientrequest' },
]

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${color}25`,
      borderRadius: 16, padding: '1.5rem', transition: 'all 0.3s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = color + '55'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = color + '25'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: '0.75rem' }}>{icon}</div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1, marginBottom: '0.3rem' }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#94a3b8' }}>{label}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '0.2rem' }}>{sub}</div>}
    </div>
  )
}

const statusColors = { Approved: '#10b981', DoctorAssigned: '#f59e0b', Pending: '#f59e0b', Cancelled: '#ef4444', Rejected: '#ef4444' }

export default function DoctorOverReview() {
  const userName = localStorage.getItem('userName') || 'Doctor'
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAppointments = async () => {
    try {
      const res = await api.get('/api/appointments')
      if (res.data && res.data.data) {
        setAppointments(res.data.data)
      }
    } catch (err) {
      console.error('Fetch doctor appointments error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()
    const interval = setInterval(fetchAppointments, 3000)
    return () => clearInterval(interval)
  }, [])

  const assignedRequests = appointments.filter(a => a.status === 'assigned')
  const approvedAppointments = appointments.filter(a => a.status === 'accepted' || a.status === 'confirmed')


  const stats = [
    { icon: '👥', label: "Total Assigned Appointments", value: appointments.length.toString(), sub: `${assignedRequests.length} pending review`, color: '#3b82f6' },
    { icon: '📋', label: 'Pending Requests', value: assignedRequests.length.toString(), sub: 'Requires accept/reject', color: '#06b6d4' },
    { icon: '✅', label: 'Approved Appointments', value: approvedAppointments.length.toString(), sub: 'Confirmed consultations', color: '#10b981' },
  ]

  return (
    <DashboardLayout role="doctor" navItems={navItems}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(59,130,246,0.12),rgba(6,182,212,0.08))',
        border: '1px solid rgba(59,130,246,0.2)', borderRadius: 16,
        padding: '1.5rem 2rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, marginBottom: '0.3rem' }}>
            Good morning, {userName}! 🩺
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            You have <strong style={{ color: '#3b82f6' }}>{assignedRequests.length} pending request(s)</strong> to review.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/doctor/patientrequest" style={{
            padding: '0.6rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
          }}>View Requests</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Today's schedule */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: '1.5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>📅 Assigned Appointments</h3>
            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          <div style={{ padding: '0.5rem' }}>
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>Loading schedule...</div>
            ) : appointments.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No appointments assigned to you yet.</div>
            ) : (
              appointments.map((s) => {
                const patUser = s.patient?.user || s.Patient?.user || s.user || {}
                const pName = (patUser.firstName || patUser.lastName)
                  ? `${patUser.firstName || ''} ${patUser.lastName || ''}`.trim()
                  : 'Patient'
                const displayColor = statusColors[s.status] || '#f59e0b'
                const formattedStatus = s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : 'Pending'
                const displayDate = s.appointmentDate ? new Date(s.appointmentDate).toISOString().split('T')[0] : 'TBD'
                return (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', gap: '1rem',
                    padding: '0.85rem', borderRadius: 10, marginBottom: '0.25rem',
                    background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  >
                    <div style={{ textAlign: 'center', width: 90, flexShrink: 0 }}>
                      <div style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 700 }}>{s.timeSlot || '10:00 AM'}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748b' }}>{displayDate}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{pName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{s.reason || 'Medical Problem'}</div>
                    </div>
                    <span style={{
                      fontSize: '0.68rem', padding: '0.2rem 0.55rem', borderRadius: 100,
                      background: displayColor + '20', color: displayColor,
                      border: `1px solid ${displayColor}30`, fontWeight: 600,
                    }}>{formattedStatus}</span>
                  </div>
                )
              })
            )}

          </div>
        </div>

        {/* Quick stats panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {assignedRequests.length > 0 && (
            <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 14, padding: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>🔔</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: '#10b981' }}>{assignedRequests.length} New Patient Request(s)</span>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.82rem', lineHeight: 1.6, margin: '0 0 0.75rem' }}>
                You have pending appointment requests assigned by receptionist awaiting your approval.
              </p>
              <a href="/doctor/patientrequest" style={{
                display: 'inline-block', padding: '0.45rem 1rem', borderRadius: 8,
                background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#10b981', textDecoration: 'none', fontSize: '0.78rem', fontWeight: 600,
              }}>Review Requests →</a>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
