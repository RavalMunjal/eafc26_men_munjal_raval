import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutUser } from '../../store/authSlice'
import { toggleSidebar } from '../../store/uiSlice'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/dashboard',       icon: '⊙', label: 'Dashboard'    },
  { to: '/conflicts',       icon: '⚔',  label: 'Conflicts'    },
  { to: '/analytics',       icon: '📊', label: 'Analytics'    },
  { to: '/conflicts/compare', icon: '⇄', label: 'Compare'    },
  { to: '/profile',         icon: '👤', label: 'Profile'      },
]

const adminLinks = [
  { to: '/admin/dashboard', icon: '🛡', label: 'Admin Home'   },
  { to: '/admin/conflicts', icon: '✏️', label: 'Manage Data'  },
  { to: '/admin/users',     icon: '👥', label: 'Users'        },
]

export default function Layout({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((s) => s.auth)
  const { sidebarOpen } = useSelector((s) => s.ui)
  const [mobileOpen, setMobileOpen] = useState(false)

  const isAdmin = user?.role === 'admin'

  const handleLogout = async () => {
    await dispatch(logoutUser())
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const linkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: sidebarOpen ? '10px 16px' : '10px 0',
    justifyContent: sidebarOpen ? 'flex-start' : 'center',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: 500,
    color: isActive ? '#E85D26' : '#8B949E',
    background: isActive ? 'rgba(232,93,38,0.1)' : 'transparent',
    border: isActive ? '1px solid rgba(232,93,38,0.25)' : '1px solid transparent',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  })

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D1117', fontFamily: "'Inter', sans-serif" }}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? '220px' : '60px',
        minWidth: sidebarOpen ? '220px' : '60px',
        background: '#161B22',
        borderRight: '1px solid #30363D',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s, min-width 0.25s',
        overflow: 'hidden',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 30,
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          borderBottom: '1px solid #30363D',
          minHeight: '64px',
        }}>
          <span style={{ fontSize: '22px', color: '#E85D26', flexShrink: 0, filter: 'drop-shadow(0 0 6px rgba(232,93,38,0.6))' }}>⊕</span>
          {sidebarOpen && (
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              ConflictLens
            </span>
          )}
        </div>

        {/* Toggle button */}
        <button
          onClick={() => dispatch(toggleSidebar())}
          style={{
            position: 'absolute',
            top: '20px',
            right: sidebarOpen ? '12px' : '8px',
            background: '#1C2128',
            border: '1px solid #30363D',
            borderRadius: '6px',
            color: '#8B949E',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: '12px',
            lineHeight: 1,
          }}
          title="Toggle sidebar"
        >
          {sidebarOpen ? '◀' : '▶'}
        </button>

        {/* Nav links */}
        <nav style={{ padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1, overflowY: 'auto' }}>
          {sidebarOpen && (
            <div style={{ color: '#4A5568', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 8px', marginBottom: '4px' }}>
              Navigation
            </div>
          )}
          {navLinks.map(({ to, icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => linkStyle(isActive)}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
              {sidebarOpen && <span>{label}</span>}
            </NavLink>
          ))}

          {isAdmin && (
            <>
              {sidebarOpen && (
                <div style={{ color: '#4A5568', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '12px 8px 4px', marginTop: '8px', borderTop: '1px solid #30363D' }}>
                  Admin
                </div>
              )}
              {!sidebarOpen && <div style={{ height: '1px', background: '#30363D', margin: '8px 0' }} />}
              {adminLinks.map(({ to, icon, label }) => (
                <NavLink key={to} to={to} style={({ isActive }) => linkStyle(isActive)}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>{icon}</span>
                  {sidebarOpen && <span>{label}</span>}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        {/* User info + logout */}
        <div style={{ borderTop: '1px solid #30363D', padding: '12px 8px' }}>
          {sidebarOpen && (
            <div style={{ marginBottom: '8px', padding: '8px', background: '#1C2128', borderRadius: '8px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#E6EDF3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: '#8B949E', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.role === 'admin' ? '🛡 Admin' : '👤 Analyst'}
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: sidebarOpen ? '9px 12px' : '9px 0',
              background: 'rgba(255,75,75,0.1)',
              border: '1px solid rgba(255,75,75,0.2)',
              borderRadius: '8px',
              color: '#FF4B4B',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s',
            }}
          >
            <span>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
