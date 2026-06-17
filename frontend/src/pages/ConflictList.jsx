import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { fetchConflicts, setPage, setFilters, clearFilters } from '../store/conflictsSlice'
import Layout from '../components/common/Layout'
import { REGIONS, STATUSES, CONFLICT_TYPES } from '../utils/constants'
import { formatPercent, formatCurrency } from '../utils/formatters'

const S = {
  page: { padding: '28px', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' },
  title: { fontSize: '24px', fontWeight: 700, color: '#E6EDF3', letterSpacing: '-0.02em' },
  subtitle: { color: '#8B949E', fontSize: '13px', marginTop: '4px' },
  filterCard: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', padding: '16px', marginBottom: '20px' },
  filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px', marginBottom: '12px' },
  input: {
    width: '100%', background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 12px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", boxSizing: 'border-box',
  },
  select: {
    width: '100%', background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 12px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", cursor: 'pointer', boxSizing: 'border-box',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg,#E85D26,#F0A500)', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  btnSecondary: {
    background: 'transparent', color: '#8B949E', border: '1px solid #30363D',
    borderRadius: '8px', padding: '9px 16px', fontSize: '13px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#8B949E', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 16px', textAlign: 'left', borderBottom: '1px solid #30363D' },
  td: { padding: '14px 16px', borderBottom: '1px solid #1C2128', fontSize: '14px', color: '#E6EDF3', verticalAlign: 'middle' },
  link: { color: '#E6EDF3', textDecoration: 'none', fontWeight: 500 },
  badge: (s) => ({
    display: 'inline-block', padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
    background: s === 'Ongoing' ? 'rgba(255,75,75,0.15)' : s === 'Resolved' ? 'rgba(35,209,139,0.15)' : 'rgba(240,165,0,0.15)',
    color: s === 'Ongoing' ? '#FF4B4B' : s === 'Resolved' ? '#23D18B' : '#F0A500',
  }),
  pagination: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', flexWrap: 'wrap', gap: '12px' },
  pageBtn: (active) => ({
    padding: '6px 12px', borderRadius: '6px', border: '1px solid ' + (active ? '#E85D26' : '#30363D'),
    background: active ? 'rgba(232,93,38,0.15)' : 'transparent',
    color: active ? '#E85D26' : '#8B949E', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif",
  }),
}

export default function ConflictList() {
  const dispatch = useDispatch()
  const { list, loading, total, page, totalPages, filters } = useSelector((s) => s.conflicts)

  const [localFilters, setLocalFilters] = useState({
    keyword: filters.keyword || '',
    status: filters.status || '',
    region: filters.region || '',
    type: filters.type || '',
  })

  const fetchData = (pg = 1) => {
    dispatch(setPage(pg))
    dispatch(fetchConflicts({
      page: pg, limit: 15,
      keyword: localFilters.keyword,
      status: localFilters.status,
      region: localFilters.region,
      type: localFilters.type,
      sort: '-Start_Year',
    }))
  }

  useEffect(() => { fetchData(1) }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchData(1)
  }

  const handleClear = () => {
    setLocalFilters({ keyword: '', status: '', region: '', type: '' })
    dispatch(clearFilters())
    dispatch(fetchConflicts({ page: 1, limit: 15, sort: '-Start_Year' }))
  }

  const handlePage = (p) => {
    if (p < 1 || p > totalPages) return
    fetchData(p)
  }

  const pages = () => {
    const arr = []
    const start = Math.max(1, page - 2)
    const end = Math.min(totalPages, page + 2)
    for (let i = start; i <= end; i++) arr.push(i)
    return arr
  }

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Conflicts</title>
        <meta name="description" content="Browse and filter all war economic impact conflicts" />
      </Helmet>
      <div style={S.page}>
        <div style={S.header}>
          <div>
            <h1 style={S.title}>Conflicts Database</h1>
            <div style={S.subtitle}>{total} records found</div>
          </div>
          <Link to="/conflicts/compare" style={{ ...S.btnPrimary, textDecoration: 'none', display: 'inline-block' }}>
            ⇄ Compare Conflicts
          </Link>
        </div>

        {/* Filters */}
        <div style={S.filterCard}>
          <form onSubmit={handleSearch}>
            <div style={S.filterGrid}>
              <input
                placeholder="🔍 Search conflicts..."
                value={localFilters.keyword}
                onChange={(e) => setLocalFilters((f) => ({ ...f, keyword: e.target.value }))}
                style={S.input}
                id="conflict-search"
              />
              <select
                value={localFilters.status}
                onChange={(e) => setLocalFilters((f) => ({ ...f, status: e.target.value }))}
                style={S.select}
                id="filter-status"
              >
                <option value="">All Statuses</option>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              <select
                value={localFilters.region}
                onChange={(e) => setLocalFilters((f) => ({ ...f, region: e.target.value }))}
                style={S.select}
                id="filter-region"
              >
                <option value="">All Regions</option>
                {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select
                value={localFilters.type}
                onChange={(e) => setLocalFilters((f) => ({ ...f, type: e.target.value }))}
                style={S.select}
                id="filter-type"
              >
                <option value="">All Types</option>
                {CONFLICT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" style={S.btnPrimary} id="apply-filters">Apply Filters</button>
              <button type="button" onClick={handleClear} style={S.btnSecondary}>Clear</button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div style={{ background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8B949E', fontSize: '14px' }}>
              <div style={{ marginBottom: '8px', fontSize: '24px' }}>⟳</div>
              Loading conflicts...
            </div>
          ) : list.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8B949E', fontSize: '14px' }}>
              No conflicts match your filters.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={S.th}>Conflict</th>
                    <th style={S.th}>Region</th>
                    <th style={S.th}>Type</th>
                    <th style={S.th}>Period</th>
                    <th style={S.th}>Status</th>
                    <th style={S.th}>Inflation</th>
                    <th style={S.th}>GDP Change</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr key={c._id} style={{ transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#1C2128'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={S.td}>
                        <div style={{ fontWeight: 600, color: '#E6EDF3', maxWidth: '200px' }}>{c.Conflict_Name}</div>
                        <div style={{ fontSize: '12px', color: '#8B949E', marginTop: '2px' }}>{c.Primary_Country}</div>
                      </td>
                      <td style={S.td}><span style={{ color: '#8B949E' }}>{c.Region}</span></td>
                      <td style={S.td}><span style={{ color: '#8B949E', fontSize: '12px' }}>{c.Conflict_Type}</span></td>
                      <td style={S.td}>
                        <span style={{ color: '#8B949E', fontSize: '13px' }}>
                          {c.Start_Year}{c.End_Year ? `–${c.End_Year}` : '–Present'}
                        </span>
                      </td>
                      <td style={S.td}><span style={S.badge(c.Status)}>{c.Status}</span></td>
                      <td style={S.td}>
                        <span style={{ color: c.Inflation_Rate_Percentage > 50 ? '#FF4B4B' : c.Inflation_Rate_Percentage > 20 ? '#F0A500' : '#23D18B' }}>
                          {formatPercent(c.Inflation_Rate_Percentage)}
                        </span>
                      </td>
                      <td style={S.td}>
                        <span style={{ color: c.GDP_Change_Percentage < -30 ? '#FF4B4B' : c.GDP_Change_Percentage < 0 ? '#F0A500' : '#23D18B' }}>
                          {formatPercent(c.GDP_Change_Percentage)}
                        </span>
                      </td>
                      <td style={S.td}>
                        <Link to={`/conflicts/${c._id}`} style={{ color: '#E85D26', textDecoration: 'none', fontSize: '13px', fontWeight: 500 }}>
                          View →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={S.pagination}>
            <span style={{ color: '#8B949E', fontSize: '13px' }}>
              Page {page} of {totalPages} · {total} records
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => handlePage(1)} disabled={page === 1} style={S.pageBtn(false)}>«</button>
              <button onClick={() => handlePage(page - 1)} disabled={page === 1} style={S.pageBtn(false)}>‹</button>
              {pages().map((p) => (
                <button key={p} onClick={() => handlePage(p)} style={S.pageBtn(p === page)}>{p}</button>
              ))}
              <button onClick={() => handlePage(page + 1)} disabled={page === totalPages} style={S.pageBtn(false)}>›</button>
              <button onClick={() => handlePage(totalPages)} disabled={page === totalPages} style={S.pageBtn(false)}>»</button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}
