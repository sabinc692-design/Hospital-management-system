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

const roleColors   = { Admin: '#f59e0b', Doctor: '#3b82f6', Receptionist: '#8b5cf6', Patient: '#06b6d4' }
const statusColors = { Active: '#10b981', Inactive: '#64748b', Suspended: '#ef4444', Pending: '#f59e0b' }

export default function AdminUsers() {
  const [users, setUsers]             = useState([])
  const [filter, setFilter]           = useState('All')
  const [search, setSearch]           = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [loading, setLoading]         = useState(true)

  const fetchRealUsers = async () => {
    setLoading(true)
    let fetched = []
    try {
      const res = await api.get('/api/users')
      if (res.data?.data) {
        fetched = res.data.data.map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          email: u.email,
          role: u.role || 'Patient',
          status: u.status || (u.isVerified ? 'Active' : 'Pending'),
          joined: new Date(u.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          phone: u.phone
        }))
      }
    } catch (err) {
      console.log('Users fetch notice:', err.message)
    }

    const storedLocal = JSON.parse(localStorage.getItem('hms_users') || '[]')
    const combinedMap = new Map()
    fetched.forEach(item => combinedMap.set(item.id, item))
    storedLocal.forEach(item => {
      if (!combinedMap.has(item.id)) combinedMap.set(item.id, item)
    })

    setUsers(Array.from(combinedMap.values()))
    setLoading(false)
  }

  useEffect(() => {
    fetchRealUsers()
  }, [])

  const saveUsersList = (updated) => {
    localStorage.setItem('hms_users', JSON.stringify(updated))
    setUsers(updated)
  }

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await api.put(`/api/users/${userId}`, { status: newStatus })
    } catch (e) {
      console.log('Backend sync notice:', e.message)
    }

    const updated = users.map(u => u.id === userId ? { ...u, status: newStatus } : u)
    saveUsersList(updated)
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user permanently?')) return
    try {
      await api.delete(`/api/users/${userId}`)
    } catch (e) {
      console.log('Backend sync notice:', e.message)
    }

    const updated = users.filter(u => u.id !== userId)
    saveUsersList(updated)
  }

  const handleSaveEditUser = (e) => {
    e.preventDefault()
    if (!editingUser) return
    const updated = users.map(u => u.id === editingUser.id ? editingUser : u)
    saveUsersList(updated)
    setEditingUser(null)
    alert('User updated successfully!')
  }

  const filtered = users.filter(u =>
    (filter === 'All' || u.role === filter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <DashboardLayout role="admin" navItems={navItems}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '0.3rem' }}>System Users & Permissions</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>View database users, edit details, and modify statuses</p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['Admin','Doctor','Receptionist','Patient'].map(role => (
            <div key={role} style={{
              fontSize: '0.72rem', fontWeight: 700, padding: '0.3rem 0.7rem', borderRadius: 8,
              background: roleColors[role]+'18', color: roleColors[role], border: `1px solid ${roleColors[role]}30`,
            }}>
              {users.filter(u => u.role === role).length} {role}s
            </div>
          ))}
        </div>
      </div>

      {/* Search + filter */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['All','Admin','Doctor','Receptionist','Patient'].map(r => (
            <button key={r} onClick={() => setFilter(r)} style={{
              padding: '0.45rem 1rem', borderRadius: 10,
              border: `1px solid ${filter === r ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`,
              background: filter === r ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: filter === r ? '#f59e0b' : '#64748b',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', fontFamily: 'inherit',
            }}>{r}</button>
          ))}
        </div>

        <input type="text" placeholder="🔍  Search user name or email..." value={search} onChange={e => setSearch(e.target.value)}
          style={{ width: 280, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '0.6rem 1rem', color: '#f1f5f9', fontSize: '0.85rem', outline: 'none', fontFamily: 'inherit' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1.2fr 2fr',
          padding: '0.75rem 1.25rem', fontSize: '0.7rem', color: '#374151',
          fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
          background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', gap: '0.5rem',
        }}>
          <span>User Name</span><span>Email</span><span>Role</span><span>Status</span><span>Joined</span><span>Admin Actions</span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            Loading users from database...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
            No registered user records found in database.
          </div>
        ) : (
          filtered.map(u => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '2fr 2fr 1.2fr 1.2fr 1.2fr 2fr',
              alignItems: 'center', padding: '0.9rem 1.25rem', gap: '0.5rem',
              borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9' }}>{u.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{u.email}</div>

              <span>
                <span style={{
                  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 100,
                  fontSize: '0.7rem', fontWeight: 700,
                  background: roleColors[u.role]+'20', color: roleColors[u.role], border: `1px solid ${roleColors[u.role]}35`,
                }}>{u.role}</span>
              </span>

              <span>
                <span style={{
                  display: 'inline-block', padding: '0.2rem 0.6rem', borderRadius: 100,
                  fontSize: '0.7rem', fontWeight: 700,
                  background: (statusColors[u.status] || '#64748b')+'20',
                  color: statusColors[u.status] || '#64748b',
                  border: `1px solid ${(statusColors[u.status] || '#64748b')}35`,
                }}>{u.status}</span>
              </span>

              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{u.joined}</div>

              {/* Admin Actions */}
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                {u.role !== 'Admin' && (
                  <>
                    <select value={u.status} onChange={e => handleStatusChange(u.id, e.target.value)} style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: 6, padding: '0.25rem 0.4rem', color: '#f1f5f9', fontSize: '0.72rem', cursor: 'pointer'
                    }}>
                      <option value="Active" style={{ background: '#0f172a' }}>Active</option>
                      <option value="Pending" style={{ background: '#0f172a' }}>Pending</option>
                      <option value="Suspended" style={{ background: '#0f172a' }}>Suspended</option>
                      <option value="Inactive" style={{ background: '#0f172a' }}>Inactive</option>
                    </select>

                    <button onClick={() => setEditingUser(u)} style={{
                      padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid rgba(59,130,246,0.3)',
                      background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '0.7rem', cursor: 'pointer'
                    }}>Edit ✎</button>

                    <button onClick={() => handleDeleteUser(u.id)} style={{
                      padding: '0.25rem 0.5rem', borderRadius: 6, border: '1px solid rgba(239,68,68,0.3)',
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.7rem', cursor: 'pointer'
                    }}>Del 🗑️</button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            background: '#0f172a', border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 20, padding: '2rem', maxWidth: 480, width: '100%'
          }}>
            <h3 style={{ margin: '0 0 1.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#f1f5f9' }}>
              ✎ Edit User Details
            </h3>

            <form onSubmit={handleSaveEditUser}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Full Name</label>
                  <input type="text" value={editingUser.name}
                    onChange={e => setEditingUser(p => ({ ...p, name: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Email Address</label>
                  <input type="email" value={editingUser.email}
                    onChange={e => setEditingUser(p => ({ ...p, email: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Role</label>
                  <select value={editingUser.role}
                    onChange={e => setEditingUser(p => ({ ...p, role: e.target.value }))}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid #f59e0b', borderRadius: 8, padding: '0.65rem', color: '#fff' }}
                  >
                    <option value="Doctor" style={{ background: '#0f172a' }}>Doctor</option>
                    <option value="Receptionist" style={{ background: '#0f172a' }}>Receptionist</option>
                    <option value="Patient" style={{ background: '#0f172a' }}>Patient</option>
                    <option value="Admin" style={{ background: '#0f172a' }}>Admin</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" onClick={() => setEditingUser(null)} style={{
                  padding: '0.6rem 1.25rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                  background: 'transparent', color: '#94a3b8', cursor: 'pointer'
                }}>Cancel</button>
                <button type="submit" style={{
                  padding: '0.6rem 1.5rem', borderRadius: 8, border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#3b82f6)', color: '#fff', fontWeight: 700, cursor: 'pointer'
                }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}