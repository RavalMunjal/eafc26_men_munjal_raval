import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { fetchAllStats } from '../store/statsSlice'
import { fetchConflicts } from '../store/conflictsSlice'
import Layout from '../components/common/Layout'
import api from '../services/api'
import { formatPercent } from '../utils/formatters'

const S = {
  page: { padding: '28px', minHeight: '100vh' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '13px', marginBottom: '28px' },
  grid4: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' },
  kpiCard: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px' },
  kpiLabel: { fontSize: '11px', color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: 600 },
  kpiValue: { fontSize: '32px', fontWeight: 700, color: '#E6EDF3' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  card: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: '#E6EDF3', marginBottom: '16px' },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px',
    background: '#1C2128', border: '1px solid #30363D', borderRadius: '10px',
    color: '#E6EDF3', textDecoration: 'none', fontSize: '14px', fontWeight: 500,
    transition: 'all 0.2s', marginBottom: '10px',
  },
  actionIcon: { fontSize: '20px', width: '32px', textAlign: 'center' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1C2128', fontSize: '13px' },
  badge: (s) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
    background: s === 'Ongoing' ? 'rgba(255,75,75,0.15)' : s === 'Resolved' ? 'rgba(35,209,139,0.15)' : 'rgba(240,165,0,0.15)',
    color: s === 'Ongoing' ? '#FF4B4B' : s === 'Resolved' ? '#23D18B' : '#F0A500',
  }),
}

const PIE_COLORS = ['#E85D26', '#23D18B', '#F0A500']

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const { totals, regionSummary, typeSummary, loading: statsLoading } = useSelector((s) => s.stats)
  const { list: conflicts } = useSelector((s) => s.conflicts)
  const [userCount, setUserCount] = useState(null)

  useEffect(() => {
    dispatch(fetchAllStats())
    dispatch(fetchConflicts({ page: 1, limit: 5, sort: '-createdAt' }))
    // fetch user count
    api.get('/admin/users?limit=1').then((res) => {
      const total = res.data?.pagination?.total || res.data?.total || null
      setUserCount(total)
    }).catch(() => {})
  }, [dispatch])

  const regionData = (Array.isArray(regionSummary) ? regionSummary : [])
    .slice(0, 8)
    .map((r) => ({ name: r.region || r._id || 'Unknown', count: r.count || r.total || 0 }))

  const pieData = [
    { name: 'Ongoing', value: totals.ongoing },
    { name: 'Resolved', value: totals.resolved },
    { name: 'Other', value: Math.max(0, totals.total - totals.ongoing - totals.resolved) },
  ].filter((d) => d.value > 0)

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Admin Dashboard</title>
        <meta name="description" content="Admin control panel for ConflictLens" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>🛡 Admin Dashboard</h1>
        <div style={S.sub}>System overview and management tools</div>

        {/* KPIs */}
        <div style={S.grid4}>
          {[
            { label: 'Total Conflicts', value: totals.total, color: '#E85D26' },
            { label: 'Ongoing', value: totals.ongoing, color: '#FF4B4B' },
            { label: 'Resolved', value: totals.resolved, color: '#23D18B' },
            { label: 'Users', value: userCount !== null ? userCount : '—', color: '#4D9FFF' },
          ].map((k) => (
            <div key={k.label} style={{ ...S.kpiCard, borderTop: `3px solid ${k.color}` }}>
              <div style={S.kpiLabel}>{k.label}</div>
              <div style={S.kpiValue}>{statsLoading && k.label !== 'Users' ? '...' : k.value}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.cardTitle}>Conflicts by Region</div>
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={regionData} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }} cursor={{ fill: 'rgba(232,93,38,0.06)' }} />
                  <Bar dataKey="count" name="Conflicts" fill="#E85D26" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E', fontSize: '13px' }}>No data</div>}
          </div>

          <div style={S.card}>
            <div style={S.cardTitle}>Status Distribution</div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4}>
                    {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E', fontSize: '13px' }}>No data</div>}
            {pieData.map((p, i) => (
              <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#8B949E', marginTop: i === 0 ? '8px' : '4px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: PIE_COLORS[i], display: 'inline-block' }} />
                {p.name}: {p.value}
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions + recent conflicts */}
        <div style={S.grid2}>
          <div style={S.card}>
            <div style={S.cardTitle}>⚡ Quick Actions</div>
            <Link to="/admin/conflicts" style={S.actionBtn}>
              <span style={S.actionIcon}>✏️</span>
              <div>
                <div>Manage Conflicts</div>
                <div style={{ fontSize: '12px', color: '#8B949E' }}>Add, edit, delete conflicts</div>
              </div>
              <span style={{ marginLeft: 'auto', color: '#8B949E' }}>→</span>
            </Link>
            <Link to="/admin/users" style={S.actionBtn}>
              <span style={S.actionIcon}>👥</span>
              <div>
                <div>Manage Users</div>
                <div style={{ fontSize: '12px', color: '#8B949E' }}>View and manage accounts</div>
              </div>
              <span style={{ marginLeft: 'auto', color: '#8B949E' }}>→</span>
            </Link>
            <Link to="/analytics" style={S.actionBtn}>
              <span style={S.actionIcon}>📊</span>
              <div>
                <div>Analytics</div>
                <div style={{ fontSize: '12px', color: '#8B949E' }}>Charts and statistics</div>
              </div>
              <span style={{ marginLeft: 'auto', color: '#8B949E' }}>→</span>
            </Link>
          </div>

          <div style={S.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={S.cardTitle}>Recent Conflicts</div>
              <Link to="/admin/conflicts" style={{ color: '#E85D26', fontSize: '12px', textDecoration: 'none' }}>Manage →</Link>
            </div>
            {conflicts.slice(0, 5).map((c) => (
              <div key={c._id} style={S.row}>
                <div>
                  <div style={{ fontWeight: 500, color: '#E6EDF3', fontSize: '13px' }}>{c.Conflict_Name}</div>
                  <div style={{ color: '#8B949E', fontSize: '12px' }}>{c.Region}</div>
                </div>
                <span style={S.badge(c.Status)}>{c.Status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
