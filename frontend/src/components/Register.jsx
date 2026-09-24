import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

/* ── Role definitions ── */
const roles = [
  {
    value: 'patient',
    label: 'Patient',
    icon: '🧑‍⚕️',
    desc: 'Book appointments & view medical records',
    color: '#06b6d4',
  },
  {
    value: 'doctor',
    label: 'Doctor',
    icon: '👨‍⚕️',
    desc: 'Manage schedules, patients & consultations',
    color: '#3b82f6',
  },
  {
    value: 'receptionist',
    label: 'Receptionist',
    icon: '🗂️',
    desc: 'Handle admissions, appointments & billing',
    color: '#8b5cf6',
  },
  {
    value: 'admin',
    label: 'Admin',
    icon: '🛡️',
    desc: 'Full system access & staff management',
    color: '#f59e0b',
  },
]

/* ── Blood groups ── */
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

/* ── Specializations ── */
const specializations = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
  'Oncology', 'Radiology', 'Psychiatry', 'Ophthalmology', 'General Medicine',
  'Emergency Medicine', 'Gynecology', 'Urology', 'Endocrinology', 'Other',
]

/* ── Departments ── */
const departments = [
  'Front Desk', 'Emergency', 'Outpatient', 'Inpatient', 'Pharmacy',
  'Laboratory', 'Radiology', 'ICU', 'Surgery', 'Pediatrics', 'Administration',
]

/* ════════════════════════════════════════
   REGISTER PAGE
════════════════════════════════════════ */
const Register = () => {
  const [selectedRole, setSelectedRole] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [focused, setFocused]           = useState({})
  const [loading, setLoading]           = useState(false)
  const [agreed, setAgreed]             = useState(false)
  const [step, setStep]                 = useState(1) // 1 = role select, 2 = details
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '',
    password: '', confirmPassword: '',
    gender: 'Other', dob: '', address: 'N/A', // required by backend
    // Patient
    bloodGroup: '',
    // Doctor
    specialization: '', licenseNumber: '',
    // Receptionist
    department: '', employeeId: '',
  })

  const handleChange = e => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!agreed) return alert('Please agree to the terms and conditions.')
    if (formData.password !== formData.confirmPassword) return alert('Passwords do not match.')
    
    setLoading(true)
    try {
      const names = formData.fullName.trim().split(' ')
      const firstName = names[0] || ''
      const lastName = names.slice(1).join(' ') || 'User' // Provide default if no last name provided

      // Map roles to match backend ENUM values: "Admin", "Doctor", "Patient", "Receptionist"
      const roleMap = {
        patient: "Patient",
        doctor: "Doctor",
        receptionist: "Receptionist",
        admin: "Admin"
      }

      const payload = {
        firstName,
        lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        gender: formData.gender,
        dateOfBirth: formData.dob || '2000-01-01',
        address: formData.address || 'N/A',
        role: roleMap[selectedRole] || "Patient",
        // Role specific data
        bloodGroup: formData.bloodGroup,
        specialization: formData.specialization,
        licenseNumber: formData.licenseNumber,
        department: formData.department,
        employeeId: formData.employeeId,
      }

      let apiSuccess = false;
      try {
        const response = await axios.post('http://localhost:5001/api/auth/register', payload)
        if (response.data.success) {
          apiSuccess = true;
        }
      } catch (err) {
        console.log("Backend offline or notice:", err.message)
      }

      if (selectedRole === 'doctor') {
        const existingDocs = JSON.parse(localStorage.getItem('hms_doctors') || '[]')
        const newDocReq = {
          id: 'doc-reg-' + Date.now(),
          name: `Dr. ${formData.fullName.trim()}`,
          spec: formData.specialization || 'General',
          department: formData.department || formData.specialization || 'General',
          email: formData.email.trim(),
          phone: formData.phone || '+1 (555) 000-0000',
          status: 'Pending Approval',
          patients: 0,
          rating: 5.0,
          license: formData.licenseNumber || `LIC-${Date.now()}`,
          registeredAt: 'Just now'
        }
        localStorage.setItem('hms_doctors', JSON.stringify([newDocReq, ...existingDocs]))

        alert('Doctor registration submitted! Note: Doctor accounts require Admin approval before logging in. An administrator will review your registration.')
      } else {
        alert('Registration successful! Please sign in with your credentials.')
      }

      navigate('/login')
    } catch (error) {
      console.error("Registration error:", error)
      alert(error.response?.data?.message || 'Failed to register. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Shared styles ── */
  const inputStyle = (field) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focused[field] ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10,
    padding: '0.8rem 1rem',
    color: '#f1f5f9',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'all 0.25s',
    fontFamily: 'inherit',
    boxShadow: focused[field] ? '0 0 0 3px rgba(6,182,212,0.1)' : 'none',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '0.78rem',
    color: '#94a3b8',
    marginBottom: '0.4rem',
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  }

  const roleObj = roles.find(r => r.value === selectedRole)

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif",
      padding: '2rem 1rem',
    }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: 550, height: 550,
        background: 'radial-gradient(circle, rgba(6,182,212,0.09) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
        animation: 'blob-move 14s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '-5%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
        animation: 'blob-move 18s ease-in-out infinite reverse',
      }} />

      {/* Grid overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
        pointerEvents: 'none',
      }} />

      {/* Card */}
      <div style={{
        position: 'relative', zIndex: 1,
        width: '100%', maxWidth: 580,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '2.5rem',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        animation: 'fadeInUp 0.6s ease both',
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: 42, height: 42, borderRadius: 11,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', boxShadow: '0 0 25px rgba(6,182,212,0.4)',
            }}>✚</div>
            <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#f1f5f9' }}>
              MediCare <span style={{ color: '#06b6d4' }}>HMS</span>
            </span>
          </Link>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.35rem', letterSpacing: '-0.02em' }}>
            Create Your Account
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
            Select your role to get started
          </p>
        </div>

        {/* ── Step indicator ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {['Select Role', 'Your Details'].map((s, i) => (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  background: step > i + 1 ? 'linear-gradient(135deg,#06b6d4,#3b82f6)'
                    : step === i + 1 ? 'linear-gradient(135deg,#06b6d4,#3b82f6)'
                    : 'rgba(255,255,255,0.08)',
                  color: step >= i + 1 ? '#fff' : '#64748b',
                  transition: 'all 0.3s',
                }}>{step > i + 1 ? '✓' : i + 1}</div>
                <span style={{ fontSize: '0.78rem', color: step >= i + 1 ? '#f1f5f9' : '#374151', fontWeight: step === i + 1 ? 600 : 400 }}>
                  {s}
                </span>
              </div>
              {i < 1 && <div style={{ flex: 1, height: 1, background: step > 1 ? '#06b6d4' : 'rgba(255,255,255,0.08)', transition: 'background 0.4s' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ════ STEP 1 — Role Selection ════ */}
        {step === 1 && (
          <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '1rem', fontWeight: 500 }}>
              Who are you registering as?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              {roles.map(role => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  style={{
                    padding: '1.1rem 0.85rem',
                    borderRadius: 14,
                    border: `1.5px solid ${selectedRole === role.value ? role.color : 'rgba(255,255,255,0.08)'}`,
                    background: selectedRole === role.value ? `${role.color}15` : 'rgba(255,255,255,0.03)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.25s',
                    color: '#f1f5f9',
                    fontFamily: 'inherit',
                    boxShadow: selectedRole === role.value ? `0 0 20px ${role.color}25` : 'none',
                    transform: selectedRole === role.value ? 'translateY(-2px)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>{role.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', color: selectedRole === role.value ? role.color : '#f1f5f9' }}>
                    {role.label}
                  </div>
                  <div style={{ fontSize: '0.73rem', color: '#64748b', lineHeight: 1.4 }}>{role.desc}</div>
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => { if (selectedRole) setStep(2) }}
              disabled={!selectedRole}
              style={{
                width: '100%',
                padding: '0.9rem',
                borderRadius: 12,
                border: 'none',
                background: selectedRole ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : 'rgba(255,255,255,0.08)',
                color: selectedRole ? '#fff' : '#374151',
                fontWeight: 700,
                fontSize: '0.95rem',
                cursor: selectedRole ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s',
                fontFamily: 'inherit',
                boxShadow: selectedRole ? '0 4px 20px rgba(6,182,212,0.3)' : 'none',
              }}
            >
              Continue as {selectedRole ? roleObj?.label : '...'} →
            </button>
          </div>
        )}

        {/* ════ STEP 2 — Registration Form ════ */}
        {step === 2 && (
          <form onSubmit={handleSubmit} style={{ animation: 'fadeInUp 0.4s ease both' }}>

            {/* Selected role badge */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: `${roleObj?.color}12`,
              border: `1px solid ${roleObj?.color}30`,
              borderRadius: 10,
              padding: '0.65rem 1rem',
              marginBottom: '1.5rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{roleObj?.icon}</span>
                <span style={{ fontWeight: 600, fontSize: '0.875rem', color: roleObj?.color }}>
                  Registering as {roleObj?.label}
                </span>
              </div>
              <button type="button" onClick={() => setStep(1)} style={{
                background: 'none', border: 'none', color: '#64748b', cursor: 'pointer',
                fontSize: '0.78rem', fontFamily: 'inherit',
              }}>Change ✎</button>
            </div>

            {/* ── Common Fields ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input name="fullName" type="text" placeholder="e.g. Dr. John Smith"
                  value={formData.fullName} onChange={handleChange}
                  onFocus={() => setFocused(p => ({ ...p, fullName: true }))}
                  onBlur={() => setFocused(p => ({ ...p, fullName: false }))}
                  required style={inputStyle('fullName')}
                />
              </div>

              {/* Email + Phone */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input name="email" type="email" placeholder="name@hospital.com"
                    value={formData.email} onChange={handleChange}
                    onFocus={() => setFocused(p => ({ ...p, email: true }))}
                    onBlur={() => setFocused(p => ({ ...p, email: false }))}
                    required style={inputStyle('email')}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Phone Number</label>
                  <input name="phone" type="tel" placeholder="+1 (555) 000-0000"
                    value={formData.phone} onChange={handleChange}
                    onFocus={() => setFocused(p => ({ ...p, phone: true }))}
                    onBlur={() => setFocused(p => ({ ...p, phone: false }))}
                    required style={inputStyle('phone')}
                  />
                </div>
              </div>

              {/* Password + Confirm */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Min. 8 characters"
                      value={formData.password} onChange={handleChange}
                      onFocus={() => setFocused(p => ({ ...p, password: true }))}
                      onBlur={() => setFocused(p => ({ ...p, password: false }))}
                      required style={{ ...inputStyle('password'), paddingRight: '2.5rem' }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                      position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem', padding: 0,
                    }}>{showPassword ? '🙈' : '👁️'}</button>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Repeat password"
                      value={formData.confirmPassword} onChange={handleChange}
                      onFocus={() => setFocused(p => ({ ...p, confirmPassword: true }))}
                      onBlur={() => setFocused(p => ({ ...p, confirmPassword: false }))}
                      required style={{ ...inputStyle('confirmPassword'), paddingRight: '2.5rem' }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{
                      position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem', padding: 0,
                    }}>{showConfirm ? '🙈' : '👁️'}</button>
                  </div>
                </div>
              </div>

              {/* Gender, DOB & Address (Required by Backend) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.85rem' }}>
                <div>
                  <label style={labelStyle}>Gender</label>
                  <select name="gender"
                    value={formData.gender} onChange={handleChange}
                    onFocus={() => setFocused(p => ({ ...p, gender: true }))}
                    onBlur={() => setFocused(p => ({ ...p, gender: false }))}
                    style={inputStyle('gender')}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Date of Birth</label>
                  <input name="dob" type="date"
                    value={formData.dob} onChange={handleChange}
                    onFocus={() => setFocused(p => ({ ...p, dob: true }))}
                    onBlur={() => setFocused(p => ({ ...p, dob: false }))}
                    style={{ ...inputStyle('dob'), colorScheme: 'dark' }}
                    required
                  />
                </div>
                <div>
                  <label style={labelStyle}>Address</label>
                  <input name="address" type="text" placeholder="Your City, Country"
                    value={formData.address} onChange={handleChange}
                    onFocus={() => setFocused(p => ({ ...p, address: true }))}
                    onBlur={() => setFocused(p => ({ ...p, address: false }))}
                    style={inputStyle('address')}
                    required
                  />
                </div>
              </div>

              {/* ── ROLE-SPECIFIC FIELDS ── */}

              {/* PATIENT */}
              {selectedRole === 'patient' && (
                <RoleSection title="Patient Information" color={roleObj.color}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={labelStyle}>Blood Group</label>
                      <select name="bloodGroup"
                        value={formData.bloodGroup} onChange={handleChange}
                        onFocus={() => setFocused(p => ({ ...p, bloodGroup: true }))}
                        onBlur={() => setFocused(p => ({ ...p, bloodGroup: false }))}
                        style={inputStyle('bloodGroup')}
                      >
                        <option value="">Select blood group</option>
                        {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                      </select>
                    </div>
                  </div>
                </RoleSection>
              )}

              {/* DOCTOR */}
              {selectedRole === 'doctor' && (
                <RoleSection title="Doctor Credentials" color={roleObj.color}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={labelStyle}>Specialization</label>
                      <select name="specialization"
                        value={formData.specialization} onChange={handleChange}
                        onFocus={() => setFocused(p => ({ ...p, specialization: true }))}
                        onBlur={() => setFocused(p => ({ ...p, specialization: false }))}
                        style={inputStyle('specialization')}
                      >
                        <option value="">Select specialization</option>
                        {specializations.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Medical License No.</label>
                      <input name="licenseNumber" type="text" placeholder="e.g. ML-2024-00123"
                        value={formData.licenseNumber} onChange={handleChange}
                        onFocus={() => setFocused(p => ({ ...p, licenseNumber: true }))}
                        onBlur={() => setFocused(p => ({ ...p, licenseNumber: false }))}
                        style={inputStyle('licenseNumber')}
                      />
                    </div>
                  </div>
                </RoleSection>
              )}

              {/* RECEPTIONIST */}
              {selectedRole === 'receptionist' && (
                <RoleSection title="Staff Information" color={roleObj.color}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                    <div>
                      <label style={labelStyle}>Department</label>
                      <select name="department"
                        value={formData.department} onChange={handleChange}
                        onFocus={() => setFocused(p => ({ ...p, department: true }))}
                        onBlur={() => setFocused(p => ({ ...p, department: false }))}
                        style={inputStyle('department')}
                      >
                        <option value="">Select department</option>
                        {departments.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={labelStyle}>Employee ID</label>
                      <input name="employeeId" type="text" placeholder="e.g. EMP-00456"
                        value={formData.employeeId} onChange={handleChange}
                        onFocus={() => setFocused(p => ({ ...p, employeeId: true }))}
                        onBlur={() => setFocused(p => ({ ...p, employeeId: false }))}
                        style={inputStyle('employeeId')}
                      />
                    </div>
                  </div>
                </RoleSection>
              )}

              {/* ADMIN */}
              {selectedRole === 'admin' && (
                <RoleSection title="Administrator Access" color={roleObj.color}>
                  <div style={{
                    display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                    padding: '0.85rem', background: `${roleObj.color}10`, borderRadius: 10,
                    border: `1px solid ${roleObj.color}25`,
                  }}>
                    <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>⚠️</span>
                    <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
                      Admin accounts require <strong style={{ color: roleObj.color }}>manual approval</strong> from the 
                      system administrator. Your request will be reviewed within 24 hours.
                      Please ensure you have authorization to register as an administrator.
                    </p>
                  </div>
                </RoleSection>
              )}

              {/* Terms */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem', paddingTop: '0.25rem' }}>
                <input id="reg-agree" type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#06b6d4', cursor: 'pointer', marginTop: '0.15rem', flexShrink: 0 }}
                />
                <label htmlFor="reg-agree" style={{ fontSize: '0.82rem', color: '#64748b', cursor: 'pointer', lineHeight: 1.5 }}>
                  I agree to the{' '}
                  <a href="#" style={{ color: '#06b6d4', textDecoration: 'none' }}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="#" style={{ color: '#06b6d4', textDecoration: 'none' }}>Privacy Policy</a>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '0.9rem',
                  borderRadius: 12,
                  border: 'none',
                  background: loading ? 'rgba(6,182,212,0.5)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  marginTop: '0.25rem',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,0.5)' }}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.3)'}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      display: 'inline-block', animation: 'spin 0.8s linear infinite',
                    }} />
                    Creating Account...
                  </>
                ) : `Create ${roleObj?.label} Account →`}
              </button>
            </div>
          </form>
        )}

        {/* Sign In link */}
        <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '1.5rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >Sign in here</Link>
        </p>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blob-move {
          0%,100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
          50%      { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder { color: #374151; }
        select { appearance: none; cursor: pointer; }
        select::-ms-expand { display: none; }
      `}</style>
    </div>
  )
}

/* ── Role section wrapper ── */
function RoleSection({ title, color, children }) {
  return (
    <div style={{
      background: `${color}08`,
      border: `1px solid ${color}25`,
      borderRadius: 12,
      padding: '1.1rem',
    }}>
      <div style={{
        fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: color, marginBottom: '0.85rem',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
      }}>
        <span style={{ display: 'inline-block', width: 16, height: 1.5, background: color, borderRadius: 2 }} />
        {title}
        <span style={{ display: 'inline-block', width: 16, height: 1.5, background: color, borderRadius: 2 }} />
      </div>
      {children}
    </div>
  )
}

export default Register