import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <>
      <Helmet>
        <title>ConflictLens — 404 Not Found</title>
      </Helmet>
      <div style={{
        minHeight: '100vh',
        background: '#0D1117',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Inter', sans-serif",
        color: '#E6EDF3',
        gap: '16px',
      }}>
        <div style={{ fontSize: '72px', color: '#E85D26', lineHeight: 1 }}>⊕</div>
        <h1 style={{ fontSize: '48px', fontWeight: 700, color: '#E85D26', margin: 0 }}>404</h1>
        <p style={{ color: '#8B949E', fontSize: '16px', margin: 0 }}>
          Target not found. This route doesn't exist.
        </p>
        <Link
          to="/dashboard"
          style={{
            marginTop: '8px',
            background: 'linear-gradient(135deg, #E85D26, #F0A500)',
            color: '#fff',
            padding: '10px 24px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
          }}
        >
          → Return to Dashboard
        </Link>
      </div>
    </>
  )
}
