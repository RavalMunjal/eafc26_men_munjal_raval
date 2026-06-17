import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts'
import { fetchAllStats } from '../store/statsSlice'
import { fetchConflicts } from '../store/conflictsSlice'
import Layout from '../components/common/Layout'
import { formatCurrency, formatPercent } from '../utils/formatters'
import { CHART_COLORS } from '../utils/constants'

const S = {
  page: { padding: '28px', minHeight: '100vh' },
  header: { marginBottom: '28px' },
  greeting: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '14px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: {
    background: '#161B22', border: '1px solid #30363D', borderRadius: '12px',
    padding: '20px', position: 'relative', overflow: 'hidden',
  },
  statLabel: { fontSize: '11px', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' },
  statValue: { fontSize: '32px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.03em' },
  statUnit: { fontSize: '14px', color: '#8B949E', marginTop: '4px' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '28px' },
  card: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px' },
  cardTitle: { fontSize: '15px', fontWeight: 600, color: '#E6EDF3', marginBottom: '16px' },
  conflictRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 0', borderBottom: '1px solid #1C2128', textDecoration: 'none',
  },
  conflictName: { fontSize: '14px', color: '#E6EDF3', fontWeight: 500 },
  conflictMeta: { fontSize: '12px', color: '#8B949E', marginTop: '2px' },
  badge: (color) => ({
    display: 'inline-block', padding: '2px 10px', borderRadius: '100px',
    fontSize: '11px', fontWeight: 600,
    background: color === 'danger' ? 'rgba(255,75,75,0.15)' :
                color === 'success' ? 'rgba(35,209,139,0.15)' : 'rgba(240,165,0,0.15)',
    color: color === 'danger' ? '#FF4B4B' : color === 'success' ? '#23D18B' : '#F0A500',
  }),
  viewAll: { display: 'inline-block', marginTop: '12px', color: '#E85D26', fontSize: '13px', textDecoration: 'none', fontWeight: 500 },
}

const PIE_COLORS = ['#E85D26', '#F0A500', '#23D18B']

function StatCard({ label, value, unit, accent }) {
  return (
    <div style={{ ...S.statCard, borderTop: `3px solid ${accent || '#E85D26'}` }}>
      <div style={S.statLabel}>{label}</div>
      <div style={S.statValue}>{value}</div>
      {unit && <div style={S.statUnit}>{unit}</div>}
    </div>
  )
}

export default function UserDashboard() {
  const dispatch = useDispatch()
  const { user } = useSelector((s) => s.auth)
  const { totals, regionSummary, typeSummary, loading: statsLoading } = useSelector((s) => s.stats)
  const { list: conflicts, loading: conflictsLoading } = useSelector((s) => s.conflicts)

  useEffect(() => {
    dispatch(fetchAllStats())
    dispatch(fetchConflicts({ page: 1, limit: 6, sort: '-createdAt' }))
  }, [dispatch])

  const pieData = [
    { name: 'Ongoing', value: totals.ongoing },
    { name: 'Resolved', value: totals.resolved },
    { name: 'Other', value: Math.max(0, totals.total - totals.ongoing - totals.resolved) },
  ].filter((d) => d.value > 0)

  const regionData = (Array.isArray(regionSummary) ? regionSummary : [])
    .slice(0, 8)
    .map((r) => ({ name: r.region || r._id || 'Unknown', conflicts: r.count || r.total || 0 }))

  const statusColor = (s) =>
    s === 'Ongoing' ? 'danger' : s === 'Resolved' ? 'success' : 'amber'

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Dashboard</title>
        <meta name="description" content="War Economic Impact Analytics Dashboard" />
      </Helmet>
      <div style={S.page}>
        {/* Header */}
        <div style={S.header}>
          <div style={S.greeting}>Welcome back, {user?.name?.split(' ')[0] || 'Analyst'} 👋</div>
          <div style={S.sub}>War Economic Impact Intelligence Platform</div>
        </div>

        {/* Stat Cards */}
        {statsLoading ? (
          <div style={{ ...S.statsGrid }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ ...S.statCard, height: '110px', background: 'linear-gradient(90deg,#161B22 25%,#1C2128 50%,#161B22 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
            ))}
          </div>
        ) : (
          <div style={S.statsGrid}>
            <StatCard label="Total Conflicts" value={totals.total} accent="#E85D26" />
            <StatCard label="Ongoing" value={totals.ongoing} unit="active conflicts" accent="#FF4B4B" />
            <StatCard label="Resolved" value={totals.resolved} unit="concluded" accent="#23D18B" />
            <StatCard label="Regions Covered" value={regionData.length} unit="global regions" accent="#4D9FFF" />
          </div>
        )}

        {/* Charts */}
        <div style={{ ...S.chartsRow, flexWrap: 'wrap' }}>
          {/* Bar chart: conflicts by region */}
          <div style={S.card}>
            <div style={S.cardTitle}>Conflicts by Region</div>
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={regionData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }}
                    cursor={{ fill: 'rgba(232,93,38,0.08)' }}
                  />
                  <Bar dataKey="conflicts" fill="#E85D26" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E', fontSize: '13px' }}>
                No data available
              </div>
            )}
          </div>

          {/* Pie chart: status breakdown */}
          <div style={S.card}>
            <div style={S.cardTitle}>Status Breakdown</div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                    {pieData.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', color: '#8B949E' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E', fontSize: '13px' }}>
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Recent Conflicts */}
        <div style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={S.cardTitle}>Recent Conflicts</div>
            <Link to="/conflicts" style={{ color: '#E85D26', fontSize: '13px', textDecoration: 'none' }}>View All →</Link>
          </div>
          {conflictsLoading ? (
            <div style={{ color: '#8B949E', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>Loading...</div>
          ) : conflicts.length === 0 ? (
            <div style={{ color: '#8B949E', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>No conflicts found.</div>
          ) : (
            conflicts.slice(0, 6).map((c) => (
              <Link key={c._id} to={`/conflicts/${c._id}`} style={{ ...S.conflictRow, ':hover': { background: '#1C2128' } }}>
                <div>
                  <div style={S.conflictName}>{c.Conflict_Name || 'Unnamed'}</div>
                  <div style={S.conflictMeta}>{c.Region} · {c.Start_Year}{c.End_Year ? `–${c.End_Year}` : '–Present'}</div>
                </div>
                <span style={S.badge(statusColor(c.Status))}>{c.Status}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
