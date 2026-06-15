import api from './api'

// ─── Helper: build query string from params object ───────────────────────────

const buildQuery = (params = {}) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== '' && val !== null && val !== undefined) {
      q.append(key, val)
    }
  })
  return q.toString() ? `?${q.toString()}` : ''
}

export const conflictService = {
  /**
   * GET /conflicts
   * Supports: page, limit, sort, keyword, status, region, type,
   *           minInflation, maxInflation, minGDP, maxGDP, blackMarket, profiteering
   */
  getAll: async (params = {}) => {
    const res = await api.get(`/conflicts${buildQuery(params)}`)
    return res.data
  },

  /**
   * GET /conflicts/:id
   */
  getById: async (id) => {
    const res = await api.get(`/conflicts/${id}`)
    return res.data
  },

  /**
   * POST /conflicts
   */
  create: async (data) => {
    const res = await api.post('/conflicts', data)
    return res.data
  },

  /**
   * PATCH /conflicts/:id
   */
  update: async (id, data) => {
    const res = await api.patch(`/conflicts/${id}`, data)
    return res.data
  },

  /**
   * DELETE /conflicts/:id
   */
  remove: async (id) => {
    const res = await api.delete(`/conflicts/${id}`)
    return res.data
  },

  // ── Special Endpoints ──────────────────────────────────────────────────────

  /**
   * GET /conflicts/trending (recent)
   */
  getTrending: async () => {
    const res = await api.get('/conflicts/recent')
    return res.data
  },

  /**
   * GET /conflicts/high-risk
   */
  getHighRisk: async () => {
    const res = await api.get('/conflicts/high-risk')
    return res.data
  },

  /**
   * GET /conflicts/ongoing
   */
  getOngoing: async () => {
    const res = await api.get('/conflicts/ongoing')
    return res.data
  },

  /**
   * GET /conflicts/resolved
   */
  getResolved: async () => {
    const res = await api.get('/conflicts/resolved')
    return res.data
  },

  /**
   * GET /conflicts/top/highest-inflation
   */
  getTopInflation: async () => {
    const res = await api.get('/conflicts/top/highest-inflation')
    return res.data
  },

  /**
   * GET /conflicts/top/highest-poverty
   */
  getTopPoverty: async () => {
    const res = await api.get('/conflicts/top/highest-poverty')
    return res.data
  },

  /**
   * GET /conflicts/economic-collapse
   */
  getEconomicCollapse: async () => {
    const res = await api.get('/conflicts/economic-collapse')
    return res.data
  },

  /**
   * GET /conflicts/random
   */
  getRandom: async () => {
    const res = await api.get('/conflicts/random')
    return res.data
  },

  /**
   * GET /conflicts/war/:name/summary
   */
  getWarSummary: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/summary`)
    return res.data
  },

  /**
   * GET /conflicts/war/:name/economic-impact
   */
  getEconomicImpact: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/economic-impact`)
    return res.data
  },

  /**
   * GET /conflicts/war/:name/poverty-impact
   */
  getPovertyImpact: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/poverty-impact`)
    return res.data
  },

  /**
   * GET /conflicts/war/:name/black-market
   */
  getBlackMarket: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/black-market`)
    return res.data
  },

  /**
   * GET /conflicts/war/:name/reconstruction
   */
  getReconstruction: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/reconstruction`)
    return res.data
  },

  /**
   * GET /conflicts/war/:name/currency-crisis
   */
  getCurrencyCrisis: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/currency-crisis`)
    return res.data
  },

  /**
   * GET /conflicts/war/:name/unemployment
   */
  getUnemployment: async (name) => {
    const res = await api.get(`/conflicts/war/${encodeURIComponent(name)}/unemployment`)
    return res.data
  },

  /**
   * GET /conflicts/compare?conflict1=X&conflict2=Y
   */
  compare: async (conflict1, conflict2) => {
    const res = await api.get(`/conflicts/compare?conflict1=${encodeURIComponent(conflict1)}&conflict2=${encodeURIComponent(conflict2)}`)
    return res.data
  },

  /**
   * GET /conflicts/region/:region
   */
  getByRegion: async (region) => {
    const res = await api.get(`/conflicts/region/${encodeURIComponent(region)}`)
    return res.data
  },

  /**
   * GET /conflicts/country/:country/history
   */
  getCountryHistory: async (country) => {
    const res = await api.get(`/conflicts/country/${encodeURIComponent(country)}/history`)
    return res.data
  },
}
