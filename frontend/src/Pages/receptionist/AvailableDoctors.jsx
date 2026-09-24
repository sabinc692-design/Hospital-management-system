import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'

const navItems = [
  { label: 'Overview',          icon: '🏠', path: '/reciptionist/overreview' },
  { label: 'Available Doctors', icon: '👨‍⚕️', path: '/reciptionist/availabledoctor' },
  { label: 'Incoming Patients', icon: '🚶', path: '/reciptionist/incomingpatient' },
]

const departments = ['All', 'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics', 'General', 'Pediatrics', 'Radiology']

const statusColors = { Available: '#10b981', Busy: '#f59e0b', Break: '#3b82f6', Off: '#64748b' }
const statusDots   = { Available: '🟢', Busy: '🟡', Break: '🔵', Off: '⚫' }

export default function AvailableDoctors() {
  const [dept, setDept]       = useState('All')
  const [search, setSearch]   = useState('')
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchDoctors = async () => {
    setLoading(true)
    let fetched = []
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('http://localhost:5001/api/doctors', { headers })
      if (res.data?.data) {
        fetched = res.data.data.map(d => ({
          name: `Dr. ${d.firstName} ${d.lastName || ''}`.trim(),
          dept: d.doctorProfile?.specialization || 'General',
          status: d.user?.status === 'Active' ? 'Available' : 'Busy',
          shift: 'Morning',
          patients: 0,
          max: 8,
          room: '101',
          avatar: '👨‍⚕️'
        }))
      }
    } catch (e) {
      console.log('Available doctors fetch notice:', e.message)
    }

    const storedLocal = JSON.parse(localStorage.getItem('hms_doctors') || '[]')
    const localActive = storedLocal.filter(d => d.status === 'Active').map(d => ({
      name: d.name,
      dept: d.department || d.spec || 'General',
      status: 'Available',
      shift: 'Morning',
      patients: 0,
      max: 8,
      room: '102',
      avatar: '👨‍⚕️'
    }))

    const combinedMap = new Map()
    fetched.forEach(d => combinedMap.set(d.name, d))
    localActive.forEach(d => {
      if (!combinedMap.has(d.name)) combinedMap.set(d.name, d)
    })

    setDoctors(Array.from(combinedMap.values()))
    setLoading(false)
  }

  useEffect(() => {
    fetchDoctors()
  }, [])

  const filtered = doctors.filter(d =>
    (dept === 'All' || d.dept === dept) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  const summary = {
    Available: doctors.filter(d => d.status === 'Available').length,
    Busy:      doctors.filter(d => d.status === 'Busy').length,
    Break:     doctors.filter(d => d.status === 'Break').length,
    Off:       doctors.filter(d => d.status === 'Off').length,
  }

  return (
    <DashboardLayout role="receptionist" navItems={navItems}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Available Doctors</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Real-time doctor availability from database for patient assignments</p>
      </div>

      {/* Summary chips */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {Object.entries(summary).map(([status, count]) => (
          <div key={status} style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: statusColors[status] + '15', border: `1px solid ${statusColors[status]}30`,
            borderRadius: 10, padding: '0.45rem 1rem', fontSize: '0.82rem', fontWeight: 600, color: statusColors[status],
          }}>
            {statusDots[status]} {count} {status}
          </div>
        ))}
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input type="text" placeholder="🔍 Search doctor by name..." value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10,
            padding: '0.65rem 1rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
          }}
        />
      </div>

      {/* Department pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {departments.map(d => (
          <button key={d} onClick={() => setDept(d)} style={{
            padding: '0.3rem 0.85rem', borderRadius: 100,
            border: `1px solid ${dept === d ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
            background: dept === d ? 'rgba(139,92,246,0.15)' : 'transparent',
            color: dept === d ? '#8b5cf6' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
          }}>{d}</button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 2fr 1fr',
          padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: '#374151',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <span>Doctor</span><span>Department</span><span>Status</span><span>Room</span><span>Patients Today</span><span>Shift</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading doctor records from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No available doctors found in database.
          </div>
        ) : (
          filtered.map((d, i) => (
            <div key={i} style={{
              display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 2fr 1fr',
              alignItems: 'center', padding: '1rem 1.25rem',
              borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s', gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>{d.avatar}</div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{d.name}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{d.dept}</div>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                padding: '0.2rem 0.65rem', borderRadius: 100, fontSize: '0.72rem', fontWeight: 600,
                background: statusColors[d.status] + '20', color: statusColors[d.status],
                border: `1px solid ${statusColors[d.status]}35`,
              }}>{statusDots[d.status]} {d.status}</span>
              <div style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Room {d.room}</div>
              <div>
                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden', marginBottom: '0.25rem' }}>
                  <div style={{ width: `0%`, height: '100%', background: `linear-gradient(90deg,#8b5cf6,#06b6d4)`, borderRadius: 3 }} />
                </div>
                <div style={{ fontSize: '0.68rem', color: '#374151' }}>{d.patients} / {d.max} patients</div>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>{d.shift}</div>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  )
}