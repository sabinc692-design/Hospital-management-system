import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import Footer from './Footer'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData]         = useState({ email: '', password: '', remember: false })
  const [focused, setFocused]           = useState({})
  const [loading, setLoading]           = useState(false)
  const navigate = useNavigate()

  const handleChange = e => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)

    const inputEmail = formData.email.trim().toLowerCase()

    // 1. Guard check for Doctor registration pending admin approval in localStorage
    const docs = JSON.parse(localStorage.getItem('hms_doctors') || '[]')
    const matchingDoc = docs.find(d => d.email && d.email.toLowerCase() === inputEmail)
    
    if (matchingDoc && (matchingDoc.status === 'Pending Approval' || matchingDoc.status === 'Pending')) {
      alert("Your doctor account registration is pending admin approval. You cannot log in until approved by an administrator.")
      setLoading(false)
      return
    }

    // 2. Try Backend Authentication
    let loginData = null
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', {
        email: formData.email,
        password: formData.password
      }, { withCredentials: true })

      if (response.data.success || response.data.accessToken) {
        loginData = response.data
      }
    } catch (error) {
      console.log("Backend auth notice/offline:", error.response?.data?.message || error.message)
      if (error.response?.status === 403 || error.response?.data?.message?.includes("pending admin approval")) {
        alert(error.response.data.message)
        setLoading(false)
        return
      }
    }

    // 3. Process Login (Backend or Demo fallback for existing users)
    const userObj = loginData?.user
    const rawRole = (loginData?.role || userObj?.role || '').toLowerCase()
    
    let userRole = 'patient'
    if (rawRole) {
      userRole = rawRole
    } else if (inputEmail.includes('admin')) {
      userRole = 'admin'
    } else if (inputEmail.includes('doctor') || matchingDoc || inputEmail.includes('dr.')) {
      userRole = 'doctor'
    } else if (inputEmail.includes('reception') || inputEmail.includes('rec')) {
      userRole = 'receptionist'
    }

    if (loginData?.accessToken) {
      localStorage.setItem('accessToken', loginData.accessToken)
      localStorage.setItem('acessToken', loginData.accessToken)
    }
    if (loginData?.refreshToken) {
      localStorage.setItem('refreshToken', loginData.refreshToken)
    }

    // Derive display name for user
    let fullName = 'User'
    if (userObj?.firstName) {
      fullName = `${userObj.firstName} ${userObj.lastName || ''}`.trim()
    } else if (matchingDoc?.name) {
      fullName = matchingDoc.name
    } else {
      const emailPrefix = inputEmail.split('@')[0]
      fullName = emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1)
    }

    localStorage.setItem('user', JSON.stringify(userObj || { firstName: fullName, email: inputEmail, role: userRole }))
    localStorage.setItem('userName', fullName)

    let redirectPath = '/patient/overreview'
    if (userRole === 'doctor') redirectPath = '/doctor/overreview'
    else if (userRole === 'receptionist') redirectPath = '/reciptionist/overreview'
    else if (userRole === 'admin') redirectPath = '/admin/overreview'

    setLoading(false)
    navigate(redirectPath)
  }

  /* ── Shared input style ── */
  const inputStyle = (field) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: `1px solid ${focused[field] ? '#06b6d4' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: 10,
    padding: '0.85rem 1rem',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.25s',
    fontFamily: 'inherit',
    boxShadow: focused[field] ? '0 0 0 3px rgba(6,182,212,0.1)' : 'none',
  })

  const labelStyle = {
    display: 'block',
    fontSize: '0.8rem',
    color: '#94a3b8',
    marginBottom: '0.5rem',
    fontWeight: 500,
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0f1e',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative',
      overflowX: 'hidden',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1rem',
        width: '100%',
        boxSizing: 'border-box',
      }}>

      {/* Background blobs */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
        animation: 'blob-move 12s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', right: '-5%',
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)',
        borderRadius: '50%', pointerEvents: 'none',
        animation: 'blob-move 16s ease-in-out infinite reverse',
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
        width: '100%', maxWidth: 460,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 24,
        padding: '2.75rem 2.5rem',
        boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        animation: 'fadeInUp 0.6s ease both',
      }}>

        {/* Logo & Heading */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem',
              boxShadow: '0 0 25px rgba(6,182,212,0.4)',
            }}>✚</div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9' }}>
              MediCare <span style={{ color: '#06b6d4' }}>HMS</span>
            </span>
          </Link>

          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f1f5f9', marginBottom: '0.4rem', letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
            Sign in to your hospital account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Email */}
          <div>
            <label htmlFor="login-email" style={labelStyle}>Email Address</label>
            <input
              id="login-email"
              name="email"
              type="email"
              placeholder="doctor@hospital.com or patient@gmail.com"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocused(p => ({ ...p, email: true }))}
              onBlur={() => setFocused(p => ({ ...p, email: false }))}
              required
              style={inputStyle('email')}
            />
          </div>

          {/* Password */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label htmlFor="login-password" style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
              <a href="#" style={{ fontSize: '0.78rem', color: '#06b6d4', textDecoration: 'none', fontWeight: 500 }}>
                Forgot password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••"
                value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused(p => ({ ...p, password: true }))}
                onBlur={() => setFocused(p => ({ ...p, password: false }))}
                required
                style={{ ...inputStyle('password'), paddingRight: '3rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748b', fontSize: '1rem', padding: 0,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.target.style.color = '#06b6d4'}
                onMouseLeave={e => e.target.style.color = '#64748b'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <input
              id="remember"
              name="remember"
              type="checkbox"
              checked={formData.remember}
              onChange={handleChange}
              style={{ width: 16, height: 16, accentColor: '#06b6d4', cursor: 'pointer' }}
            />
            <label htmlFor="remember" style={{ fontSize: '0.875rem', color: '#94a3b8', cursor: 'pointer' }}>
              Remember me for 30 days
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
              background: loading
                ? 'rgba(6,182,212,0.5)'
                : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit',
              boxShadow: '0 4px 20px rgba(6,182,212,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            }}
            onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 8px 30px rgba(6,182,212,0.5)' }}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.3)'}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#fff', borderRadius: '50%',
                  display: 'inline-block',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Signing in...
              </>
            ) : 'Sign In →'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', margin: '1.5rem 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          <span style={{ color: '#374151', fontSize: '0.8rem' }}>or</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
        </div>

        {/* Register link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#06b6d4', fontWeight: 600, textDecoration: 'none' }}
            onMouseEnter={e => e.target.style.textDecoration = 'underline'}
            onMouseLeave={e => e.target.style.textDecoration = 'none'}
          >Create an account</Link>
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
        textarea::placeholder { color: #374151; }
      `}</style>
      </div>
      
      <Footer />
    </div>
  )
}

export default Login