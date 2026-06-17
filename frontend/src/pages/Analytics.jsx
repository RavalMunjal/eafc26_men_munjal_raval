import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from 'recharts'
import { fetchAllStats, fetchInflationByRegion } from '../store/statsSlice'
import Layout from '../components/common/Layout'
import { formatPercent, formatCurrency } from '../utils/formatters'
import { CHART_COLORS } from '../utils/constants'

const S = {
  page: { padding: '28px', minHeight: '100vh' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '13px', marginBottom: '28px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
  grid3: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '16px' },
  card: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  cardTitle: { fontSize: '14px', fontWeight: 600, color: '#E6EDF3', marginBottom: '16px' },
  statRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1C2128', fontSize: '13px', alignItems: 'center' },
  statLabel: { color: '#8B949E' },
  statValue: { color: '#E6EDF3', fontWeight: 600 },
  skeletonCard: {
    background: 'linear-gradient(90deg,#161B22 25%,#1C2128 50%,#161B22 75%)', backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite', borderRadius: '12px', height: '280px', border: '1px solid #30363D',
  },
}

const PIE_COLORS = ['#E85D26', '#F0A500', '#23D18B', '#4D9FFF', '#A371F7', '#39C5CF', '#FF4B4B', '#8B949E']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null
  return (
    <div style={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#E6EDF3' }}>
      <div style={{ color: '#8B949E', marginBottom: '6px', fontSize: '11px' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#E6EDF3' }}>{p.name}: {p.value}</div>
      ))}
    </div>
  )
}

export default function Analytics() {
  const dispatch = useDispatch()
  const { totals, regionSummary, typeSummary, inflationByRegion, highestInflation, lowestGDP, highestPoverty, economicOverview, loading } = useSelector((s) => s.stats)

  useEffect(() => {
    dispatch(fetchAllStats())
    dispatch(fetchInflationByRegion())
  }, [dispatch])

  const regionData = (Array.isArray(regionSummary) ? regionSummary : [])
    .map((r) => ({ name: r.region || r._id || 'Unknown', count: r.count || r.total || 0 }))

  const typeData = (Array.isArray(typeSummary) ? typeSummary : [])
    .map((t) => ({ name: t.type || t._id || 'Unknown', count: t.count || t.total || 0 }))

  const inflationData = (Array.isArray(inflationByRegion) ? inflationByRegion : [])
    .map((r) => ({ name: r.region || r._id || 'Unknown', avgInflation: parseFloat((r.avgInflation || r.avg || 0).toFixed(2)) }))

  const rawEco = economicOverview?.data || economicOverview
  const overviewItems = rawEco
    ? [
        { label: 'Avg Inflation Rate', value: formatPercent(rawEco.avgInflation || rawEco.avgInflationRate) },
        { label: 'Avg GDP Change', value: formatPercent(rawEco.avgGDP || rawEco.avgGDPChange) },
        { label: 'Avg War Cost', value: formatCurrency(rawEco.avgWarCost || rawEco.avgCostOfWar) },
        { label: 'Avg Reconstruction Cost', value: formatCurrency(rawEco.avgReconstructionCost) },
        { label: 'Avg Poverty Rate', value: formatPercent(rawEco.avgPoverty || rawEco.avgPovertyRate) },
      ].filter((i) => i.value !== 'N/A')
    : []

  const hiInflation = highestInflation?.data || highestInflation
  const loGDP = lowestGDP?.data || lowestGDP
  const hiPoverty = highestPoverty?.data || highestPoverty

  if (loading) {
    return (
      <Layout>
        <div style={S.page}>
          <h1 style={S.title}>Analytics</h1>
          <div style={S.sub}>Loading analytics...</div>
          <div style={S.grid2}>
            {[1, 2, 3, 4].map((i) => <div key={i} style={S.skeletonCard} />)}
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Analytics</title>
        <meta name="description" content="War economic impact analytics and statistics" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>📊 Analytics</h1>
        <div style={S.sub}>Global war economic impact statistics</div>

        {/* Summary KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total Conflicts', value: totals.total, color: '#E85D26' },
            { label: 'Ongoing', value: totals.ongoing, color: '#FF4B4B' },
            { label: 'Resolved', value: totals.resolved, color: '#23D18B' },
          ].map((s) => (
            <div key={s.label} style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px', borderTop: `3px solid ${s.color}` }}>
              <div style={{ fontSize: '11px', color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '36px', fontWeight: 700, color: '#E6EDF3' }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div style={S.grid2}>
          {/* Region bar chart */}
          <div style={S.card}>
            <div style={S.cardTitle}>Conflicts by Region</div>
            {regionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={regionData} margin={{ left: -20 }}>
                  <XAxis dataKey="name" tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(232,93,38,0.06)' }} />
                  <Bar dataKey="count" name="Conflicts" fill="#E85D26" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E', fontSize: '13px' }}>No data</div>}
          </div>

          {/* Type pie chart */}
          <div style={S.card}>
            <div style={S.cardTitle}>Conflicts by Type</div>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={typeData} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                    {typeData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#8B949E' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B949E', fontSize: '13px' }}>No data</div>}
          </div>
        </div>

        {/* Inflation by region area chart */}
        {inflationData.length > 0 && (
          <div style={S.card}>
            <div style={S.cardTitle}>Average Inflation Rate by Region (%)</div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={inflationData} margin={{ left: -15 }}>
                <defs>
                  <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E85D26" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E85D26" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#30363D" strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'rgba(232,93,38,0.4)' }} />
                <Area type="monotone" dataKey="avgInflation" name="Avg Inflation %" stroke="#E85D26" fill="url(#inflGrad)" strokeWidth={2} dot={{ fill: '#E85D26', r: 3 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Economic overview + extremes */}
        <div style={S.grid2}>
          {overviewItems.length > 0 && (
            <div style={S.card}>
              <div style={S.cardTitle}>📈 Global Economic Overview</div>
              {overviewItems.map((item) => (
                <div key={item.label} style={S.statRow}>
                  <span style={S.statLabel}>{item.label}</span>
                  <span style={S.statValue}>{item.value}</span>
                </div>
              ))}
            </div>
          )}

          <div style={S.card}>
            <div style={S.cardTitle}>🏆 Extremes</div>
            {hiInflation && (
              <div style={S.statRow}>
                <span style={S.statLabel}>Highest Inflation</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FF4B4B', fontWeight: 600, fontSize: '13px' }}>{hiInflation.Conflict_Name}</div>
                  <div style={{ color: '#8B949E', fontSize: '12px' }}>{formatPercent(hiInflation.Inflation_Rate_Percentage)}</div>
                </div>
              </div>
            )}
            {loGDP && (
              <div style={S.statRow}>
                <span style={S.statLabel}>Lowest GDP Change</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FF4B4B', fontWeight: 600, fontSize: '13px' }}>{loGDP.Conflict_Name}</div>
                  <div style={{ color: '#8B949E', fontSize: '12px' }}>{formatPercent(loGDP.GDP_Change_Percentage)}</div>
                </div>
              </div>
            )}
            {hiPoverty && (
              <div style={S.statRow}>
                <span style={S.statLabel}>Highest Poverty</span>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#FF4B4B', fontWeight: 600, fontSize: '13px' }}>{hiPoverty.Conflict_Name}</div>
                  <div style={{ color: '#8B949E', fontSize: '12px' }}>{formatPercent(hiPoverty.During_War_Poverty_Rate_Percentage)}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
