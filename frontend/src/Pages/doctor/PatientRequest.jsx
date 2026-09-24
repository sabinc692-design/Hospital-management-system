import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'

const navItems = [
  { label: 'Overview',         icon: '🏠', path: '/doctor/overreview' },
  { label: 'Patient Requests', icon: '📋', path: '/doctor/patientrequest' },
]

const initialAppointments = []

export default function PatientRequest() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter]             = useState('All')
  const [updatingId, setUpdatingId]     = useState(null)

  const fetchRealAppointments = async () => {
    let fetched = []
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('http://localhost:5001/api/appointments', { headers })
      if (res.data?.data) {
        fetched = res.data.data.map(a => ({
          id: a.id,
          patientName: a.user ? `${a.user.firstName} ${a.user.lastName}`.trim() : 'Patient',
          patientDetails: {
            age: a.user?.dateOfBirth ? Math.floor((new Date() - new Date(a.user.dateOfBirth)) / 31557600000) : 30,
            gender: a.user?.gender || 'N/A',
            phone: a.user?.phone || 'N/A',
            email: a.user?.email || 'N/A',
            bloodGroup: a.user?.patientProfile?.bloodGroup || 'O+',
            address: a.user?.address || 'N/A'
          },
          date: new Date(a.appointmentDate).toISOString().split('T')[0],
          timeSlot: a.timeSlot || '10:00 AM',
          reason: a.reason || 'Medical Condition',
          doctor: a.doctor ? `Dr. ${a.doctor.user?.firstName || a.doctor.firstName} ${a.doctor.user?.lastName || a.doctor.lastName || ''}`.trim() : null,
          status: a.status || 'pending',
          createdAt: a.createdAt
        }))
      }
    } catch (e) {
      console.log('Fetch appointments notice:', e.message)
    }

    const storedLocal = JSON.parse(localStorage.getItem('hms_appointments') || '[]')
    const combinedMap = new Map()
    fetched.forEach(item => combinedMap.set(item.id, item))
    storedLocal.forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item)
    })

    setAppointments(Array.from(combinedMap.values()))
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

  const handleResponse = async (id, responseStatus) => {
    setUpdatingId(id)

    // Sync backend if available
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.put(`http://localhost:5001/api/appointments/${id}/respond`, {
        status: responseStatus
      }, { headers })
    } catch (err) {
      console.log('Backend sync notice:', err.message)
    }

    const updated = appointments.map(apt => {
      if (apt.id === id) {
        return { ...apt, status: responseStatus }
      }
      return apt
    })

    localStorage.setItem('hms_appointments', JSON.stringify(updated))
    setAppointments(updated)
    setUpdatingId(null)
  }

  // Show all assigned/accepted/rejected appointments
  const assignedAppointments = appointments.filter(a => a.doctor && a.status !== 'pending')

  const filtered = filter === 'All'
    ? assignedAppointments
    : assignedAppointments.filter(a => a.status.toLowerCase() === filter.toLowerCase())

  const statusColors = {
    assigned: '#3b82f6',
    accepted: '#10b981',
    confirmed: '#10b981',
    rejected: '#ef4444'
  }

  return (
    <DashboardLayout role="doctor" navItems={navItems}>
      <div style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Assigned Patient Requests</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Review appointments assigned by receptionist & accept or reject</p>
        </div>

        {/* Summary chips */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[
            { label: 'Assigned', count: assignedAppointments.filter(r => r.status === 'assigned').length,  color: '#3b82f6' },
            { label: 'Accepted', count: assignedAppointments.filter(r => r.status === 'accepted' || r.status === 'confirmed').length, color: '#10b981' },
            { label: 'Rejected', count: assignedAppointments.filter(r => r.status === 'rejected').length, color: '#ef4444' },
          ].map(c => (
            <div key={c.label} style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              background: c.color + '15', border: `1px solid ${c.color}30`,
              borderRadius: 8, padding: '0.3rem 0.75rem', fontSize: '0.78rem', fontWeight: 600, color: c.color,
            }}>
              <span style={{ fontWeight: 800 }}>{c.count}</span> {c.label}
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {['All', 'Assigned', 'Accepted', 'Rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '0.45rem 1rem', borderRadius: 10,
            border: `1px solid ${filter === f ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
            background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
            color: filter === f ? '#3b82f6' : '#64748b',
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
          }}>{f}</button>
        ))}
      </div>

      {/* Request cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', background: 'rgba(255,255,255,0.02)', borderRadius: 16 }}>
            No appointments assigned to you under filter "{filter}".
          </div>
        ) : (
          filtered.map(req => (
            <div key={req.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${req.status === 'assigned' ? 'rgba(59,130,246,0.3)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: 14, padding: '1.25rem 1.5rem',
              display: 'grid', gridTemplateColumns: 'auto 1fr auto auto',
              alignItems: 'center', gap: '1.25rem', transition: 'all 0.2s',
            }}>
              {/* Avatar */}
              <div style={{
                width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
              }}>🧑‍⚕️</div>

              {/* Info & Patient details */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{req.patientName}</span>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {req.patientDetails?.gender || 'Male'} · Age {req.patientDetails?.age || '30'} · Blood: {req.patientDetails?.bloodGroup || 'O+'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#3b82f6', fontWeight: 600 }}>
                    Assigned: {req.doctor}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.3rem' }}>
                  📅 {req.date} &nbsp;|&nbsp; 🕐 {req.timeSlot || req.time} &nbsp;|&nbsp; 📞 {req.patientDetails?.phone || '+1 555-0192'}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#f1f5f9', lineHeight: 1.5, background: 'rgba(255,255,255,0.03)', padding: '0.5rem 0.75rem', borderRadius: 8, marginTop: '0.4rem' }}>
                  <strong>Medical Condition / Reason:</strong> "{req.reason}"
                </div>
              </div>

              {/* Status badge */}
              <span style={{
                display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: 100, flexShrink: 0,
                fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize',
                background: (statusColors[req.status] || '#94a3b8') + '20',
                color: statusColors[req.status] || '#94a3b8',
                border: `1px solid ${(statusColors[req.status] || '#94a3b8')}35`,
              }}>
                {req.status === 'assigned' ? '🔵 Assigned (Awaiting Acceptance)'
                 : req.status === 'accepted' ? '🟢 Accepted'
                 : req.status === 'rejected' ? '🔴 Rejected'
                 : req.status}
              </span>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                {req.status === 'assigned' ? (
                  <>
                    <button
                      disabled={updatingId === req.id}
                      onClick={() => handleResponse(req.id, 'accepted')}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(16,185,129,0.35)',
                        background: 'rgba(16,185,129,0.15)', color: '#10b981',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.15)'}
                    >
                      ✓ Accept
                    </button>
                    <button
                      disabled={updatingId === req.id}
                      onClick={() => handleResponse(req.id, 'rejected')}
                      style={{
                        padding: '0.5rem 1rem', borderRadius: 8, border: '1px solid rgba(239,68,68,0.35)',
                        background: 'rgba(239,68,68,0.15)', color: '#ef4444',
                        fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.3)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.15)'}
                    >
                      ✕ Reject
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleResponse(req.id, req.status === 'accepted' ? 'rejected' : 'accepted')}
                    style={{
                      padding: '0.4rem 0.8rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                      background: 'transparent', color: '#94a3b8', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit'
                    }}
                  >
                    Change to {req.status === 'accepted' ? 'Reject' : 'Accept'} ✎
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}
