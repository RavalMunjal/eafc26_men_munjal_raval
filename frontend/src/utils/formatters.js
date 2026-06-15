// Number formatters
export const formatCurrency = (value) => {
  if (!value && value !== 0) return 'N/A'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toLocaleString()}`
}

export const formatPercent = (value, decimals = 2) => {
  if (!value && value !== 0) return 'N/A'
  return `${Number(value).toFixed(decimals)}%`
}

export const formatNumber = (value) => {
  if (!value && value !== 0) return 'N/A'
  return Number(value).toLocaleString()
}

export const formatYear = (value) => {
  if (!value) return 'Present'
  return String(value)
}

// Status color mapping
export const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'ongoing': return 'danger'
    case 'resolved': return 'success'
    case 'escalating': return 'amber'
    default: return 'info'
  }
}

// Severity color for stat cards top border
export const getSeverityColor = (value, type = 'inflation') => {
  if (type === 'inflation') {
    if (value > 50) return '#FF4B4B'
    if (value > 20) return '#F0A500'
    return '#23D18B'
  }
  if (type === 'gdp') {
    if (value < -30) return '#FF4B4B'
    if (value < -10) return '#F0A500'
    return '#23D18B'
  }
  return '#4D9FFF'
}

// Truncate long text
export const truncate = (str, length = 30) => {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}
