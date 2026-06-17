import { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import { fetchConflictById, clearSelected } from '../store/conflictsSlice'
import Layout from '../components/common/Layout'
import { formatPercent, formatCurrency, formatNumber, formatYear } from '../utils/formatters'

const S = {
  page: { padding: '28px', minHeight: '100vh' },
  back: { color: '#8B949E', textDecoration: 'none', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '20px' },
  header: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '28px', marginBottom: '20px', position: 'relative', overflow: 'hidden' },
  headerGlow: { position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(232,93,38,0.08) 0%, transparent 70%)', pointerEvents: 'none' },
  conflictTitle: { fontSize: '28px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.03em', marginBottom: '8px' },
  metaRow: { display: 'flex', gap: '24px', flexWrap: 'wrap', color: '#8B949E', fontSize: '13px' },
  metaItem: { display: 'flex', alignItems: 'center', gap: '6px' },
  badge: (s) => ({
    display: 'inline-block', padding: '4px 14px', borderRadius: '100px', fontSize: '12px', fontWeight: 600,
    background: s === 'Ongoing' ? 'rgba(255,75,75,0.15)' : s === 'Resolved' ? 'rgba(35,209,139,0.15)' : 'rgba(240,165,0,0.15)',
    color: s === 'Ongoing' ? '#FF4B4B' : s === 'Resolved' ? '#23D18B' : '#F0A500',
    border: s === 'Ongoing' ? '1px solid rgba(255,75,75,0.3)' : s === 'Resolved' ? '1px solid rgba(35,209,139,0.3)' : '1px solid rgba(240,165,0,0.3)',
  }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' },
  section: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '20px' },
  sectionTitle: { fontSize: '13px', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid #30363D' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '8px 0', borderBottom: '1px solid #1C2128' },
  rowLabel: { color: '#8B949E', fontSize: '13px' },
  rowValue: { color: '#E6EDF3', fontSize: '13px', fontWeight: 500, textAlign: 'right', maxWidth: '60%' },
  stat: (color) => ({ color: color || '#E6EDF3', fontWeight: 600 }),
}

function InfoRow({ label, value, color }) {
  if (value === null || value === undefined || value === '' || value === 'N/A') return null
  return (
    <div style={S.row}>
      <span style={S.rowLabel}>{label}</span>
      <span style={{ ...S.rowValue, ...S.stat(color) }}>{value}</span>
    </div>
  )
}

export default function ConflictDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { selected: conflict, detailLoading, error } = useSelector((s) => s.conflicts)
  const { user } = useSelector((s) => s.auth)

  useEffect(() => {
    dispatch(fetchConflictById(id))
    return () => dispatch(clearSelected())
  }, [id, dispatch])

  if (detailLoading) {
    return (
      <Layout>
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#8B949E' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>⟳</div>
            <div>Loading conflict data...</div>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !conflict) {
    return (
      <Layout>
        <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center', color: '#8B949E' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>⚠️</div>
            <div style={{ fontSize: '18px', color: '#E6EDF3', marginBottom: '8px' }}>Conflict Not Found</div>
            <div style={{ marginBottom: '20px' }}>{error || 'The requested conflict does not exist.'}</div>
            <Link to="/conflicts" style={{ color: '#E85D26', textDecoration: 'none' }}>← Back to Conflicts</Link>
          </div>
        </div>
      </Layout>
    )
  }

  const c = conflict

  const inflationColor = !c.Inflation_Rate_Percentage ? undefined
    : c.Inflation_Rate_Percentage > 50 ? '#FF4B4B'
    : c.Inflation_Rate_Percentage > 20 ? '#F0A500' : '#23D18B'

  const gdpColor = !c.GDP_Change_Percentage ? undefined
    : c.GDP_Change_Percentage < -30 ? '#FF4B4B'
    : c.GDP_Change_Percentage < 0 ? '#F0A500' : '#23D18B'

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — {c.Conflict_Name || 'Conflict Detail'}</title>
        <meta name="description" content={`Economic impact analysis of ${c.Conflict_Name}`} />
      </Helmet>
      <div style={S.page}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
          <Link to="/conflicts" style={S.back}>← Back to Conflicts</Link>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link to={`/conflicts/compare?c1=${encodeURIComponent(c.Conflict_Name)}`}
              style={{ color: '#E85D26', textDecoration: 'none', fontSize: '13px', border: '1px solid rgba(232,93,38,0.3)', borderRadius: '8px', padding: '7px 14px', background: 'rgba(232,93,38,0.08)' }}>
              ⇄ Compare
            </Link>
            {user?.role === 'admin' && (
              <Link to={`/admin/conflicts?edit=${c._id}`}
                style={{ color: '#4D9FFF', textDecoration: 'none', fontSize: '13px', border: '1px solid rgba(77,159,255,0.3)', borderRadius: '8px', padding: '7px 14px', background: 'rgba(77,159,255,0.08)' }}>
                ✏️ Edit
              </Link>
            )}
          </div>
        </div>

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerGlow} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h1 style={S.conflictTitle}>{c.Conflict_Name}</h1>
              <div style={S.metaRow}>
                <div style={S.metaItem}>📍 {c.Primary_Country}</div>
                <div style={S.metaItem}>🌍 {c.Region}</div>
                <div style={S.metaItem}>⚔️ {c.Conflict_Type}</div>
                <div style={S.metaItem}>📅 {c.Start_Year}–{c.End_Year ? c.End_Year : 'Present'}</div>
              </div>
            </div>
            <span style={S.badge(c.Status)}>{c.Status}</span>
          </div>
        </div>

        {/* Data grid */}
        <div style={S.grid}>
          {/* Economic Impact */}
          <div style={S.section}>
            <div style={S.sectionTitle}>💰 Economic Impact</div>
            <InfoRow label="Inflation Rate" value={formatPercent(c.Inflation_Rate_Percentage)} color={inflationColor} />
            <InfoRow label="GDP Change" value={formatPercent(c.GDP_Change_Percentage)} color={gdpColor} />
            <InfoRow label="Cost of War" value={formatCurrency(c.Cost_of_War_USD)} color="#F0A500" />
            <InfoRow label="Reconstruction Cost" value={formatCurrency(c.Estimated_Reconstruction_Cost_USD)} />
            <InfoRow label="Currency Devaluation" value={formatPercent(c.Currency_Devaluation_Percentage)} />
            <InfoRow label="Currency Black Market Gap" value={formatPercent(c.Currency_Black_Market_Rate_Gap_Percentage)} />
          </div>

          {/* Poverty & Social */}
          <div style={S.section}>
            <div style={S.sectionTitle}>👥 Poverty & Social Impact</div>
            <InfoRow label="During-War Poverty Rate" value={formatPercent(c.During_War_Poverty_Rate_Percentage)} color="#FF4B4B" />
            <InfoRow label="Extreme Poverty Rate" value={formatPercent(c.Extreme_Poverty_Rate_Percentage)} color="#FF4B4B" />
            <InfoRow label="Food Insecurity" value={formatPercent(c.Food_Insecurity_Rate_Percentage)} color={c.Food_Insecurity_Rate_Percentage > 50 ? '#FF4B4B' : '#F0A500'} />
            <InfoRow label="Households in Poverty" value={formatNumber(c.Households_Fallen_Into_Poverty_Estimate)} />
            <InfoRow label="Pre-War Unemployment" value={formatPercent(c.Pre_War_Unemployment_Percentage)} />
            <InfoRow label="During-War Unemployment" value={formatPercent(c.During_War_Unemployment_Percentage)} />
          </div>

          {/* Black Market */}
          <div style={S.section}>
            <div style={S.sectionTitle}>🕳 Black Market & Profiteering</div>
            <InfoRow label="Black Market Activity" value={c.Black_Market_Activity_Level}
              color={c.Black_Market_Activity_Level === 'Extreme' || c.Black_Market_Activity_Level === 'Dominant' ? '#FF4B4B' : '#F0A500'} />
            <InfoRow label="War Profiteering" value={c.War_Profiteering_Documented}
              color={c.War_Profiteering_Documented === 'Yes' ? '#FF4B4B' : '#23D18B'} />
          </div>

          {/* Conflict Info */}
          <div style={S.section}>
            <div style={S.sectionTitle}>ℹ️ Conflict Details</div>
            <InfoRow label="Conflict Name" value={c.Conflict_Name} />
            <InfoRow label="Conflict Type" value={c.Conflict_Type} />
            <InfoRow label="Primary Country" value={c.Primary_Country} />
            <InfoRow label="Region" value={c.Region} />
            <InfoRow label="Start Year" value={c.Start_Year} />
            <InfoRow label="End Year" value={c.End_Year || 'Ongoing'} />
            <InfoRow label="Status" value={c.Status} />
          </div>
        </div>
      </div>
    </Layout>
  )
}
