import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'
import { setTheme, setSidebarOpen } from '../store/uiSlice'
import Layout from '../components/common/Layout'
import { API_BASE_URL } from '../utils/constants'

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: { padding: '28px', minHeight: '100vh', maxWidth: '760px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '13px', marginBottom: '28px' },
  card: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '24px', marginBottom: '16px' },
  sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#E6EDF3', marginBottom: '4px' },
  sectionSub: { fontSize: '12px', color: '#8B949E', marginBottom: '20px' },
  divider: { borderTop: '1px solid #30363D', margin: '0 0 20px' },
  settingRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 0', borderBottom: '1px solid #1C2128',
  },
  settingLabel: { fontSize: '14px', fontWeight: 500, color: '#E6EDF3' },
  settingDesc: { fontSize: '12px', color: '#8B949E', marginTop: '3px' },
  // Toggle switch
  toggleTrack: (on) => ({
    width: '44px', height: '24px', borderRadius: '12px',
    background: on ? 'rgba(35,209,139,0.8)' : '#30363D',
    position: 'relative', cursor: 'pointer', transition: 'background 0.25s',
    flexShrink: 0,
  }),
  toggleThumb: (on) => ({
    width: '18px', height: '18px', borderRadius: '50%', background: '#fff',
    position: 'absolute', top: '3px',
    left: on ? '23px' : '3px',
    transition: 'left 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
  }),
  // Radio / option buttons
  optionGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  optionBtn: (active) => ({
    padding: '6px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", fontWeight: active ? 600 : 400,
    background: active ? 'rgba(232,93,38,0.15)' : '#0D1117',
    border: '1px solid ' + (active ? 'rgba(232,93,38,0.5)' : '#30363D'),
    color: active ? '#E85D26' : '#8B949E', transition: 'all 0.15s',
  }),
  // Code / info boxes
  codeBox: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '12px 14px', fontFamily: 'monospace', fontSize: '12px', color: '#23D18B',
    wordBreak: 'break-all', marginTop: '8px',
  },
  infoRow: { display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px solid #1C2128' },
  infoLabel: { color: '#8B949E' },
  infoValue: { color: '#E6EDF3', fontWeight: 500 },
  dangerBtn: {
    background: 'rgba(255,75,75,0.1)', color: '#FF4B4B',
    border: '1px solid rgba(255,75,75,0.3)', borderRadius: '8px',
    padding: '8px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  saveBtn: {
    background: 'linear-gradient(135deg,#E85D26,#F0A500)', color: '#fff',
    border: 'none', borderRadius: '8px', padding: '9px 20px',
    fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
}

// ─── Toggle Switch Component ──────────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <div style={S.toggleTrack(on)} onClick={onChange} role="switch" aria-checked={on}>
      <div style={S.toggleThumb(on)} />
    </div>
  )
}

// ─── Settings Row ─────────────────────────────────────────────────────────────
function SettingRow({ label, desc, children, last }) {
  return (
    <div style={{ ...S.settingRow, borderBottom: last ? 'none' : '1px solid #1C2128' }}>
      <div>
        <div style={S.settingLabel}>{label}</div>
        {desc && <div style={S.settingDesc}>{desc}</div>}
      </div>
      {children}
    </div>
  )
}

// ─── Copy button ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }
  return (
    <button onClick={copy} style={{
      background: copied ? 'rgba(35,209,139,0.1)' : '#0D1117',
      border: '1px solid ' + (copied ? 'rgba(35,209,139,0.4)' : '#30363D'),
      color: copied ? '#23D18B' : '#8B949E',
      borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
      fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', flexShrink: 0,
    }}>
      {copied ? '✓ Copied' : 'Copy'}
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Settings() {
  const dispatch = useDispatch()
  const { theme, sidebarOpen } = useSelector((s) => s.ui)
  const { user } = useSelector((s) => s.auth)

  // Local preferences (persisted via Redux/localStorage already)
  const [pageSize, setPageSize] = useState(() => {
    return parseInt(localStorage.getItem('cl_page_size') || '15', 10)
  })
  const [dateFormat, setDateFormat] = useState(() => localStorage.getItem('cl_date_format') || 'dd/mm/yyyy')
  const [animationsEnabled, setAnimationsEnabled] = useState(() => localStorage.getItem('cl_animations') !== 'false')

  const savePrefs = () => {
    localStorage.setItem('cl_page_size', pageSize)
    localStorage.setItem('cl_date_format', dateFormat)
    localStorage.setItem('cl_animations', animationsEnabled)
    toast.success('Preferences saved!')
  }

  const clearCache = () => {
    const keys = ['cl_theme', 'cl_page_size', 'cl_date_format', 'cl_animations']
    keys.forEach((k) => localStorage.removeItem(k))
    toast.success('Cache cleared. Refreshing...')
    setTimeout(() => window.location.reload(), 800)
  }

  const apiVersion = 'v1'
  const baseUrl = API_BASE_URL

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Settings</title>
        <meta name="description" content="Configure your ConflictLens dashboard preferences" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>⚙️ Settings</h1>
        <div style={S.sub}>Customize your ConflictLens experience</div>

        {/* ── Appearance ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>🎨 Appearance</div>
          <div style={S.sectionSub}>Control how ConflictLens looks and feels</div>
          <hr style={S.divider} />

          <SettingRow label="Color Theme" desc="Switch between dark and light modes">
            <div style={S.optionGroup}>
              {['dark', 'light'].map((t) => (
                <button
                  key={t}
                  style={S.optionBtn(theme === t)}
                  onClick={() => dispatch(setTheme(t))}
                  id={`theme-${t}`}
                >
                  {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Sidebar Expanded" desc="Keep the sidebar expanded by default">
            <Toggle on={sidebarOpen} onChange={() => dispatch(setSidebarOpen(!sidebarOpen))} />
          </SettingRow>

          <SettingRow label="Animations" desc="Enable micro-animations and transitions" last>
            <Toggle on={animationsEnabled} onChange={() => setAnimationsEnabled(!animationsEnabled)} />
          </SettingRow>
        </div>

        {/* ── Display Preferences ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>📊 Display Preferences</div>
          <div style={S.sectionSub}>Configure how data is displayed across the app</div>
          <hr style={S.divider} />

          <SettingRow label="Default Page Size" desc="Number of records shown per page in tables">
            <div style={S.optionGroup}>
              {[10, 15, 25, 50].map((n) => (
                <button
                  key={n}
                  style={S.optionBtn(pageSize === n)}
                  onClick={() => setPageSize(n)}
                  id={`page-size-${n}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </SettingRow>

          <SettingRow label="Date Format" desc="How dates are displayed throughout the app" last>
            <div style={S.optionGroup}>
              {['dd/mm/yyyy', 'mm/dd/yyyy', 'yyyy-mm-dd'].map((f) => (
                <button
                  key={f}
                  style={S.optionBtn(dateFormat === f)}
                  onClick={() => setDateFormat(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </SettingRow>
        </div>

        {/* Save preferences button */}
        <div style={{ marginBottom: '16px' }}>
          <button style={S.saveBtn} onClick={savePrefs} id="save-preferences">
            Save Preferences
          </button>
        </div>

        {/* ── API Information ── */}
        <div style={S.card}>
          <div style={S.sectionTitle}>📡 API Information</div>
          <div style={S.sectionSub}>Backend connection details (admin reference)</div>
          <hr style={S.divider} />

          <div style={S.infoRow}>
            <span style={S.infoLabel}>API Version</span>
            <span style={{ ...S.infoValue, background: 'rgba(35,209,139,0.1)', color: '#23D18B', borderRadius: '6px', padding: '2px 8px', fontSize: '12px' }}>
              {apiVersion}
            </span>
          </div>
          <div style={S.infoRow}>
            <span style={S.infoLabel}>Your Role</span>
            <span style={{ ...S.infoValue, color: user?.role === 'admin' ? '#E85D26' : '#4D9FFF', textTransform: 'capitalize' }}>
              {user?.role === 'admin' ? '🛡 Admin' : '👤 Analyst'}
            </span>
          </div>
          <div style={S.infoRow}>
            <span style={S.infoLabel}>Logged in as</span>
            <span style={S.infoValue}>{user?.email || '—'}</span>
          </div>
          <div style={{ ...S.infoRow, borderBottom: 'none' }}>
            <span style={S.infoLabel}>Backend Base URL</span>
            <span />
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ ...S.codeBox, flex: 1, marginTop: 0 }}>{baseUrl}</div>
            <CopyBtn text={baseUrl} />
          </div>

          <div style={{ marginTop: '16px', fontSize: '12px', color: '#8B949E', lineHeight: 1.6 }}>
            <strong style={{ color: '#E6EDF3' }}>Available API sections:</strong><br />
            <span style={{ color: '#E85D26' }}>/auth</span> · <span style={{ color: '#4D9FFF' }}>/conflicts</span> · <span style={{ color: '#23D18B' }}>/stats</span> · <span style={{ color: '#A371F7' }}>/admin</span> · <span style={{ color: '#F0A500' }}>/users</span>
          </div>
        </div>

        {/* ── Danger Zone ── */}
        <div style={{ ...S.card, border: '1px solid rgba(255,75,75,0.25)' }}>
          <div style={{ ...S.sectionTitle, color: '#FF4B4B' }}>⚠️ Danger Zone</div>
          <div style={S.sectionSub}>These actions affect your local app data</div>
          <hr style={{ borderTop: '1px solid rgba(255,75,75,0.15)', margin: '0 0 20px' }} />

          <SettingRow label="Clear Local Cache" desc="Reset all locally stored preferences and cached data. App will reload." last>
            <button style={S.dangerBtn} onClick={clearCache} id="clear-cache-btn">
              Clear Cache
            </button>
          </SettingRow>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#4A5568', fontSize: '12px', marginTop: '12px' }}>
          ConflictLens · Built with React + Redux + Express + MongoDB
        </div>
      </div>
    </Layout>
  )
}
