import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'
import { API_BASE_URL } from '../../config/api'

const navItems = [
  { label: 'Overview',     icon: '🏠', path: '/admin/overreview' },
  { label: 'Users',        icon: '👥', path: '/admin/users' },
  { label: 'Doctors',      icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Patients',     icon: '🧑‍⚕️', path: '/admin/patients' },
  { label: 'Appointments', icon: '📅', path: '/admin/appointments' },
  { label: 'Reports',      icon: '📊', path: '/admin/reports' },
]

const statusColors = { Active: '#10b981', Inactive: '#64748b' }

export default function AdminPatients() {
  const [patients, setPatients]             = useState([])
  const [search, setSearch]                 = useState('')
  const [editingPatient, setEditingPatient] = useState(null)
  const [loading, setLoading]               = useState(true)

  const fetchRealPatients = async () => {
    setLoading(true)
    let fetched = []
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}/api/patients`, { headers })
      if (res.data?.data) {
        fetched = res.data.data.map(p => ({
          id: p.id,
          name: `${p.user?.firstName || p.firstName || ''} ${p.user?.lastName || p.lastName || ''}`.trim() || 'Patient',
          age: p.user?.dateOfBirth ? Math.floor((new Date() - new Date(p.user.dateOfBirth)) / 31557600000) : 30,
          gender: p.user?.gender || 'N/A',
          contact: p.user?.phone || p.emergencyContactPhone || 'N/A',
          email: p.user?.email || 'N/A',
          bloodGroup: p.bloodGroup || 'N/A',
          address: p.user?.address || 'N/A',
          status: p.user?.status || 'Active'
        }))
      }
    } catch (err) {
      console.log('Patients API fetch notice:', err.message)
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const userRes = await axios.get(`${API_BASE_URL}/api/users`, { headers })
      if (userRes.data?.data) {
        const patientUsers = userRes.data.data.filter(u => u.role === 'Patient')
        patientUsers.forEach(u => {
          if (!fetched.find(f => f.id === u.id || f.email === u.email)) {
            fetched.push({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`.trim(),
              age: u.dateOfBirth ? Math.floor((new Date() - new Date(u.dateOfBirth)) / 31557600000) : 30,
              gender: u.gender || 'N/A',
              contact: u.phone,
              email: u.email,
              bloodGroup: u.patientProfile?.bloodGroup || 'N/A',
              address: u.address || 'N/A',
              status: u.status || 'Active'
            })
          }
        })
      }
    } catch (err) {
      console.log('Users API fetch notice:', err.message)
    }

    const storedLocal = JSON.parse(localStorage.getItem('hms_patients') || '[]')
    const combinedMap = new Map()
    fetched.forEach(item => combinedMap.set(item.id, item))
    storedLocal.forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item)
    })

    setPatients(Array.from(combinedMap.values()))
    setLoading(false)
  }

  useEffect(() => {
    fetchRealPatients()
  }, [])

  const savePatientsList = (updated) => {
    localStorage.setItem('hms_patients', JSON.stringify(updated))
    setPatients(updated)
  }

  const toggleStatus = (pId) => {
    const updated = patients.map(p => p.id === pId ? { ...p, status: p.status === 'Active' ? 'Inactive' : 'Active' } : p)
    savePatientsList(updated)
  }

  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingPatient) return
    const updated = patients.map(p => p.id === editingPatient.id ? editingPatient : p)
    savePatientsList(updated)
    setEditingPatient(null)
    alert('Patient record updated successfully!')
  }

  const filtered = patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.id.toLowerCase().includes(search.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout role="admin" navItems={navItems}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Patient Records & Details</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>View registration details, blood group, contact & status</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <input type="text" placeholder="🔍 Search patients by ID, name, or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, maxWidth: 400, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.65rem 1rem', color: '#f1f5f9', fontSize: '0.875rem', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 2fr 1fr 1.5fr',
          padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: '#374151',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '0.5rem',
        }}>
          <span>Patient ID</span><span>Name</span><span>Details</span><span>Contact & Address</span><span>Status</span><span>Action</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading patient records from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No registered patient records found in database.
          </div>
        ) : (
          filtered.map(p => (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 2fr 1.5fr 2fr 1fr 1.5fr',
              alignItems: 'center', padding: '0.9rem 1.25rem', gap: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 700 }}>{p.id.slice(0, 8)}</div>
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9' }}>{p.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Age {p.age} • {p.gender}
                <div style={{ color: '#06b6d4', fontSize: '0.72rem', fontWeight: 600 }}>Blood: {p.bloodGroup || 'N/A'}</div>
              </div>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                <div>📞 {p.contact}</div>
                <div style={{ fontSize: '0.7rem', color: '#64748b' }}>📍 {p.address || 'N/A'}</div>
              </div>

              <span>
                <span style={{
                  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700,
                  background: (statusColors[p.status] || '#10b981')+'20', color: statusColors[p.status] || '#10b981', border: `1px solid ${(statusColors[p.status] || '#10b981')}35`,
                }}>{p.status}</span>
              </span>

              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button onClick={() => setEditingPatient(p)} style={{
                  padding: '0.25rem 0.6rem', borderRadius: 6, border: '1px solid rgba(6,182,212,0.3)',
                  background: 'rgba(6,182,212,0.1)', color: '#06b6d4', fontSize: '0.7rem', cursor: 'pointer'
                }}>Edit ✎</button>

                <button onClick={() => toggleStatus(p.id)} style={{
                  padding: '0.25rem 0.6rem', borderRadius: 6, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: p.status === 'Active' ? '#ef4444' : '#10b981', fontSize: '0.7rem', cursor: 'pointer'
                }}>
                  {p.status === 'Active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Modal */}
      {editingPatient && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(6,182,212,0.3)',
            borderRadius: 20, padding: '2rem', maxWidth: 480, width: '100%'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
              ✎ Edit Patient Record
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Patient Name</label>
                  <input type="text" value={editingPatient.name}
                    onChange={e => setEditingPatient(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Contact Phone</label>
                  <input type="text" value={editingPatient.contact}
                    onChange={e => setEditingPatient(p => ({ ...p, contact: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Blood Group</label>
                  <input type="text" value={editingPatient.bloodGroup || 'N/A'}
                    onChange={e => setEditingPatient(p => ({ ...p, bloodGroup: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Address</label>
                  <input type="text" value={editingPatient.address || ''}
                    onChange={e => setEditingPatient(p => ({ ...p, address: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingPatient(null)} style={{
                  padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
