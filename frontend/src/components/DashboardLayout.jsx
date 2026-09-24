import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from './Footer'

/*
  DashboardLayout — shared sidebar + topbar shell
  Props:
    role: 'patient' | 'doctor' | 'receptionist' | 'admin'
    navItems: [{ label, icon, path }]
    children: page content
*/

const roleConfig = {
  patient:      { label: 'Patient',      color: '#06b6d4', icon: '🧑‍⚕️' },
  doctor:       { label: 'Doctor',       color: '#3b82f6', icon: '👨‍⚕️' },
  receptionist: { label: 'Receptionist', color: '#8b5cf6', icon: '🗂️' },
  admin:        { label: 'Admin',        color: '#f59e0b', icon: '🛡️' },
}

export default function DashboardLayout({ role, navItems, children }) {
  const location  = useLocation()
  const navigate  = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [activeNotification, setActiveNotification] = useState(null)
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false)

  const cfg = roleConfig[role] || roleConfig.patient

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
  const displayName = localStorage.getItem('userName') || 
                      (storedUser.firstName ? `${storedUser.firstName} ${storedUser.lastName || ''}`.trim() : null) || 
                      cfg.label

  // Poll appointments for patient notifications
  useEffect(() => {
    if (role !== 'patient') return

    const fetchPatientNotifs = async () => {
      try {
        const token = localStorage.getItem('accessToken') || localStorage.getItem('token')
        if (!token) return
        const res = await axios.get('http://localhost:5001/api/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (res.data?.data) {
          const myId = storedUser.id
          const all = res.data.data
          const mine = myId ? all.filter(a => a.patientId === myId || a.user?.id === myId || a.patient?.userId === myId) : all
          
          // Relevant statuses: accepted, confirmed, rejected, assigned
          const relevant = mine.filter(a => ['accepted', 'confirmed', 'rejected', 'assigned'].includes(a.status?.toLowerCase()))
          setNotifications(relevant)

          const dismissed = JSON.parse(localStorage.getItem('hms_dismissed_notifs') || '[]')
          // Find first non-dismissed notification to pop up
          const unread = relevant.find(a => !dismissed.includes(a.id))
          if (unread && (!activeNotification || activeNotification.id !== unread.id)) {
            setActiveNotification(unread)
          }
        }
      } catch (err) {
        // Silent polling error
      }
    }

    fetchPatientNotifs()
    const interval = setInterval(fetchPatientNotifs, 3000)
    return () => clearInterval(interval)
  }, [role, storedUser.id])

  const dismissNotification = (id) => {
    const dismissed = JSON.parse(localStorage.getItem('hms_dismissed_notifs') || '[]')
    if (!dismissed.includes(id)) {
      dismissed.push(id)
      localStorage.setItem('hms_dismissed_notifs', JSON.stringify(dismissed))
    }
    if (activeNotification?.id === id) {
      setActiveNotification(null)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('userName')
    localStorage.removeItem('user')
    navigate('/')
  }


  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#0a0f1e', fontFamily: "'Inter', sans-serif", color: '#f1f5f9',
    }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 240, flexShrink: 0,
        background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 50,
        transform: sidebarOpen ? 'translateX(0)' : undefined,
        transition: 'transform 0.3s',
      }}
        className="sidebar"
      >
        {/* Logo */}
        <div style={{
          padding: '1.5rem 1.25rem 1rem',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 0 16px rgba(6,182,212,0.35)',
            }}>✚</div>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f1f5f9' }}>
              MediCare <span style={{ color: '#06b6d4' }}>HMS</span>
            </span>
          </Link>

          {/* Role badge */}
          <div style={{
            marginTop: '1rem',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: `${cfg.color}15`,
            border: `1px solid ${cfg.color}30`,
            borderRadius: 8, padding: '0.4rem 0.75rem',
          }}>
            <span style={{ fontSize: '1rem' }}>{cfg.icon}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: cfg.color }}>{cfg.label} Portal</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {navItems.map(item => {
            const active = location.pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: active ? 600 : 400,
                color: active ? cfg.color : '#64748b',
                background: active ? `${cfg.color}12` : 'transparent',
                border: `1px solid ${active ? cfg.color + '25' : 'transparent'}`,
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b' } }}
              >
                <span style={{ fontSize: '1.05rem', width: 20, textAlign: 'center' }}>{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.65rem 0.85rem', borderRadius: 10,
            background: 'none', border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500,
            fontFamily: 'inherit', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
          >
            <span>🚪</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div style={{ flex: 1, marginLeft: 240, display: 'flex', flexDirection: 'column', minHeight: '100vh' }} className="main-area">

        {/* Topbar */}
        <header style={{
          height: 64,
          background: 'rgba(10,15,30,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 1.75rem',
          position: 'sticky', top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Mobile hamburger */}
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hamburger-btn" style={{
              display: 'none', background: 'none', border: 'none',
              color: '#94a3b8', fontSize: '1.25rem', cursor: 'pointer',
            }}>☰</button>
            <div>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>
                {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              <p style={{ fontSize: '0.72rem', color: '#374151', margin: 0 }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Right: notifications + avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
            <button 
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              style={{
                position: 'relative', background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10,
                width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: '1rem', color: '#94a3b8', transition: 'all 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = cfg.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
            >
              🔔
              {notifications.length > 0 && (
                <span style={{
                  position: 'absolute', top: -3, right: -3,
                  background: '#ef4444', color: '#fff', fontSize: '0.65rem',
                  fontWeight: 800, borderRadius: '50%', minWidth: 16, height: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 2px',
                }}>
                  {notifications.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {notifDropdownOpen && (
              <div style={{
                position: 'absolute', top: 48, right: 0, width: 320,
                background: '#0f172a', border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 14, boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                zIndex: 100, overflow: 'hidden', padding: '0.75rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>Notifications</span>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{notifications.length} updates</span>
                </div>
                {notifications.length === 0 ? (
                  <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.78rem', color: '#64748b' }}>
                    No new appointment updates.
                  </div>
                ) : (
                  <div style={{ maxHeight: 240, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {notifications.map(n => {
                      const docUser = n.doctor?.user || n.Doctor?.user || {}
                      const docName = (docUser.firstName || docUser.lastName)
                        ? `Dr. ${docUser.firstName || ''} ${docUser.lastName || ''}`.trim()
                        : (n.doctor ? `Dr. ${n.doctor.firstName || ''} ${n.doctor.lastName || ''}`.trim() : 'Assigned Doctor')
                      const isApproved = ['accepted', 'confirmed'].includes(n.status?.toLowerCase())
                      const isRejected = n.status?.toLowerCase() === 'rejected'
                      const isAssigned = n.status?.toLowerCase() === 'assigned'
                      const color = isApproved ? '#10b981' : (isRejected ? '#ef4444' : '#3b82f6')
                      const title = isApproved ? 'Appointment Approved' : (isRejected ? 'Appointment Cancelled' : 'Doctor Assigned')

                      return (
                        <div key={n.id} style={{
                          padding: '0.6rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)',
                          border: `1px solid ${color}30`, fontSize: '0.78rem',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                            <strong style={{ color }}>{title}</strong>
                            <button 
                              onClick={() => dismissNotification(n.id)}
                              style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '0.7rem' }}
                            >✕</button>
                          </div>
                          <div style={{ color: '#cbd5e1', fontWeight: 600 }}>{docName}</div>
                          <div style={{ color: '#64748b', fontSize: '0.72rem' }}>
                            Date: {n.appointmentDate ? new Date(n.appointmentDate).toISOString().split('T')[0] : 'N/A'} ({n.timeSlot || '10:00 AM'})
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.6rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 10, padding: '0.35rem 0.75rem',
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `linear-gradient(135deg, ${cfg.color}, #3b82f6)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.85rem', fontWeight: 800, color: '#fff'
              }}>
                {displayName[0]?.toUpperCase() || cfg.label[0]}
              </div>
              <div>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f1f5f9' }}>{displayName}</div>
                <div style={{ fontSize: '0.68rem', color: cfg.color, fontWeight: 600 }}>{cfg.label} • Online</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '1.75rem 1.75rem 0 1.75rem', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          <div style={{ flex: 1, paddingBottom: '1.75rem' }}>
            {children}
          </div>
          <Footer />
        </main>
      </div>

      {/* ── Active Appointment Notification Popup Modal ── */}
      {activeNotification && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
        }}>
          <div style={{
            width: '100%', maxWidth: 440, background: '#0f172a',
            border: `1px solid ${['accepted','confirmed'].includes(activeNotification.status?.toLowerCase()) ? '#10b981' : (activeNotification.status?.toLowerCase() === 'rejected' ? '#ef4444' : '#3b82f6')}60`,
            borderRadius: 20, padding: '1.75rem',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)',
            animation: 'fadeInUp 0.3s ease-out',
          }}>
            {/* Header tag */}
            {(() => {
              const st = activeNotification.status?.toLowerCase()
              const isApproved = ['accepted', 'confirmed'].includes(st)
              const isRejected = st === 'rejected'
              const color = isApproved ? '#10b981' : (isRejected ? '#ef4444' : '#3b82f6')
              const icon = isApproved ? '🎉' : (isRejected ? '❌' : '👨‍⚕️')
              const title = isApproved ? 'Appointment Approved!' : (isRejected ? 'Appointment Cancelled' : 'Doctor Assigned')
              const docUser = activeNotification.doctor?.user || activeNotification.Doctor?.user || {}
              const docName = (docUser.firstName || docUser.lastName)
                ? `Dr. ${docUser.firstName || ''} ${docUser.lastName || ''}`.trim()
                : (activeNotification.doctor ? `Dr. ${activeNotification.doctor.firstName || ''} ${activeNotification.doctor.lastName || ''}`.trim() : 'Assigned Doctor')
              const spec = activeNotification.doctor?.specialization || activeNotification.doctor?.doctorProfile?.specialization || 'Specialist'

              return (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: color + '20', border: `1px solid ${color}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.5rem',
                    }}>{icon}</div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color }}>{title}</h3>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
                        {isApproved ? 'Your doctor has confirmed your consultation request.' : (isRejected ? 'Your appointment request was declined by the doctor.' : 'A doctor has been assigned by receptionist.')}
                      </p>
                    </div>
                  </div>

                  {/* Doctor Info Card */}
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 14, padding: '1rem', marginBottom: '1.25rem',
                    display: 'flex', alignItems: 'center', gap: '0.85rem',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#3b82f6,#06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem', color: '#fff', fontWeight: 800, flexShrink: 0,
                    }}>👨‍⚕️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>{docName}</div>
                      <div style={{ fontSize: '0.78rem', color: '#06b6d4', fontWeight: 600 }}>{spec}</div>
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div style={{
                    background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 12, padding: '0.85rem 1rem', marginBottom: '1.5rem',
                    display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Date & Time:</span>
                      <strong style={{ color: '#f1f5f9' }}>
                        {activeNotification.appointmentDate ? new Date(activeNotification.appointmentDate).toISOString().split('T')[0] : 'N/A'} at {activeNotification.timeSlot || '10:00 AM'}
                      </strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Problem / Reason:</span>
                      <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{activeNotification.reason || 'Medical Problem'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span style={{ color, fontWeight: 700, textTransform: 'capitalize' }}>{activeNotification.status}</span>
                    </div>
                  </div>

                  {/* Dismiss Button */}
                  <button
                    onClick={() => dismissNotification(activeNotification.id)}
                    style={{
                      width: '100%', padding: '0.75rem', borderRadius: 12,
                      background: `linear-gradient(135deg, ${color}, #3b82f6)`,
                      border: 'none', color: '#fff', fontWeight: 700, fontSize: '0.875rem',
                      cursor: 'pointer', boxShadow: `0 4px 15px ${color}40`,
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  >
                    Got it, Dismiss
                  </button>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          zIndex: 49, display: 'none',
        }} className="mobile-overlay" />
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar { transform: translateX(-100%); }
          .sidebar.open { transform: translateX(0); }
          .main-area { margin-left: 0 !important; }
          .hamburger-btn { display: flex !important; }
          .mobile-overlay { display: block !important; }
        }
      `}</style>
    </div>
  )
}

