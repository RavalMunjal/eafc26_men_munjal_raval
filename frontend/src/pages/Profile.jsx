import { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { fetchCurrentUser } from '../store/authSlice'
import Layout from '../components/common/Layout'
import api from '../services/api'

const S = {
  page: { padding: '28px', minHeight: '100vh', maxWidth: '700px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '13px', marginBottom: '28px' },
  card: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#E6EDF3', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #30363D' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' },
  label: { fontSize: '11px', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em' },
  input: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '10px 14px', color: '#E6EDF3', fontSize: '14px', outline: 'none',
    fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg,#E85D26,#F0A500)', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", transition: 'opacity 0.2s',
  },
  btnDanger: {
    background: 'rgba(255,75,75,0.1)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.3)',
    borderRadius: '8px', padding: '10px 20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  avatar: {
    width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#E85D26,#F0A500)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: 700,
    color: '#fff', flexShrink: 0, letterSpacing: '-0.02em',
  },
}

export default function Profile() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)

  const [profileForm, setProfileForm] = useState({ name: '', bio: '' })
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPw, setSavingPw] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name || '', bio: user.bio || '' })
    }
  }, [user])

  const handleProfileSave = async (e) => {
    e.preventDefault()
    if (!profileForm.name.trim()) return toast.error('Name cannot be empty')
    setSavingProfile(true)
    try {
      await api.put('/users/profile', { name: profileForm.name, bio: profileForm.bio })
      dispatch(fetchCurrentUser())
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters')
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match')
    setSavingPw(true)
    try {
      await api.put('/users/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      })
      toast.success('Password changed successfully!')
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  const initials = user?.name ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?'

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Profile</title>
        <meta name="description" content="Manage your ConflictLens profile" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>My Profile</h1>
        <div style={S.sub}>Manage your account information</div>

        {/* Avatar & info */}
        <div style={{ ...S.card, display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={S.avatar}>{initials}</div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#E6EDF3' }}>{user?.name}</div>
            <div style={{ fontSize: '13px', color: '#8B949E', marginTop: '4px' }}>{user?.email}</div>
            <div style={{ marginTop: '8px' }}>
              <span style={{
                display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
                background: user?.role === 'admin' ? 'rgba(232,93,38,0.15)' : 'rgba(77,159,255,0.15)',
                color: user?.role === 'admin' ? '#E85D26' : '#4D9FFF',
                border: user?.role === 'admin' ? '1px solid rgba(232,93,38,0.3)' : '1px solid rgba(77,159,255,0.3)',
              }}>
                {user?.role === 'admin' ? '🛡 Admin' : '👤 Analyst'}
              </span>
            </div>
          </div>
        </div>

        {/* Edit profile */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Edit Profile</div>
          <form onSubmit={handleProfileSave} noValidate>
            <div style={S.field}>
              <label style={S.label}>Full Name</label>
              <input
                id="profile-name"
                value={profileForm.name}
                onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                style={S.input}
                placeholder="Your full name"
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Bio</label>
              <textarea
                id="profile-bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm((f) => ({ ...f, bio: e.target.value }))}
                style={{ ...S.input, resize: 'vertical', minHeight: '80px' }}
                placeholder="Short bio (optional)"
              />
            </div>
            <button type="submit" disabled={savingProfile} style={{ ...S.btnPrimary, opacity: savingProfile ? 0.7 : 1 }} id="save-profile">
              {savingProfile ? '⟳ Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Change Password</div>
          <form onSubmit={handlePasswordChange} noValidate>
            <div style={S.field}>
              <label style={S.label}>Current Password</label>
              <input
                id="current-password"
                type="password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, currentPassword: e.target.value }))}
                style={S.input}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>New Password</label>
              <input
                id="new-password"
                type="password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, newPassword: e.target.value }))}
                style={S.input}
                placeholder="Min 6 characters"
                autoComplete="new-password"
              />
            </div>
            <div style={{ ...S.field, marginBottom: '20px' }}>
              <label style={S.label}>Confirm New Password</label>
              <input
                id="confirm-password"
                type="password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                style={S.input}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </div>
            <button type="submit" disabled={savingPw} style={{ ...S.btnPrimary, opacity: savingPw ? 0.7 : 1 }} id="change-password">
              {savingPw ? '⟳ Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Account info */}
        <div style={S.card}>
          <div style={S.sectionTitle}>Account Information</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1C2128', fontSize: '13px' }}>
            <span style={{ color: '#8B949E' }}>Email</span>
            <span style={{ color: '#E6EDF3' }}>{user?.email}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1C2128', fontSize: '13px' }}>
            <span style={{ color: '#8B949E' }}>Role</span>
            <span style={{ color: '#E6EDF3', textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', fontSize: '13px' }}>
            <span style={{ color: '#8B949E' }}>Account Status</span>
            <span style={{ color: '#23D18B' }}>Active</span>
          </div>
        </div>
      </div>
    </Layout>
  )
}
