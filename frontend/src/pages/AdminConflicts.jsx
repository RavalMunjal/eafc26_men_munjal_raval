import { useEffect, useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  fetchConflicts,
  createConflict,
  updateConflict,
  deleteConflict,
  setPage,
} from '../store/conflictsSlice'
import Layout from '../components/common/Layout'
import toast from 'react-hot-toast'
import { REGIONS, STATUSES, CONFLICT_TYPES, BLACK_MARKET_LEVELS } from '../utils/constants'
import { formatPercent, formatCurrency } from '../utils/formatters'

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
    fontFamily: "'Inter', sans-serif", width: '240px',
  },
  select: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 12px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", cursor: 'pointer',
  },
  btnPrimary: {
    background: 'linear-gradient(135deg,#E85D26,#F0A500)', color: '#fff', border: 'none',
    borderRadius: '8px', padding: '9px 20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '6px',
  },
  btnSecondary: {
    background: 'transparent', color: '#8B949E', border: '1px solid #30363D',
    borderRadius: '8px', padding: '8px 14px', fontSize: '13px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  btnDanger: {
    background: 'rgba(255,75,75,0.1)', color: '#FF4B4B', border: '1px solid rgba(255,75,75,0.3)',
    borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  btnEdit: {
    background: 'rgba(77,159,255,0.1)', color: '#4D9FFF', border: '1px solid rgba(77,159,255,0.3)',
    borderRadius: '6px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer',
    fontFamily: "'Inter', sans-serif",
  },
  tableWrap: { background: '#161B22', border: '1px solid #30363D', borderRadius: '12px', overflow: 'hidden' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { color: '#8B949E', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '12px 14px', textAlign: 'left', borderBottom: '1px solid #30363D', whiteSpace: 'nowrap' },
  td: { padding: '12px 14px', borderBottom: '1px solid #1C2128', fontSize: '13px', color: '#E6EDF3', verticalAlign: 'middle' },
  badge: (s) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: '100px', fontSize: '11px', fontWeight: 600,
    background: s === 'Ongoing' ? 'rgba(255,75,75,0.15)' : s === 'Resolved' ? 'rgba(35,209,139,0.15)' : 'rgba(240,165,0,0.15)',
    color: s === 'Ongoing' ? '#FF4B4B' : s === 'Resolved' ? '#23D18B' : '#F0A500',
  }),
  pagination: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', flexWrap: 'wrap', gap: '8px' },
  pageBtn: (active) => ({
    padding: '5px 11px', borderRadius: '6px',
    border: '1px solid ' + (active ? '#E85D26' : '#30363D'),
    background: active ? 'rgba(232,93,38,0.15)' : 'transparent',
    color: active ? '#E85D26' : '#8B949E', cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif",
  }),
  // Modal
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 100,
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
  },
  modal: {
    background: '#161B22', border: '1px solid #30363D', borderRadius: '16px',
    width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto',
    padding: '28px',
  },
  modalTitle: { fontSize: '18px', fontWeight: 700, color: '#E6EDF3', marginBottom: '20px' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  fieldFull: { display: 'flex', flexDirection: 'column', gap: '5px', gridColumn: '1 / -1' },
  flabel: { fontSize: '11px', fontWeight: 600, color: '#8B949E', textTransform: 'uppercase', letterSpacing: '0.06em' },
  finput: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 12px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box',
  },
  fselect: {
    background: '#0D1117', border: '1px solid #30363D', borderRadius: '8px',
    padding: '9px 12px', color: '#E6EDF3', fontSize: '13px', outline: 'none',
    fontFamily: "'Inter', sans-serif", width: '100%', boxSizing: 'border-box', cursor: 'pointer',
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', borderTop: '1px solid #30363D', paddingTop: '16px' },
}

// ─── Blank conflict template ──────────────────────────────────────────────────
const BLANK = {
  Conflict_Name: '', Conflict_Type: '', Region: '', Status: 'Ongoing',
  Start_Year: '', End_Year: '', Primary_Country: '',
  GDP_Change_Percentage: '', Inflation_Rate_Percentage: '', Currency_Devaluation_Percentage: '',
  Cost_of_War_USD: '', Estimated_Reconstruction_Cost_USD: '',
  Pre_War_Unemployment_Percentage: '', During_War_Unemployment_Percentage: '',
  Unemployment_Spike_Percentage_Points: '', Youth_Unemployment_Change_Percentage: '',
  Most_Affected_Sector: '',
  Pre_War_Poverty_Rate_Percentage: '', During_War_Poverty_Rate_Percentage: '',
  Extreme_Poverty_Rate_Percentage: '', Food_Insecurity_Rate_Percentage: '',
  Households_Fallen_Into_Poverty_Estimate: '',
  Informal_Economy_Size_Pre_War_Percentage: '', Informal_Economy_Size_During_War_Percentage: '',
  Black_Market_Activity_Level: 'Low', Primary_Black_Market_Goods: '',
  Currency_Black_Market_Rate_Gap_Percentage: '', War_Profiteering_Documented: 'No',
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const num = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v))

function formToPayload(f) {
  return {
    Conflict_Name: f.Conflict_Name,
    Conflict_Type: f.Conflict_Type,
    Region: f.Region,
    Status: f.Status,
    Start_Year: num(f.Start_Year),
    End_Year: f.End_Year === '' ? undefined : num(f.End_Year),
    Primary_Country: f.Primary_Country,
    GDP_Change_Percentage: num(f.GDP_Change_Percentage),
    Inflation_Rate_Percentage: num(f.Inflation_Rate_Percentage),
    Currency_Devaluation_Percentage: num(f.Currency_Devaluation_Percentage),
    Cost_of_War_USD: num(f.Cost_of_War_USD),
    Estimated_Reconstruction_Cost_USD: num(f.Estimated_Reconstruction_Cost_USD),
    Pre_War_Unemployment_Percentage: num(f.Pre_War_Unemployment_Percentage),
    During_War_Unemployment_Percentage: num(f.During_War_Unemployment_Percentage),
    Unemployment_Spike_Percentage_Points: num(f.Unemployment_Spike_Percentage_Points),
    Youth_Unemployment_Change_Percentage: num(f.Youth_Unemployment_Change_Percentage),
    Most_Affected_Sector: f.Most_Affected_Sector,
    Pre_War_Poverty_Rate_Percentage: num(f.Pre_War_Poverty_Rate_Percentage),
    During_War_Poverty_Rate_Percentage: num(f.During_War_Poverty_Rate_Percentage),
    Extreme_Poverty_Rate_Percentage: num(f.Extreme_Poverty_Rate_Percentage),
    Food_Insecurity_Rate_Percentage: num(f.Food_Insecurity_Rate_Percentage),
    Households_Fallen_Into_Poverty_Estimate: num(f.Households_Fallen_Into_Poverty_Estimate),
    Informal_Economy_Size_Pre_War_Percentage: num(f.Informal_Economy_Size_Pre_War_Percentage),
    Informal_Economy_Size_During_War_Percentage: num(f.Informal_Economy_Size_During_War_Percentage),
    Black_Market_Activity_Level: f.Black_Market_Activity_Level,
    Primary_Black_Market_Goods: f.Primary_Black_Market_Goods,
    Currency_Black_Market_Rate_Gap_Percentage: num(f.Currency_Black_Market_Rate_Gap_Percentage),
    War_Profiteering_Documented: f.War_Profiteering_Documented,
  }
}

// ─── Conflict Form Modal ──────────────────────────────────────────────────────
function ConflictModal({ conflict, onClose, onSaved }) {
  const dispatch = useDispatch()
  const isEdit = !!conflict?._id
  const [form, setForm] = useState(() => {
    if (isEdit) {
      const f = { ...BLANK }
      Object.keys(BLANK).forEach((k) => { if (conflict[k] !== undefined) f[k] = conflict[k] ?? '' })
      return f
    }
    return { ...BLANK }
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.Conflict_Name.trim()) return toast.error('Conflict Name is required')
    if (!form.Region) return toast.error('Region is required')
    if (!form.Start_Year) return toast.error('Start Year is required')
    setSaving(true)
    try {
      const payload = formToPayload(form)
      if (isEdit) {
        await dispatch(updateConflict({ id: conflict._id, data: payload })).unwrap()
        toast.success('Conflict updated!')
      } else {
        await dispatch(createConflict(payload)).unwrap()
        toast.success('Conflict created!')
      }
      onSaved()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const Field = ({ label, name, type = 'text', placeholder }) => (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={set(name)}
        placeholder={placeholder}
        style={S.finput}
      />
    </div>
  )

  const SelectField = ({ label, name, options }) => (
    <div style={S.field}>
      <label style={S.flabel}>{label}</label>
      <select value={form[name]} onChange={set(name)} style={S.fselect}>
        <option value="">— Select —</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.modal}>
        <div style={S.modalTitle}>{isEdit ? '✏️ Edit Conflict' : '➕ Add New Conflict'}</div>
        <form onSubmit={handleSubmit}>

          {/* Basic Info */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#E85D26', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '10px' }}>Basic Information</div>
          <div style={S.formGrid}>
            <div style={S.fieldFull}>
              <label style={S.flabel}>Conflict Name *</label>
              <input value={form.Conflict_Name} onChange={set('Conflict_Name')} style={S.finput} placeholder="e.g. Russia-Ukraine War" />
            </div>
            <SelectField label="Conflict Type" name="Conflict_Type" options={CONFLICT_TYPES} />
            <SelectField label="Region *" name="Region" options={REGIONS} />
            <SelectField label="Status" name="Status" options={STATUSES} />
            <Field label="Primary Country" name="Primary_Country" placeholder="e.g. Ukraine" />
            <Field label="Start Year *" name="Start_Year" type="number" placeholder="e.g. 2022" />
            <Field label="End Year (blank = ongoing)" name="End_Year" type="number" placeholder="e.g. 2024" />
          </div>

          {/* Economic */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#F0A500', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 10px' }}>Economic Indicators</div>
          <div style={S.formGrid}>
            <Field label="GDP Change %" name="GDP_Change_Percentage" type="number" placeholder="-15.79" />
            <Field label="Inflation Rate %" name="Inflation_Rate_Percentage" type="number" placeholder="41.72" />
            <Field label="Currency Devaluation %" name="Currency_Devaluation_Percentage" type="number" placeholder="77.17" />
            <Field label="Cost of War (USD)" name="Cost_of_War_USD" type="number" placeholder="129571916155" />
            <Field label="Reconstruction Cost (USD)" name="Estimated_Reconstruction_Cost_USD" type="number" placeholder="198788464791" />
          </div>

          {/* Unemployment */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#4D9FFF', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 10px' }}>Unemployment</div>
          <div style={S.formGrid}>
            <Field label="Pre-War Unemployment %" name="Pre_War_Unemployment_Percentage" type="number" />
            <Field label="During-War Unemployment %" name="During_War_Unemployment_Percentage" type="number" />
            <Field label="Unemployment Spike (pp)" name="Unemployment_Spike_Percentage_Points" type="number" />
            <Field label="Youth Unemployment Change %" name="Youth_Unemployment_Change_Percentage" type="number" />
            <Field label="Most Affected Sector" name="Most_Affected_Sector" placeholder="e.g. Construction" />
          </div>

          {/* Poverty */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#FF4B4B', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 10px' }}>Poverty & Social</div>
          <div style={S.formGrid}>
            <Field label="Pre-War Poverty Rate %" name="Pre_War_Poverty_Rate_Percentage" type="number" />
            <Field label="During-War Poverty Rate %" name="During_War_Poverty_Rate_Percentage" type="number" />
            <Field label="Extreme Poverty Rate %" name="Extreme_Poverty_Rate_Percentage" type="number" />
            <Field label="Food Insecurity Rate %" name="Food_Insecurity_Rate_Percentage" type="number" />
            <Field label="Households Fallen into Poverty" name="Households_Fallen_Into_Poverty_Estimate" type="number" />
          </div>

          {/* Black Market */}
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#A371F7', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '16px 0 10px' }}>Black Market & Informal Economy</div>
          <div style={S.formGrid}>
            <SelectField label="Black Market Activity Level" name="Black_Market_Activity_Level" options={BLACK_MARKET_LEVELS} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <label style={S.flabel}>War Profiteering Documented</label>
              <select value={form.War_Profiteering_Documented} onChange={set('War_Profiteering_Documented')} style={S.fselect}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <Field label="Pre-War Informal Economy %" name="Informal_Economy_Size_Pre_War_Percentage" type="number" />
            <Field label="During-War Informal Economy %" name="Informal_Economy_Size_During_War_Percentage" type="number" />
            <Field label="Currency Black Market Rate Gap %" name="Currency_Black_Market_Rate_Gap_Percentage" type="number" />
            <div style={S.fieldFull}>
              <label style={S.flabel}>Primary Black Market Goods</label>
              <input value={form.Primary_Black_Market_Goods} onChange={set('Primary_Black_Market_Goods')} style={S.finput} placeholder="e.g. fuel, medicine, currency" />
            </div>
          </div>

          <div style={S.modalActions}>
            <button type="button" onClick={onClose} style={S.btnSecondary}>Cancel</button>
            <button type="submit" disabled={saving} style={{ ...S.btnPrimary, opacity: saving ? 0.7 : 1 }}>
              {saving ? '⟳ Saving...' : isEdit ? 'Save Changes' : 'Create Conflict'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────
function DeleteConfirm({ conflict, onClose, onDeleted }) {
  const dispatch = useDispatch()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await dispatch(deleteConflict(conflict._id)).unwrap()
      toast.success(`"${conflict.Conflict_Name}" deleted`)
      onDeleted()
    } catch (err) {
      toast.error(typeof err === 'string' ? err : 'Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{ ...S.modal, maxWidth: '440px' }}>
        <div style={{ fontSize: '36px', marginBottom: '12px', textAlign: 'center' }}>🗑️</div>
        <div style={{ fontSize: '17px', fontWeight: 700, color: '#E6EDF3', textAlign: 'center', marginBottom: '8px' }}>Delete Conflict?</div>
        <div style={{ color: '#8B949E', fontSize: '13px', textAlign: 'center', marginBottom: '24px' }}>
          This will soft-delete <span style={{ color: '#E6EDF3', fontWeight: 600 }}>"{conflict.Conflict_Name}"</span>. The record will be hidden from public views.
        </div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button onClick={onClose} style={S.btnSecondary}>Cancel</button>
          <button onClick={handleDelete} disabled={deleting} style={{ ...S.btnDanger, padding: '9px 20px', fontSize: '13px', opacity: deleting ? 0.7 : 1 }}>
            {deleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminConflicts() {
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const { list, loading, total, page, totalPages } = useSelector((s) => s.conflicts)

  const [keyword, setKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [regionFilter, setRegionFilter] = useState('')
  const [modal, setModal] = useState(null)   // null | { type: 'create' | 'edit' | 'delete', conflict? }

  const load = useCallback((pg = 1) => {
    dispatch(setPage(pg))
    dispatch(fetchConflicts({ page: pg, limit: 15, keyword, status: statusFilter, region: regionFilter, sort: '-createdAt' }))
  }, [dispatch, keyword, statusFilter, regionFilter])

  useEffect(() => {
    // Handle ?edit=id from ConflictDetail quick-link
    const editId = searchParams.get('edit')
    if (editId) {
      const found = list.find((c) => c._id === editId)
      if (found) setModal({ type: 'edit', conflict: found })
    }
  }, [searchParams, list])

  useEffect(() => { load(1) }, [statusFilter, regionFilter])

  const handleSearch = (e) => { e.preventDefault(); load(1) }
  const pages = () => {
    const arr = [], s = Math.max(1, page - 2), e = Math.min(totalPages, page + 2)
    for (let i = s; i <= e; i++) arr.push(i)
    return arr
  }

  return (
    <Layout>
      <Helmet>
        <title>ConflictLens — Manage Conflicts</title>
        <meta name="description" content="Admin: create, edit and delete conflict records" />
      </Helmet>
      <div style={S.page}>
        <h1 style={S.title}>✏️ Manage Conflicts</h1>
        <div style={S.sub}>Create, edit and delete conflict records · {total} total records</div>

        {/* Top bar */}
        <div style={S.topBar}>
          <form onSubmit={handleSearch} style={S.searchRow}>
            <input
              id="admin-conflict-search"
              placeholder="🔍 Search by name..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={S.input}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={S.select} id="admin-status-filter">
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={S.select} id="admin-region-filter">
              <option value="">All Regions</option>
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" style={S.btnSecondary} id="admin-conflict-search-btn">Search</button>
          </form>
          <button style={S.btnPrimary} onClick={() => setModal({ type: 'create' })} id="add-conflict-btn">
            <span>+</span> Add Conflict
          </button>
        </div>

        {/* Table */}
        <div style={S.tableWrap}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8B949E' }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>⟳</div>
              Loading...
            </div>
          ) : list.length === 0 ? (
            <div style={{ padding: '60px', textAlign: 'center', color: '#8B949E', fontSize: '14px' }}>
              No conflicts found.{' '}
              <span style={{ color: '#E85D26', cursor: 'pointer' }} onClick={() => setModal({ type: 'create' })}>Add one?</span>
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
                    <th style={S.th}>GDP Δ</th>
                    <th style={S.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((c) => (
                    <tr
                      key={c._id}
                      onMouseEnter={(e) => (e.currentTarget.style.background = '#1C2128')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                      style={{ transition: 'background 0.15s' }}
                    >
                      <td style={S.td}>
                        <div style={{ fontWeight: 600, maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.Conflict_Name}</div>
                        <div style={{ fontSize: '11px', color: '#8B949E' }}>{c.Primary_Country}</div>
                      </td>
                      <td style={{ ...S.td, color: '#8B949E' }}>{c.Region}</td>
                      <td style={{ ...S.td, color: '#8B949E', fontSize: '12px' }}>{c.Conflict_Type}</td>
                      <td style={{ ...S.td, color: '#8B949E', fontSize: '12px' }}>{c.Start_Year}{c.End_Year ? `–${c.End_Year}` : '–Now'}</td>
                      <td style={S.td}><span style={S.badge(c.Status)}>{c.Status}</span></td>
                      <td style={{ ...S.td, color: c.Inflation_Rate_Percentage > 50 ? '#FF4B4B' : c.Inflation_Rate_Percentage > 20 ? '#F0A500' : '#23D18B' }}>
                        {formatPercent(c.Inflation_Rate_Percentage)}
                      </td>
                      <td style={{ ...S.td, color: c.GDP_Change_Percentage < -30 ? '#FF4B4B' : c.GDP_Change_Percentage < 0 ? '#F0A500' : '#23D18B' }}>
                        {formatPercent(c.GDP_Change_Percentage)}
                      </td>
                      <td style={S.td}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={S.btnEdit} onClick={() => setModal({ type: 'edit', conflict: c })}>Edit</button>
                          <button style={S.btnDanger} onClick={() => setModal({ type: 'delete', conflict: c })}>Delete</button>
                        </div>
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
            <span style={{ color: '#8B949E', fontSize: '13px' }}>Page {page} of {totalPages} · {total} records</span>
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

      {/* Modals */}
      {modal?.type === 'create' && (
        <ConflictModal
          conflict={null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(1) }}
        />
      )}
      {modal?.type === 'edit' && (
        <ConflictModal
          conflict={modal.conflict}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(page) }}
        />
      )}
      {modal?.type === 'delete' && (
        <DeleteConfirm
          conflict={modal.conflict}
          onClose={() => setModal(null)}
          onDeleted={() => { setModal(null); load(page) }}
        />
      )}
    </Layout>
  )
}
