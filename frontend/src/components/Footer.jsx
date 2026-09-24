import React from 'react'

const Footer = () => {
  return (
    <footer style={{
      background: 'rgba(5, 10, 24, 0.95)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
      color: '#94a3b8',
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      padding: '3rem 2rem 1.5rem 2rem',
      marginTop: 'auto',
      width: '100%',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2.5rem',
        paddingBottom: '2.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>

        {/* Column 1: Platform Brand Info */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', color: '#fff', fontWeight: 800,
              boxShadow: '0 0 18px rgba(6,182,212,0.35)',
            }}>✚</div>
            <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              MediCare <span style={{ color: '#06b6d4' }}>HMS</span>
            </span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Advanced Hospital Management System designed to optimize healthcare workflows, patient care, doctor scheduling, and administrative operations.
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 20, padding: '0.3rem 0.75rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
            System Status: 100% Operational
          </div>
        </div>

        {/* Column 2: Contact & Developer Info */}
        <div>
          <h4 style={{ color: '#f1f5f9', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Contact &amp; Developer
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.875rem' }}>
            <div style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 12,
              padding: '0.85rem 1rem',
            }}>
              <div style={{ fontSize: '0.75rem', color: '#06b6d4', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                Lead Developer &amp; System Architect
              </div>
              <div style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1rem' }}>
                Sabin Chaulagain
              </div>
            </div>

            <a href="tel:9814397731" style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              color: '#f1f5f9', textDecoration: 'none',
              background: 'rgba(6, 182, 212, 0.06)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              borderRadius: 10, padding: '0.65rem 0.85rem',
              transition: 'all 0.2s ease',
              fontWeight: 600
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = 'rgba(6, 182, 212, 0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(6, 182, 212, 0.2)'; e.currentTarget.style.background = 'rgba(6, 182, 212, 0.06)' }}
            >
              <span style={{ fontSize: '1.1rem' }}>📞</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500 }}>Direct Phone Contact</div>
                <div style={{ color: '#06b6d4', fontWeight: 700 }}>+977 9814397731 / 9814397731</div>
              </div>
            </a>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#64748b', fontSize: '0.8rem', paddingLeft: '0.2rem' }}>
              <span>📍</span> Kathmandu, Nepal &bull; Available for Inquiries
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar: Copyright Notice */}
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        paddingTop: '1.25rem',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        fontSize: '0.825rem',
        color: '#64748b',
      }}>
        <div>
          &copy; {new Date().getFullYear()} MediCare HMS. <strong style={{ color: '#cbd5e1', fontWeight: 600 }}>All rights reserved to Sabin Chaulagain</strong>.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span style={{ color: '#475569' }}>Privacy Policy</span>
          <span style={{ color: '#475569' }}>Terms of Service</span>
          <span style={{ color: '#475569' }}>System Support</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
