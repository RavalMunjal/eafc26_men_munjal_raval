import { useEffect, useState, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import Layout from '../components/common/Layout'
import api from '../services/api'
import toast from 'react-hot-toast'

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  page: { padding: '28px', minHeight: '100vh' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '13px', marginBottom: '24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' },
  searchRow: { display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' },
  input: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 14px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", width: '220px',
  },
  select: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 12px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
  },
  btnSecondary: {
    background: 'transparent', color: '#8B949E', border: '1px solid #30363D',
    borderRadius: '8px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  tableWrap: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#8B949E', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #30363D', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #1C2128', fontSize: '13px', color: '#E6EDF3', verticalAlign: 'middle' },
  avatar: (color) => ({
    width: '36px', height: '36px', borderRadius: '50%',
    background: `linear-gradient(135deg, ${color}, ${color}88)`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '14px', fontWeight: 700, color: '#fff', flexShrink: 0,
  }),
  roleBadge: (role) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
    background: role === 'admin' ? 'rgba(232,93,38,0.15)' : 'rgba(77,159,255,0.15)',
    color: role === 'admin' ? '#E85D26' : '#4D9FFF',
    border: role === 'admin' ? '1px solid rgba(232,93,38,0.3)' : '1px solid rgba(77,159,255,0.3)',
  }),
  statusBadge: (active) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
    background: active ? 'rgba(35,209,139,0.12)' : 'rgba(255,75,75,0.12)',
    color: active ? '#23D18B' : '#FF4B4B',
  }),
  btnAction: (color) => ({
    background: `rgba(${color},0.1)`, border: `1px solid rgba(${color},0.3)`,
    borderRadius: '6px', padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", color: `rgb(${color})`,
  }),
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', flexWrap: 'wrap', gap: '8px' },
  pageBtn: (active) => ({
    padding: '5px 11px', borderRadius: '6px',
    border: '1px solid ' + (active ? '#E85D26' : '#30363D'),
    background: active ? 'rgba(232,93,38,0.15)' : 'transparent',
    color: active ? '#E85D26' : '#8B949E', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif",
  }),
  // Confirm overlay
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  modal: {
    background: '#161B22', border: '1px solid #30363D', borderRadius: '16px',
    width: '100%', maxWidth: '420px', padding: '28px',
  },
}

const AVATAR_COLORS = ['#E85D26', '#23D18B', '#4D9FFF', '#A371F7', '#F0A500', '#39C5CF', '#FF4B4B']
const colorFor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) || 0) % AVATAR_COLORS.length]
const initials = (name) => (name ? name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) : '?')

// ─── Confirm Dialog ───────────────────────────────────────────────────────────
function ConfirmDialog({ title, body, onConfirm, onClose, confirmLabel = 'Confirm', danger = false }) {
  const [busy, setBusy] = useState(false)
  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#E6EDF3', marginBottom: '10px' }}>{title}</div>
        <div style={{ color: '#8B949E', fontSize: '13px', marginBottom: '24px', lineHeight: 1.5 }}>{body}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={S.btnSecondary}>Cancel</button>
          <button
            onClick={async () => { setBusy(true); await onConfirm(); setBusy(false) }}
            disabled={busy}
            style={{
              background: danger ? 'rgba(255,75,75,0.15)' : 'rgba(232,93,38,0.15)',
              color: danger ? '#FF4B4B' : '#E85D26',
              border: `1px solid ${danger ? 'rgba(255,75,75,0.3)' : 'rgba(232,93,38,0.3)'}`,
              borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Inter', sans-serif", opacity: busy ? 0.7 : 1,
            }}
          >
            {busy ? '⟳ Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPageState] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [confirm, setConfirm] = useState(null) // { action, user }

  const LIMIT = 15

  const load = useCallback(async (pg = 1) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: pg, limit: LIMIT })
      if (keyword) params.append('keyword', keyword)
      if (roleFilter) params.append('role', roleFilter)
      const res = await api.get(`/admin/users?${params}`)
      const d = res.data
      setUsers(d.data || [])
      setTotal(d.pagination?.total || d.total || 0)
      setTotalPages(d.pagination?.totalPages || 1)
      setPageState(pg)
    } catch {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [keyword, roleFilter])

  useEffect(() => { load(1) }, [roleFilter])

  const handleRoleChange = async (user, newRole) => {
    try {
      await api.patch(`/admin/users/${user._id}/role`, { role: newRole })
      toast.success(`${user.name}'s role updated to ${newRole}`)
      load(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role')
    }
    setConfirm(null)
  }

  const handleToggleStatus = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}/status`)
      toast.success(`${user.name} ${user.isActive === false ? 'activated' : 'deactivated'}`)
      load(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle status')
    }
    setConfirm(null)
  }

  const handleDelete = async (user) => {
    try {
      await api.delete(`/admin/users/${user._id}`)
      toast.success(`${user.name} has been deleted`)
      load(page)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user')
    }
    setConfirm(null)
  }

  const pages = () => {
    const arr = [], s = Math.max(1, page - 2), e = Math.min(totalPages, page + 2)
    for (let i = s; i <= e; i++) arr.push(i)
    return arr
  }

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Manage Users</title>
        <meta name="description" content="Admin: manage user accounts and roles" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>👥 Manage Users</h1>
        <div style={S.sub}>View and manage all user accounts · {total} total users</div>

        {/* Top bar */}
        <div style={S.topBar}>
          <form onSubmit={(e) => { e.preventDefault(); load(1) }} style={S.searchRow}>
            <input
              id="user-search"
              placeholder="🔍 Search by name or email..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={S.input}
            />
            <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={S.select} id="user-role-filter">
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" style={S.btnSecondary}>Search</button>
          </form>
          <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '10px', padding: '8px 16px', display: 'flex', gap: '20px' }}>
            {[
              { label: 'Total', value: total, color: '#E6EDF3' },
              { label: 'Admins', value: users.filter((u) => u.role === 'admin').length, color: '#E85D26' },
              { label: 'Users', value: users.filter((u) => u.role !== 'admin').length, color: '#4D9FFF' },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#8B949E' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8B949E' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⟳</div>Loading users...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8B949E', fontSize: '14px' }}>No users found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>User</th>
                    <th style={S.th}>Email</th>
                    <th style={S.th}>Role</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Joined</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => {
                    const isActive = u.isActive !== false
                    const joined = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
                    return (
                      <tr
                        key={u._id}
                        onMouseEnter={(e) => (e.currentTarget.style.background = '#1C2128')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                        style={{ transition: 'background 0.15s' }}
                      >
                        <td style={S.td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={S.avatar(colorFor(u.name))}>{initials(u.name)}</div>
                            <div>
                              <div style={{ fontWeight: 600 }}>{u.name}</div>
                              {u.bio && <div style={{ fontSize: '11px', color: '#8B949E', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.bio}</div>}
                            </div>
                          </div>
                        </td>
                        <td style={{ ...S.td, color: '#8B949E' }}>{u.email}</td>
                        <td style={S.td}><span style={S.roleBadge(u.role)}>{u.role === 'admin' ? '🛡 Admin' : '👤 User'}</span></td>
                        <td style={S.td}><span style={S.statusBadge(isActive)}>{isActive ? 'Active' : 'Inactive'}</span></td>
                        <td style={{ ...S.td, color: '#8B949E', fontSize: '12px' }}>{joined}</td>
                        <td style={S.td}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {/* Toggle role */}
                            <button
                              style={S.btnAction(u.role === 'admin' ? '77,159,255' : '232,93,38')}
                              onClick={() => setConfirm({
                                action: 'role',
                                user: u,
                                newRole: u.role === 'admin' ? 'user' : 'admin',
                              })}
                            >
                              {u.role === 'admin' ? '↓ Demote' : '↑ Promote'}
                            </button>
                            {/* Toggle active */}
                            <button
                              style={S.btnAction(isActive ? '255,75,75' : '35,209,139')}
                              onClick={() => setConfirm({ action: 'status', user: u })}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {/* Delete */}
                            <button
                              style={S.btnAction('255,75,75')}
                              onClick={() => setConfirm({ action: 'delete', user: u })}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={S.pagination}>
            <span style={{ color: '#8B949E', fontSize: '13px' }}>Page {page} of {totalPages} · {total} users</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => load(1)} disabled={page === 1} style={S.pageBtn(false)}>«</button>
              <button onClick={() => load(page - 1)} disabled={page === 1} style={S.pageBtn(false)}>‹</button>
              {pages().map((p) => (
                <button key={p} onClick={() => load(p)} style={S.pageBtn(p === page)}>{p}</button>
              ))}
              <button onClick={() => load(page + 1)} disabled={page === totalPages} style={S.pageBtn(false)}>›</button>
              <button onClick={() => load(totalPages)} disabled={page === totalPages} style={S.pageBtn(false)}>»</button>
            </div>
          </div>
        )}
      </div>

      {/* Confirm Dialogs */}
      {confirm?.action === 'role' && (
        <ConfirmDialog
          title={`${confirm.newRole === 'admin' ? 'Promote to Admin' : 'Demote to User'}`}
          body={<>Change <strong style={{ color: '#E6EDF3' }}>{confirm.user.name}</strong>'s role to <strong style={{ color: confirm.newRole === 'admin' ? '#E85D26' : '#4D9FFF' }}>{confirm.newRole}</strong>?</>}
          confirmLabel={confirm.newRole === 'admin' ? 'Yes, Promote' : 'Yes, Demote'}
          onClose={() => setConfirm(null)}
          onConfirm={() => handleRoleChange(confirm.user, confirm.newRole)}
        />
      )}
      {confirm?.action === 'status' && (
        <ConfirmDialog
          title={confirm.user.isActive === false ? 'Activate Account' : 'Deactivate Account'}
          body={<>{confirm.user.isActive === false ? 'Restore access for' : 'Suspend'} <strong style={{ color: '#E6EDF3' }}>{confirm.user.name}</strong>?</>}
          confirmLabel={confirm.user.isActive === false ? 'Activate' : 'Deactivate'}
          danger={confirm.user.isActive !== false}
          onClose={() => setConfirm(null)}
          onConfirm={() => handleToggleStatus(confirm.user)}
        />
      )}
      {confirm?.action === 'delete' && (
        <ConfirmDialog
          title="Delete User"
          body={<>Permanently delete <strong style={{ color: '#E6EDF3' }}>{confirm.user.name}</strong>? This action cannot be undone.</>}
          confirmLabel="Delete"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={() => handleDelete(confirm.user)}
        />
      )}
    </Layout>
  )
}
