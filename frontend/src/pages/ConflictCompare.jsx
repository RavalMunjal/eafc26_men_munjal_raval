import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useDispatch, useSelector } from 'react-redux'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'
import { fetchConflicts } from '../store/conflictsSlice'
import Layout from '../components/common/Layout'
import { conflictService } from '../services/conflictService'
import { formatPercent, formatCurrency, formatNumber } from '../utils/formatters'
import toast from 'react-hot-toast'

const S = {
  page: { padding: '28px', minHeight: '100vh' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em', marginBottom: '4px' },
  sub: { color: '#8B949E', fontSize: '13px', marginBottom: '28px' },
  row: { display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'start', marginBottom: '24px' },
  card: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px' },
  select: {
    width: '100%', background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '10px 14px', color: '#E6EDF3', fontSize: '14px', outline: 'none',
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
  },
  vs: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E85D26', fontWeight: 700, fontSize: '20px', paddingTop: '40px' },
  btn: {
    width: '100%', background: 'linear-gradient(135deg,#E85D26,#F0A500)', color: '#fff',
    border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: 600,
    cursor: 'pointer', fontFamily: "'Inter', sans-serif", marginBottom: '24px',
  },
  compGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' },
  confTitle: { fontSize: '18px', fontWeight: 700, color: '#E6EDF3', marginBottom: '4px' },
  confMeta: { color: '#8B949E', fontSize: '12px', marginBottom: '16px' },
  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #1C2128', fontSize: '13px' },
  label: { color: '#8B949E' },
  win: { color: '#23D18B', fontWeight: 600 },
  lose: { color: '#FF4B4B', fontWeight: 600 },
  neutral: { color: '#E6EDF3', fontWeight: 500 },
  badge: (s) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
    background: s === 'Ongoing' ? 'rgba(255,75,75,0.15)' : s === 'Resolved' ? 'rgba(35,209,139,0.15)' : 'rgba(240,165,0,0.15)',
    color: s === 'Ongoing' ? '#FF4B4B' : s === 'Resolved' ? '#23D18B' : '#F0A500',
  }),
}

const METRICS = [
  { key: 'Inflation_Rate_Percentage', label: 'Inflation Rate', fmt: formatPercent, higherIsBad: true },
  { key: 'GDP_Change_Percentage', label: 'GDP Change', fmt: formatPercent, higherIsBad: false },
  { key: 'During_War_Poverty_Rate_Percentage', label: 'Poverty Rate', fmt: formatPercent, higherIsBad: true },
  { key: 'Food_Insecurity_Rate_Percentage', label: 'Food Insecurity', fmt: formatPercent, higherIsBad: true },
  { key: 'During_War_Unemployment_Percentage', label: 'Unemployment', fmt: formatPercent, higherIsBad: true },
  { key: 'Currency_Devaluation_Percentage', label: 'Currency Devaluation', fmt: formatPercent, higherIsBad: true },
  { key: 'Cost_of_War_USD', label: 'Cost of War', fmt: formatCurrency, higherIsBad: true },
  { key: 'Estimated_Reconstruction_Cost_USD', label: 'Reconstruction Cost', fmt: formatCurrency, higherIsBad: true },
]

function winner(a, b, higherIsBad) {
  if (a == null && b == null) return 'tie'
  if (a == null) return 'b'
  if (b == null) return 'a'
  if (higherIsBad) return a < b ? 'a' : a > b ? 'b' : 'tie'
  return a > b ? 'a' : a < b ? 'b' : 'tie'
}

export default function ConflictCompare() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { list } = useSelector((s) => s.conflicts)

  const [c1Name, setC1Name] = useState(searchParams.get('c1') || '')
  const [c2Name, setC2Name] = useState(searchParams.get('c2') || '')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    dispatch(fetchConflicts({ limit: 200, sort: 'Conflict_Name' }))
  }, [dispatch])

  const handleCompare = async () => {
    if (!c1Name || !c2Name) return toast.error('Please select two conflicts to compare')
    if (c1Name === c2Name) return toast.error('Please select two different conflicts')
    setLoading(true)
    try {
      const data = await conflictService.compare(c1Name, c2Name)
      setResult(data)
    } catch (err) {
      toast.error('Comparison failed. Try different names.')
    } finally {
      setLoading(false)
    }
  }

  const conflict1 = result?.data?.conflict1 || result?.conflict1
  const conflict2 = result?.data?.conflict2 || result?.conflict2

  const radarData = conflict1 && conflict2
    ? METRICS.slice(0, 5).map((m) => ({
        metric: m.label.split(' ')[0],
        A: Math.abs(conflict1[m.key] || 0),
        B: Math.abs(conflict2[m.key] || 0),
      }))
    : []

  const conflictNames = list.map((c) => c.Conflict_Name).filter(Boolean)

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Compare Conflicts</title>
        <meta name="description" content="Side-by-side comparison of war economic impacts" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>⇄ Compare Conflicts</h1>
        <div style={S.sub}>Side-by-side economic impact comparison</div>

        <div style={S.row}>
          <div style={S.card}>
            <div style={{ color: '#8B949E', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Conflict A</div>
            <select value={c1Name} onChange={(e) => setC1Name(e.target.value)} style={S.select} id="compare-c1">
              <option value="">Select conflict...</option>
              {conflictNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <div style={S.vs}>VS</div>
          <div style={S.card}>
            <div style={{ color: '#8B949E', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>Conflict B</div>
            <select value={c2Name} onChange={(e) => setC2Name(e.target.value)} style={S.select} id="compare-c2">
              <option value="">Select conflict...</option>
              {conflictNames.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        <button onClick={handleCompare} disabled={loading} style={{ ...S.btn, opacity: loading ? 0.7 : 1 }} id="compare-btn">
          {loading ? '⟳ Comparing...' : '⇄ Compare Now'}
        </button>

        {conflict1 && conflict2 && (
          <>
            {/* Overview */}
            <div style={S.compGrid}>
              {[conflict1, conflict2].map((c, i) => (
                <div key={i} style={{ ...S.card, borderTop: `3px solid ${i === 0 ? '#E85D26' : '#4D9FFF'}` }}>
                  <div style={S.confTitle}>{c.Conflict_Name}</div>
                  <div style={S.confMeta}>
                    {c.Region} · {c.Conflict_Type} · {c.Start_Year}–{c.End_Year || 'Present'}
                    <span style={{ ...S.badge(c.Status), marginLeft: '8px' }}>{c.Status}</span>
                  </div>
                  {METRICS.map((m) => (
                    <div key={m.key} style={S.metricRow}>
                      <span style={S.label}>{m.label}</span>
                      <span style={{ color: '#E6EDF3', fontWeight: 500 }}>
                        {c[m.key] != null ? m.fmt(c[m.key]) : 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Winner row */}
            <div style={S.card}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#E6EDF3', marginBottom: '16px' }}>📊 Metric Comparison (lower = better for bad metrics)</div>
              {METRICS.map((m) => {
                const w = winner(conflict1[m.key], conflict2[m.key], m.higherIsBad)
                return (
                  <div key={m.key} style={{ ...S.metricRow, display: 'grid', gridTemplateColumns: '1fr 80px 1fr', gap: '8px' }}>
                    <span style={{ ...S.neutral, textAlign: 'right', color: w === 'a' ? '#23D18B' : w === 'b' ? '#FF4B4B' : '#8B949E' }}>
                      {conflict1[m.key] != null ? m.fmt(conflict1[m.key]) : 'N/A'}
                      {w === 'a' && <span style={{ marginLeft: '6px' }}>✓</span>}
                    </span>
                    <span style={{ textAlign: 'center', color: '#8B949E', fontSize: '11px' }}>{m.label}</span>
                    <span style={{ color: w === 'b' ? '#23D18B' : w === 'a' ? '#FF4B4B' : '#8B949E' }}>
                      {w === 'b' && <span style={{ marginRight: '6px' }}>✓</span>}
                      {conflict2[m.key] != null ? m.fmt(conflict2[m.key]) : 'N/A'}
                    </span>
                  </div>
                )
              })}
            </div>

            {/* Radar chart */}
            {radarData.length > 0 && (
              <div style={{ ...S.card, marginTop: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#E6EDF3', marginBottom: '16px' }}>📡 Radar Comparison</div>
                <ResponsiveContainer width="100%" height={280}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#30363D" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#8B949E', fontSize: 12 }} />
                    <Radar name={conflict1.Conflict_Name} dataKey="A" stroke="#E85D26" fill="#E85D26" fillOpacity={0.15} />
                    <Radar name={conflict2.Conflict_Name} dataKey="B" stroke="#4D9FFF" fill="#4D9FFF" fillOpacity={0.15} />
                    <Tooltip contentStyle={{ background: '#1C2128', border: '1px solid #30363D', borderRadius: '8px', color: '#E6EDF3', fontSize: '13px' }} />
                  </RadarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8B949E' }}>
                    <span style={{ width: '12px', height: '3px', background: '#E85D26', display: 'inline-block', borderRadius: '2px' }} />{conflict1.Conflict_Name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#8B949E' }}>
                    <span style={{ width: '12px', height: '3px', background: '#4D9FFF', display: 'inline-block', borderRadius: '2px' }} />{conflict2.Conflict_Name}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}
