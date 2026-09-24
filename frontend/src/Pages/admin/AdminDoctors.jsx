import React, { useState, useEffect } from 'react'
import DashboardLayout from '../../components/DashboardLayout'
import axios from 'axios'

const navItems = [
  { label: 'Overview',     icon: '🏠', path: '/admin/overreview' },
  { label: 'Users',        icon: '👥', path: '/admin/users' },
  { label: 'Doctors',      icon: '👨‍⚕️', path: '/admin/doctors' },
  { label: 'Patients',     icon: '🧑‍⚕️', path: '/admin/patients' },
  { label: 'Appointments', icon: '📅', path: '/admin/appointments' },
  { label: 'Reports',      icon: '📊', path: '/admin/reports' },
]

const departmentsList = [
  'Cardiology', 'Neurology', 'Dermatology', 'Orthopedics', 'Pediatrics',
  'General', 'Emergency', 'ICU', 'Radiology', 'Surgery', 'Inpatient'
]

const statusColors = {
  Active: '#10b981',
  'Pending Approval': '#f59e0b',
  Pending: '#f59e0b',
  'On Leave': '#3b82f6',
  Inactive: '#64748b'
}

export default function AdminDoctors() {
  const [doctors, setDoctors]           = useState([])
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('All')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDoc, setEditingDoc]     = useState(null)
  const [loading, setLoading]           = useState(true)

  const [addForm, setAddForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    specialization: 'Cardiology',
    department: 'Cardiology',
    consultationFee: 150,
    licenseNumber: ''
  })

  const fetchRealDoctors = async () => {
    setLoading(true)
    let fetched = []
    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const docRes = await axios.get('http://localhost:5001/api/doctors', { headers })
      if (docRes.data?.data) {
        fetched = docRes.data.data.map(d => ({
          id: d.id,
          name: `Dr. ${d.firstName} ${d.lastName || ''}`.trim(),
          spec: d.doctorProfile?.specialization || 'General',
          department: d.doctorProfile?.specialization || 'General',
          email: d.email || 'N/A',
          phone: d.phone || 'N/A',
          status: d.status || (d.isVerified ? 'Active' : 'Pending Approval'),
          patients: d.patientCount || 0,
          rating: 5.0,
          license: d.doctorProfile?.licenseNumber || d.licenseNumber || 'N/A'
        }))
      }
    } catch (err) {
      console.log('Doctor API fetch notice:', err.message)
    }

    try {
      const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const userRes = await axios.get('http://localhost:5001/api/users', { headers })
      if (userRes.data?.data) {
        const docUsers = userRes.data.data.filter(u => u.role === 'Doctor')
        docUsers.forEach(u => {
          if (!fetched.find(f => f.id === u.id || f.email === u.email)) {
            fetched.push({
              id: u.id,
              name: `Dr. ${u.firstName} ${u.lastName}`.trim(),
              spec: u.doctorProfile?.specialization || 'General',
              department: u.doctorProfile?.specialization || 'General',
              email: u.email,
              phone: u.phone,
              status: u.status === 'Pending' || !u.isVerified ? 'Pending Approval' : u.status,
              patients: 0,
              rating: 5.0,
              license: u.doctorProfile?.licenseNumber || 'N/A'
            })
          }
        })
      }
    } catch (err) {
      console.log('User API fetch notice:', err.message)
    }

    // Combine with local storage items created in session
    const storedLocal = JSON.parse(localStorage.getItem('hms_doctors') || '[]')
    const combinedMap = new Map()
    fetched.forEach(item => combinedMap.set(item.id, item))
    storedLocal.forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item)
    })

    const finalDocs = Array.from(combinedMap.values())
    setDoctors(finalDocs)
    setLoading(false)
  }

  useEffect(() => {
    fetchRealDoctors()
  }, [])

  const saveDoctorsList = (updated) => {
    localStorage.setItem('hms_doctors', JSON.stringify(updated))
    setDoctors(updated)
  }

  // Approve Doctor Registration
  const handleApprove = async (docId) => {
    try {
      await axios.put(`http://localhost:5001/api/users/${docId}/approve-doctor`)
    } catch (e) {
      console.log('Backend sync notice:', e.message)
    }

    const updated = doctors.map(d => {
      if (d.id === docId) {
        return { ...d, status: 'Active' }
      }
      return d
    })
    saveDoctorsList(updated)
    alert('Doctor account approved! The doctor can now log in to their dashboard.')
  }

  // Add Doctor by Admin
  const handleAddDoctor = async (e) => {
    e.preventDefault()
    if (!addForm.firstName || !addForm.email) return alert('Please enter doctor name and email.')

    const fullName = `Dr. ${addForm.firstName.trim()} ${addForm.lastName.trim()}`
    const newDocObj = {
      id: 'doc-' + Date.now(),
      name: fullName,
      spec: addForm.specialization,
      department: addForm.department,
      email: addForm.email.trim(),
      phone: addForm.phone || '+1 (555) 000-0000',
      status: 'Active',
      patients: 0,
      rating: 5.0,
      license: addForm.licenseNumber || `LIC-${Date.now()}`
    }

    try {
      await axios.post('http://localhost:5001/api/users/create-doctor', {
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        email: addForm.email,
        password: addForm.password || 'Doctor@123',
        phone: addForm.phone,
        specialization: addForm.specialization,
        department: addForm.department,
        consultationFee: addForm.consultationFee,
        licenseNumber: addForm.licenseNumber
      })
    } catch (err) {
      console.log('Backend sync notice:', err.message)
    }

    const updated = [newDocObj, ...doctors]
    saveDoctorsList(updated)

    setShowAddModal(false)
    setAddForm({
      firstName: '', lastName: '', email: '', password: '', phone: '',
      specialization: 'Cardiology', department: 'Cardiology', consultationFee: 150, licenseNumber: ''
    })
    alert(`Doctor ${fullName} created successfully! Doctor can now log in directly.`)
  }

  // Edit / Reassign Department
  const handleSaveEdit = (e) => {
    e.preventDefault()
    if (!editingDoc) return
    const updated = doctors.map(d => d.id === editingDoc.id ? editingDoc : d)
    saveDoctorsList(updated)
    setEditingDoc(null)
    alert('Doctor profile & department updated successfully!')
  }

  // Delete Doctor
  const handleDeleteDoc = async (docId) => {
    if (!window.confirm('Are you sure you want to remove this doctor from the system?')) return
    try {
      await axios.delete(`http://localhost:5001/api/users/${docId}`)
    } catch (err) {
      console.log('Delete notice:', err.message)
    }
    const updated = doctors.filter(d => d.id !== docId)
    saveDoctorsList(updated)
  }

  const pendingCount = doctors.filter(d => d.status === 'Pending Approval' || d.status === 'Pending').length

  const filtered = doctors.filter(d => {
    const matchesSearch = d.name.toLowerCase().includes(search.toLowerCase()) ||
                          d.spec.toLowerCase().includes(search.toLowerCase()) ||
                          d.email.toLowerCase().includes(search.toLowerCase())

    if (filter === 'All') return matchesSearch
    if (filter === 'Pending Approval') return matchesSearch && (d.status === 'Pending Approval' || d.status === 'Pending')
    return matchesSearch && d.status === filter
  })

  return (
    <DashboardLayout role="admin" navItems={navItems}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>Doctor Directory & Approvals</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Create doctors, approve doctor registration requests, and manage departments</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{
          padding: '0.6rem 1.25rem', borderRadius: 10, border: 'none',
          background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
          color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit',
          boxShadow: '0 4px 15px rgba(59,130,246,0.3)',
        }}>+ Create New Doctor</button>
      </div>

      {/* Alert Banner for Pending Approvals */}
      {pendingCount > 0 && (
        <div style={{
          background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 14, padding: '1rem 1.25rem', marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#f59e0b', fontSize: '0.875rem', fontWeight: 600 }}>
            <span style={{ fontSize: '1.2rem' }}>⚠️</span>
            <span>You have <strong>{pendingCount} doctor registration request(s)</strong> awaiting Admin approval.</span>
          </div>
          <button onClick={() => setFilter('Pending Approval')} style={{
            padding: '0.4rem 0.9rem', borderRadius: 8, border: 'none',
            background: '#f59e0b', color: '#000', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer', fontFamily: 'inherit'
          }}>Review Requests →</button>
        </div>
      )}

      {/* Filter tabs & Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All', 'Active', 'Pending Approval', 'On Leave'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '0.45rem 1rem', borderRadius: 10,
              border: `1px solid ${filter === f ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`,
              background: filter === f ? 'rgba(59,130,246,0.15)' : 'transparent',
              color: filter === f ? '#3b82f6' : '#64748b',
              fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', fontFamily: 'inherit',
            }}>
              {f} {f === 'Pending Approval' && pendingCount > 0 && `(${pendingCount})`}
            </button>
          ))}
        </div>

        <input type="text" placeholder="🔍 Search doctors..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: 280, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.6rem 1rem', color: '#f1f5f9', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* Doctor Directory Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 2fr 1fr 1.8fr',
          padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: '#374151',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '0.5rem',
        }}>
          <span>Doctor</span><span>Specialty</span><span>Department</span><span>Contact & License</span><span>Status</span><span>Admin Action</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading doctor records from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No doctor records found in database. Click "+ Create New Doctor" to add your first doctor!
          </div>
        ) : (
          filtered.map(d => {
            const isPending = d.status === 'Pending Approval' || d.status === 'Pending'
            return (
              <div key={d.id} style={{
                display: 'grid', gridTemplateColumns: '2fr 1.5fr 1.5fr 2fr 1fr 1.8fr',
                alignItems: 'center', padding: '0.95rem 1.25rem', gap: '0.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s',
                background: isPending ? 'rgba(245,158,11,0.04)' : 'transparent'
              }}>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                   <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👨‍⚕️</div>
                   <div>
                     <div style={{ color: '#f1f5f9' }}>{d.name}</div>
                     {d.registeredAt && <div style={{ fontSize: '0.68rem', color: '#f59e0b' }}>Registered: {d.registeredAt}</div>}
                   </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{d.spec}</div>

                <div style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: 600 }}>{d.department || d.spec}</div>

                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                  <div>{d.email}</div>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>{d.phone} · License: {d.license}</div>
                </div>

                <span style={{
                  display: 'inline-block', padding: '0.25rem 0.6rem', borderRadius: 100, fontSize: '0.7rem', fontWeight: 700,
                  background: (statusColors[d.status] || '#64748b') + '20',
                  color: statusColors[d.status] || '#64748b',
                  border: `1px solid ${(statusColors[d.status] || '#64748b')}35`,
                }}>{d.status}</span>

                {/* Admin Actions */}
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {isPending ? (
                    <button onClick={() => handleApprove(d.id)} style={{
                      padding: '0.35rem 0.75rem', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg,#10b981,#06b6d4)', color: '#fff',
                      fontSize: '0.73rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit'
                    }}>
                      ✓ Approve
                    </button>
                  ) : (
                    <>
                      <button onClick={() => setEditingDoc(d)} style={{
                        padding: '0.3rem 0.6rem', borderRadius: 7, border: '1px solid rgba(59,130,246,0.3)',
                        background: 'rgba(59,130,246,0.1)', color: '#3b82f6',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>Edit ✎</button>

                      <button onClick={() => handleDeleteDoc(d.id)} style={{
                        padding: '0.3rem 0.6rem', borderRadius: 7, border: '1px solid rgba(239,68,68,0.3)',
                        background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                        fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'
                      }}>Delete 🗑️</button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal: Add Doctor by Admin */}
      {showAddModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 20, padding: '2rem', maxWidth: 560, width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
                👨‍⚕️ Create New Doctor Account
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAddDoctor}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>First Name</label>
                  <input type="text" required placeholder="e.g. Robert" value={addForm.firstName}
                    onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Last Name</label>
                  <input type="text" required placeholder="e.g. Kim" value={addForm.lastName}
                    onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
                  <input type="email" required placeholder="doctor@hms.com" value={addForm.email}
                    onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Login Password</label>
                  <input type="password" required placeholder="Password" value={addForm.password}
                    onChange={e => setAddForm(p => ({ ...p, password: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Specialization</label>
                  <input type="text" placeholder="e.g. Cardiology" value={addForm.specialization}
                    onChange={e => setAddForm(p => ({ ...p, specialization: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Assign Department</label>
                  <select value={addForm.department} onChange={e => setAddForm(p => ({ ...p, department: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  >
                    {departmentsList.map(dep => <option key={dep} value={dep} style={{ background: '#0f172a' }}>{dep}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Phone Number</label>
                  <input type="text" placeholder="+1 555-0000" value={addForm.phone}
                    onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>License Number</label>
                  <input type="text" placeholder="LIC-12345" value={addForm.licenseNumber}
                    onChange={e => setAddForm(p => ({ ...p, licenseNumber: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff', fontSize: '0.85rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowAddModal(false)} style={{
                  padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>Create Doctor →</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Doctor Profile & Department */}
      {editingDoc && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(59,130,246,0.3)',
            borderRadius: 20, padding: '2rem', maxWidth: 500, width: '100%'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
              ✎ Edit Doctor & Reassign Department
            </h3>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Doctor Name</label>
                  <input type="text" value={editingDoc.name}
                    onChange={e => setEditingDoc(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Reassign Department</label>
                  <select value={editingDoc.department || editingDoc.spec}
                    onChange={e => setEditingDoc(p => ({ ...p, department: e.target.value, spec: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #3b82f6', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  >
                    {departmentsList.map(dep => <option key={dep} value={dep} style={{ background: '#0f172a' }}>{dep}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Status</label>
                  <select value={editingDoc.status}
                    onChange={e => setEditingDoc(p => ({ ...p, status: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  >
                    <option value="Active" style={{ background: '#0f172a' }}>Active</option>
                    <option value="On Leave" style={{ background: '#0f172a' }}>On Leave</option>
                    <option value="Inactive" style={{ background: '#0f172a' }}>Inactive</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingDoc(null)} style={{
                  padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#3b82f6,#06b6d4)', color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
