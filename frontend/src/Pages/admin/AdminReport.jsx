import React from 'react'
import DashboardLayout from '../../components/DashboardLayout'

const navItems = [
  { label: 'Overview',     icon: '🏠', path: '/admin/overreview' },
  { label: 'Users',        icon: '👥', path: '/admin/users' },
  { label: 'Doctors',      icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Patients',     icon: '🧑‍⚕️', path: '/admin/patients' },
  { label: 'Appointments', icon: '📅', path: '/admin/appointments' },
  { label: 'Reports',      icon: '📊', path: '/admin/reports' },
]

export default function AdminReport() {
  return (
    <DashboardLayout role="admin" navItems={navItems}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>System Reports</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Generate and download analytics and reports</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '1.5rem' }}>
        {[
          { title: 'Financial Report', desc: 'Revenue, expenses, and billing summaries.', icon: '💰', color: '#10b981' },
          { title: 'Patient Demographics', desc: 'Age, gender, and regional distribution.', icon: '🧑‍⚕️', color: '#06b6d4' },
          { title: 'Department Performance', desc: 'Patient load and appointment completion rates.', icon: '🏥', color: '#3b82f6' },
          { title: 'Staff Attendance', desc: 'Doctor and receptionist duty logs.', icon: '⏱️', color: '#f59e0b' },
        ].map(r => (
          <div key={r.title} style={{
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: r.color+'15', border: `1px solid ${r.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>{r.icon}</div>
            <div>
              <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', fontWeight: 700 }}>{r.title}</h3>
              <p style={{ margin: 0, fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.5 }}>{r.desc}</p>
            </div>
            <button style={{
              marginTop: 'auto', padding: '0.6rem 1rem', borderRadius: 8, border: `1px solid ${r.color}40`,
              background: 'transparent', color: r.color, fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
              transition: 'all 0.2s'
            }} onMouseEnter={e => e.currentTarget.style.background = r.color+'10'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              Download PDF ⬇️
            </button>
          </div>
        ))}
      </div>
    </DashboardLayout>
  )
}
