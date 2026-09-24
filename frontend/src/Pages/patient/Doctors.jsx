import React, { useState } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import { API_BASE_URL } from '../../config/api'

const navItems = [
  { label: 'Overview',    icon: '🏠', path: '/patient/overreview' },
  { label: 'Doctors',     icon: '👨‍⚕️', path: '/patient/doctors' },
  { label: 'Appointment', icon: '📅', path: '/patient/appointmet' },
]

const specializations = ['All', 'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology', 'General', 'Radiology']



function DoctorCard({ name, spec, exp, rating, patients, available, avatar }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(6,182,212,0.3)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16, padding: '1.5rem',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-3px)' : 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          background: 'linear-gradient(135deg,rgba(6,182,212,0.2),rgba(59,130,246,0.2))',
          border: '1px solid rgba(6,182,212,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem',
        }}>{avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{name}</div>
          <div style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 500 }}>{spec}</div>
          <div style={{ marginTop: '0.25rem' }}>
            <span style={{
              fontSize: '0.68rem', padding: '0.15rem 0.5rem', borderRadius: 100,
              background: available ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: available ? '#10b981' : '#ef4444',
              border: `1px solid ${available ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              fontWeight: 600,
            }}>{available ? '● Available' : '● Unavailable'}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>⭐ {rating}</div>
          <div style={{ fontSize: '0.68rem', color: '#374151' }}>Rating</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{patients.toLocaleString()}</div>
          <div style={{ fontSize: '0.68rem', color: '#374151' }}>Patients</div>
        </div>
        <div style={{ flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700 }}>{exp}</div>
          <div style={{ fontSize: '0.68rem', color: '#374151' }}>Exp.</div>
        </div>
      </div>

      <button disabled={!available} style={{
        width: '100%', padding: '0.6rem',
        borderRadius: 10, border: 'none',
        background: available ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : 'rgba(255,255,255,0.06)',
        color: available ? '#fff' : '#374151',
        fontWeight: 600, fontSize: '0.82rem',
        cursor: available ? 'pointer' : 'not-allowed',
        fontFamily: 'inherit', transition: 'all 0.2s',
      }}>
        {available ? 'Book Appointment' : 'Not Available'}
      </button>
    </div>
  )
}

export default function Doctors() {
  const [search, setSearch] = useState('')
  const [activeSpec, setActiveSpec] = useState('All')
  const [doctorsList, setDoctorsList] = useState([])

  React.useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    fetch(`${API_BASE_URL}/api/doctors`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const docs = data.data.map(d => ({
            name: `Dr. ${d.firstName} ${d.lastName}`,
            spec: d.doctorProfile?.specialization || 'General',
            exp: `${d.doctorProfile?.experienceYears || 0} yrs`,
            rating: 4.8,
            patients: 0,
            available: true,
            avatar: d.gender === 'Female' ? '👩‍⚕️' : '👨‍⚕️'
          }))
          setDoctorsList(docs)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const filtered = doctorsList.filter(d =>
    (activeSpec === 'All' || d.spec === activeSpec) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <DashboardLayout role="patient" navItems={navItems}>
      {/* Header */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Find a Doctor</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Browse our specialist doctors and book an appointment</p>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        <input
          type="text" placeholder="🔍  Search doctor by name..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, padding: '0.65rem 1rem',
            color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit',
          }}
          onFocus={e => e.target.style.borderColor = '#06b6d4'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>

      {/* Specialization pills */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        {specializations.map(s => (
          <button key={s} onClick={() => setActiveSpec(s)} style={{
            padding: '0.35rem 0.9rem', borderRadius: 100,
            border: `1px solid ${activeSpec === s ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
            background: activeSpec === s ? 'rgba(6,182,212,0.15)' : 'transparent',
            color: activeSpec === s ? '#06b6d4' : '#64748b',
            fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}>{s}</button>
        ))}
      </div>

      {/* Doctor Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1.25rem' }}>
        {filtered.length > 0
          ? filtered.map(d => <DoctorCard key={d.name} {...d} />)
          : <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#374151', fontSize: '0.875rem' }}>
              No doctors found matching your search.
            </div>
        }
      </div>
    </DashboardLayout>
  )
}

