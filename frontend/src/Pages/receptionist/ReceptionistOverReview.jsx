import React, { useState, useEffect } from 'react'
import axios from 'axios'
import DashboardLayout from '../../components/DashboardLayout'

const navItems = [
  { label: 'Overview',          icon: '🏠', path: '/reciptionist/overreview' },
  { label: 'Available Doctors', icon: '👨‍⚕️', path: '/reciptionist/availabledoctor' },
  { label: 'Incoming Patients', icon: '🚶', path: '/reciptionist/incomingpatient' },
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

export default function ReceptionistOverReview() {
  const userName = localStorage.getItem('userName') || 'Receptionist'
  const [appointments, setAppointments] = useState([])
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
      const headers = { Authorization: `Bearer ${token}` }
      const [appRes, docRes, patRes] = await Promise.all([
        axios.get('http://localhost:5001/api/appointments', { headers }),
        axios.get('http://localhost:5001/api/doctors', { headers }),
        axios.get('http://localhost:5001/api/patients', { headers }),
      ])
      if (appRes.data && appRes.data.data) setAppointments(appRes.data.data)
      if (docRes.data && docRes.data.data) setDoctors(docRes.data.data)
      if (patRes.data && patRes.data.data) setPatients(patRes.data.data)
    } catch (err) {
      console.error('Fetch receptionist overview error:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [])

  const unassignedApps = appointments.filter(a => a.status === 'pending')


  const stats = [
    { icon: '🚶', label: 'Registered Patients', value: patients.length.toString(), sub: 'Total patients in DB', color: '#8b5cf6' },
    { icon: '👨‍⚕️', label: 'Available Doctors', value: doctors.length.toString(), sub: 'Registered active doctors', color: '#06b6d4' },
    { icon: '📅', label: 'Total Appointments', value: appointments.length.toString(), sub: `${unassignedApps.length} pending doctor assignment`, color: '#3b82f6' },
  ]

  return (
    <DashboardLayout role="receptionist" navItems={navItems}>
      {/* Welcome */}
      <div style={{
        background: 'linear-gradient(135deg,rgba(139,92,246,0.12),rgba(6,182,212,0.08))',
        border: '1px solid rgba(139,92,246,0.2)', borderRadius: 16,
        padding: '1.5rem 2rem', marginBottom: '1.75rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, marginBottom: '0.3rem' }}>
            Welcome back, {userName}! 🗂️
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
            <strong style={{ color: '#8b5cf6' }}>{unassignedApps.length} appointment(s)</strong> waiting for doctor assignment.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <a href="/reciptionist/incomingpatient" style={{
            padding: '0.6rem 1.25rem', borderRadius: 10,
            background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)',
            color: '#fff', textDecoration: 'none', fontWeight: 600, fontSize: '0.85rem',
            boxShadow: '0 4px 15px rgba(139,92,246,0.3)',
          }}>Manage Appointments →</a>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
        {stats.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Activity log + Quick links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '1.5rem' }}>
        {/* Activity log */}
        <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>🕐 Appointment Requests Log</h3>
          </div>
          <div style={{ padding: '0.75rem' }}>
            {loading ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>No appointment requests logged yet.</div>
            ) : (
              appointments.map((a) => {
                const patUser = a.patient?.user || a.Patient?.user || a.user || {}
                const patName = (patUser.firstName || patUser.lastName)
                  ? `${patUser.firstName || ''} ${patUser.lastName || ''}`.trim()
                  : 'Patient'
                const docUser = a.doctor?.user || a.Doctor?.user || {}
                const docName = (docUser.firstName || docUser.lastName)
                  ? `Dr. ${docUser.firstName || ''} ${docUser.lastName || ''}`.trim()
                  : (a.doctor ? `Dr. ${a.doctor.firstName || ''} ${a.doctor.lastName || ''}`.trim() : 'Unassigned')

                return (
                  <div key={a.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.85rem',
                    padding: '0.75rem', borderRadius: 10, marginBottom: '0.2rem',
                    background: 'rgba(255,255,255,0.02)', transition: 'background 0.2s',
                  }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                      background: '#06b6d418', border: '1px solid #06b6d430',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>📅</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{patName}</div>
                      <div style={{ fontSize: '0.72rem', color: '#06b6d4', marginBottom: '0.1rem' }}>Problem: {a.reason || 'N/A'}</div>
                      <div style={{ fontSize: '0.68rem', color: '#64748b' }}>Assigned Doc: {docName} &bull; Status: {a.status}</div>
                    </div>
                  </div>
                )
              })
            )}

          </div>
        </div>

        {/* Quick actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 1rem', fontSize: '0.95rem', fontWeight: 700 }}>⚡ Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: 'View Incoming Appointments', icon: '🚶', href: '/reciptionist/incomingpatient', color: '#06b6d4' },
                { label: 'Check Doctor Availability', icon: '👨‍⚕️', href: '/reciptionist/availabledoctor', color: '#8b5cf6' },
              ].map(a => (
                <a key={a.label} href={a.href} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.75rem 1rem', borderRadius: 10,
                  background: a.color + '0f', border: `1px solid ${a.color}25`,
                  textDecoration: 'none', color: a.color, fontWeight: 600, fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = a.color + '1e'}
                  onMouseLeave={e => e.currentTarget.style.background = a.color + '0f'}
                >
                  <span style={{ fontSize: '1.1rem' }}>{a.icon}</span> {a.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
