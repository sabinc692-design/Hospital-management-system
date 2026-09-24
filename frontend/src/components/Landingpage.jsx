import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

/* ── Navigation links ── */
const navLinks = [
  { name: 'Home',     href: '#home' },
  { name: 'Services', href: '#services' },
  { name: 'About',    href: '#about' },
  { name: 'Contact',  href: '#contact' },
]

/* ── Services data ── */
const services = [
  {
    icon: '❤️',
    title: 'Cardiology',
    desc: 'Advanced heart care with state-of-the-art diagnostics, cardiac surgeries, and 24/7 monitoring.',
    color: '#ef4444',
  },
  {
    icon: '🧠',
    title: 'Neurology',
    desc: 'Expert neurological treatment for brain, spine, and nervous system disorders with precision care.',
    color: '#8b5cf6',
  },
  {
    icon: '👶',
    title: 'Pediatrics',
    desc: 'Compassionate and specialized care for infants, children, and adolescents at every stage.',
    color: '#06b6d4',
  },
  {
    icon: '🚑',
    title: 'Emergency',
    desc: '24/7 emergency department equipped for trauma, critical care, and rapid response treatment.',
    color: '#f59e0b',
  },
  {
    icon: '🔬',
    title: 'Laboratory',
    desc: 'Fully automated diagnostic laboratory providing rapid and accurate test results round the clock.',
    color: '#10b981',
  },
  {
    icon: '🩻',
    title: 'Radiology',
    desc: 'Modern imaging including MRI, CT scans, X-rays, and ultrasound with expert radiologists.',
    color: '#3b82f6',
  },
]

/* ── Stats ── */
const stats = [
  { value: 15000, label: 'Patients Served', suffix: '+' },
  { value: 120,   label: 'Specialist Doctors', suffix: '+' },
  { value: 18,    label: 'Departments', suffix: '' },
  { value: 25,    label: 'Years of Excellence', suffix: '+' },
]

/* ── Animated counter hook ── */
function useCountUp(target, duration = 2000, trigger) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!trigger) return
    let start = 0
    const step = Math.ceil(target / (duration / 16))
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(start)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, trigger])
  return count
}

/* ── Stat Item ── */
function StatItem({ value, label, suffix }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  const count = useCountUp(value, 2000, visible)
  return (
    <div ref={ref} style={{ textAlign: 'center', padding: '1.5rem 2rem' }}>
      <div style={{
        fontSize: 'clamp(2rem, 4vw, 3rem)',
        fontWeight: 800,
        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        lineHeight: 1.1,
      }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.4rem', fontWeight: 500 }}>
        {label}
      </div>
    </div>
  )
}

/* ════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════ */
const Landingpage = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div style={{ background: '#0a0f1e', minHeight: '100vh', color: '#f1f5f9' }}>

      {/* ══ NAVBAR ══ */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        transition: 'all 0.3s ease',
        background: scrolled ? 'rgba(10,15,30,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
        padding: '0 2rem',
      }}>
        <nav style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          height: '70px',
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.2rem', boxShadow: '0 0 20px rgba(6,182,212,0.4)',
            }}>✚</div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#f1f5f9', letterSpacing: '-0.02em' }}>
              MediCare <span style={{ color: '#06b6d4' }}>HMS</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }} className="desktop-nav">
            {navLinks.map(link => (
              <a key={link.name} href={link.href} style={{
                color: '#94a3b8', textDecoration: 'none', fontSize: '0.9rem',
                fontWeight: 500, transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = '#06b6d4'}
                onMouseLeave={e => e.target.style.color = '#94a3b8'}
              >{link.name}</a>
            ))}
          </div>

          {/* Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
            <Link to="/login" style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f1f5f9',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.target.style.borderColor = '#06b6d4'; e.target.style.color = '#06b6d4' }}
              onMouseLeave={e => { e.target.style.borderColor = 'rgba(255,255,255,0.15)'; e.target.style.color = '#f1f5f9' }}
            >Login</Link>

            <Link to="/register" style={{
              padding: '0.5rem 1.25rem',
              borderRadius: 8,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff',
              textDecoration: 'none',
              fontSize: '0.875rem',
              fontWeight: 600,
              boxShadow: '0 4px 15px rgba(6,182,212,0.3)',
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.boxShadow = '0 6px 25px rgba(6,182,212,0.5)'}
              onMouseLeave={e => e.target.style.boxShadow = '0 4px 15px rgba(6,182,212,0.3)'}
            >Register</Link>
          </div>

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              display: 'none', background: 'none', border: 'none',
              color: '#f1f5f9', fontSize: '1.5rem', cursor: 'pointer',
            }}
            className="hamburger-btn"
          >{menuOpen ? '✕' : '☰'}</button>
        </nav>

        {/* Mobile Menu */}
        {menuOpen && (
          <div style={{
            background: 'rgba(10,15,30,0.98)',
            backdropFilter: 'blur(20px)',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            padding: '1.5rem 2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            {navLinks.map(link => (
              <a key={link.name} href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{ color: '#94a3b8', textDecoration: 'none', fontWeight: 500 }}
              >{link.name}</a>
            ))}
            <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Link to="/login" onClick={() => setMenuOpen(false)} style={{
                flex: 1, textAlign: 'center', padding: '0.6rem',
                borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)',
                color: '#f1f5f9', textDecoration: 'none', fontSize: '0.875rem',
              }}>Login</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} style={{
                flex: 1, textAlign: 'center', padding: '0.6rem',
                borderRadius: 8, background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                color: '#fff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 600,
              }}>Register</Link>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section id="home" style={{
        position: 'relative', minHeight: '100vh',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', paddingTop: '70px',
      }}>
        {/* Blob decorations */}
        <div style={{
          position: 'absolute', top: '10%', left: '-10%',
          width: 500, height: 500, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
          background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)',
          animation: 'blob-move 12s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '5%', right: '-5%',
          width: 600, height: 600, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
          animation: 'blob-move 15s ease-in-out infinite reverse',
          pointerEvents: 'none',
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

        <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem', textAlign: 'center', position: 'relative', zIndex: 1 }}>

          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.25)',
            borderRadius: 100, padding: '0.35rem 1rem',
            fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600,
            marginBottom: '2rem',
            animation: 'fadeInUp 0.6s ease forwards',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
            Trusted Healthcare Management Platform
          </div>

          {/* Headline */}
          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 5rem)',
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: '1.5rem',
            animation: 'fadeInUp 0.7s ease 0.1s both',
          }}>
            Modern Healthcare,{' '}
            <span style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 50%, #8b5cf6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Smarter Management</span>
          </h1>

          {/* Sub */}
          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: '#94a3b8',
            maxWidth: 600,
            margin: '0 auto 2.5rem',
            lineHeight: 1.7,
            animation: 'fadeInUp 0.7s ease 0.2s both',
          }}>
            Streamline patient care, doctor schedules, appointments, and hospital operations
            from one intelligent centralized platform built for modern healthcare.
          </p>

          {/* CTA Buttons */}
          <div style={{
            display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap',
            animation: 'fadeInUp 0.7s ease 0.3s both',
          }}>
            <Link to="/register" style={{
              padding: '0.85rem 2.5rem',
              borderRadius: 12,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 8px 30px rgba(6,182,212,0.4)',
              transition: 'all 0.3s',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Get Started Free →
            </Link>

            <a href="#services" style={{
              padding: '0.85rem 2.5rem',
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#f1f5f9',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.3s',
              display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.color = '#06b6d4' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#f1f5f9' }}
            >
              Explore Services
            </a>
          </div>
        </div>
      </section>

      {/* ══ STATS ══ */}
      <section style={{
        background: 'rgba(255,255,255,0.03)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              borderRight: '1px solid rgba(255,255,255,0.06)',
            }}>
              <StatItem value={s.value} label={s.label} suffix={s.suffix} />
            </div>
          ))}
        </div>
      </section>

      {/* ══ SERVICES ══ */}
      <section id="services" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 100, padding: '0.3rem 1rem',
              fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600,
              marginBottom: '1rem',
            }}>Our Specialties</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>
              World-Class Medical{' '}
              <span style={{
                background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Services</span>
            </h2>
            <p style={{ color: '#94a3b8', maxWidth: 540, margin: '0 auto', lineHeight: 1.7 }}>
              Comprehensive healthcare services delivered by expert specialists using cutting-edge technology.
            </p>
          </div>

          {/* Cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
          }}>
            {services.map((svc, i) => (
              <ServiceCard key={svc.title} {...svc} delay={i * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* ══ ABOUT ══ */}
      <section id="about" style={{
        padding: '6rem 2rem',
        background: 'rgba(255,255,255,0.02)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '4rem', alignItems: 'center',
        }}>
          {/* Text */}
          <div>
            <div style={{
              display: 'inline-block',
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 100, padding: '0.3rem 1rem',
              fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600,
              marginBottom: '1rem',
            }}>About Us</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.75rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: '1.25rem' }}>
              Dedicated to{' '}
              <span style={{
                background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>Excellence</span>
              {' '}in Healthcare
            </h2>
            <p style={{ color: '#94a3b8', lineHeight: 1.8, marginBottom: '2rem' }}>
              MediCare HMS has been at the forefront of healthcare innovation for over 25 years,
              delivering compassionate, high-quality care to thousands of patients. Our digital
              platform empowers hospitals with seamless management tools built around patient outcomes.
            </p>

            {/* Features */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                '24/7 emergency care with rapid response teams',
                'AI-assisted diagnostics and treatment planning',
                'Seamless appointment and record management',
                'Multi-role access: Admin, Doctor, Receptionist, Patient',
              ].map(feat => (
                <div key={feat} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                    background: 'linear-gradient(135deg,#06b6d4,#3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem',
                  }}>✓</div>
                  <span style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: 1.5 }}>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Visual card */}
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 20,
              padding: '2rem',
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { icon: '🏥', label: 'Modern Facilities', value: '5 Campuses' },
                  { icon: '👨‍⚕️', label: 'Expert Doctors', value: '120+ Specialists' },
                  { icon: '🩺', label: 'Annual Check-ups', value: '50,000+' },
                  { icon: '⭐', label: 'Patient Rating', value: '4.9 / 5.0' },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(6,182,212,0.06)',
                    border: '1px solid rgba(6,182,212,0.15)',
                    borderRadius: 12,
                    padding: '1.25rem',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>{item.icon}</div>
                    <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>{item.value}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CONTACT ══ */}
      <section id="contact" style={{ padding: '6rem 2rem' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              display: 'inline-block',
              background: 'rgba(6,182,212,0.1)',
              border: '1px solid rgba(6,182,212,0.2)',
              borderRadius: 100, padding: '0.3rem 1rem',
              fontSize: '0.8rem', color: '#06b6d4', fontWeight: 600,
              marginBottom: '1rem',
            }}>Get In Touch</div>
            <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, marginBottom: '1rem' }}>Contact Us</h2>
            <p style={{ color: '#94a3b8', maxWidth: 460, margin: '0 auto' }}>
              Have questions or need assistance? Our team is available 24/7 to help you.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            {[
              { icon: '📍', title: 'Our Location', info: '123 Medical Center Drive, Health City, HC 10001' },
              { icon: '📞', title: 'Phone Number', info: '+1 (800) MEDICARE • +1 (555) 123-4567' },
              { icon: '📧', title: 'Email Address', info: 'info@medicare-hms.com • support@medicare-hms.com' },
            ].map(item => (
              <div key={item.title} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '1.75rem',
                textAlign: 'center',
                transition: 'border-color 0.3s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(6,182,212,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
              >
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{item.icon}</div>
                <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{item.title}</div>
                <div style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6 }}>{item.info}</div>
              </div>
            ))}
          </div>

          {/* Quick Contact Form */}
          <ContactForm />
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer style={{
        background: 'rgba(0,0,0,0.4)',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        padding: '2.5rem 2rem',
        textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1rem',
          }}>✚</div>
          <span style={{ fontWeight: 700, fontSize: '1rem' }}>MediCare <span style={{ color: '#06b6d4' }}>HMS</span></span>
        </div>
        <div style={{ color: '#374151', fontSize: '0.85rem' }}>
          © {new Date().getFullYear()} MediCare Hospital Management System. All rights reserved.
        </div>
      </footer>

      {/* ══ Responsive styles ══ */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .hamburger-btn { display: block !important; }
        }
      `}</style>
    </div>
  )
}

/* ── Service Card ── */
function ServiceCard({ icon, title, desc, color, delay }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? color + '55' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: '2rem',
        cursor: 'default',
        transition: 'all 0.3s ease',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.3)` : 'none',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: 12,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.5rem',
        marginBottom: '1.25rem',
        transition: 'all 0.3s',
        boxShadow: hovered ? `0 0 20px ${color}30` : 'none',
      }}>{icon}</div>
      <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.6rem' }}>{title}</h3>
      <p style={{ color: '#64748b', lineHeight: 1.7, fontSize: '0.9rem' }}>{desc}</p>
    </div>
  )
}

/* ── Contact Form ── */
function ContactForm() {
  const inputStyle = {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    padding: '0.75rem 1rem',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
  }
  return (
    <form
      onSubmit={e => e.preventDefault()}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 20,
        padding: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 500 }}>Full Name</label>
          <input type="text" placeholder="John Doe" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#06b6d4'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 500 }}>Email</label>
          <input type="email" placeholder="john@example.com" style={inputStyle}
            onFocus={e => e.target.style.borderColor = '#06b6d4'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
        </div>
      </div>
      <div>
        <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem', fontWeight: 500 }}>Message</label>
        <textarea placeholder="How can we help you?" rows={4} style={{ ...inputStyle, resize: 'vertical' }}
          onFocus={e => e.target.style.borderColor = '#06b6d4'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
        />
      </div>
      <button type="submit" style={{
        padding: '0.85rem',
        borderRadius: 10,
        border: 'none',
        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
        color: '#fff',
        fontWeight: 700,
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.3s',
        fontFamily: 'inherit',
      }}
        onMouseEnter={e => e.target.style.boxShadow = '0 6px 25px rgba(6,182,212,0.4)'}
        onMouseLeave={e => e.target.style.boxShadow = 'none'}
      >Send Message →</button>
    </form>
  )
}

export default Landingpage