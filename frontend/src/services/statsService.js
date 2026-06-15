import api from './api'

export const statsService = {
  /**
   * GET /stats/total-conflicts → { total, ongoing, resolved }
   */
  getTotals: async () => {
    const [total, ongoing, resolved] = await Promise.all([
      api.get('/stats/total-conflicts'),
      api.get('/stats/ongoing-conflicts'),
      api.get('/stats/resolved-conflicts'),
    ])
    return {
      data: {
        total: total.data?.data?.count ?? total.data?.count ?? 0,
        ongoing: ongoing.data?.data?.count ?? ongoing.data?.count ?? 0,
        resolved: resolved.data?.data?.count ?? resolved.data?.count ?? 0,
      },
    }
  },

  /**
   * GET /stats/highest-inflation
   */
  getHighestInflation: async () => {
    const res = await api.get('/stats/highest-inflation')
    return res.data
  },

  /**
   * GET /stats/lowest-gdp
   */
  getLowestGDP: async () => {
    const res = await api.get('/stats/lowest-gdp')
    return res.data
  },

  /**
   * GET /stats/highest-poverty
   */
  getHighestPoverty: async () => {
    const res = await api.get('/stats/highest-poverty')
    return res.data
  },

  /**
   * GET /stats/highest-food-insecurity
   */
  getHighestFoodInsecurity: async () => {
    const res = await api.get('/stats/highest-food-insecurity')
    return res.data
  },

  /**
   * GET /stats/highest-war-cost
   */
  getHighestWarCost: async () => {
    const res = await api.get('/stats/highest-war-cost')
    return res.data
  },

  /**
   * GET /stats/highest-reconstruction-cost
   */
  getHighestReconstructionCost: async () => {
    const res = await api.get('/stats/highest-reconstruction-cost')
    return res.data
  },

  /**
   * GET /stats/region-summary
   */
  getRegionSummary: async () => {
    const res = await api.get('/stats/region-summary')
    return res.data
  },

  /**
   * GET /stats/conflict-type-summary
   */
  getTypeSummary: async () => {
    const res = await api.get('/stats/conflict-type-summary')
    return res.data
  },

  /**
   * GET /stats/inflation-by-region
   */
  getInflationByRegion: async () => {
    const res = await api.get('/stats/inflation-by-region')
    return res.data
  },

  /**
   * GET /stats/top-gdp-loss
   */
  getTopGDPLoss: async () => {
    const res = await api.get('/stats/top-gdp-loss')
    return res.data
  },

  /**
   * GET /stats/black-market-summary
   */
  getBlackMarketSummary: async () => {
    const res = await api.get('/stats/black-market-summary')
    return res.data
  },

  /**
   * GET /stats/economic-overview
   */
  getEconomicOverview: async () => {
    const res = await api.get('/stats/economic-overview')
    return res.data
  },

  /**
   * GET /stats/highest-currency-gap
   */
  getHighestCurrencyGap: async () => {
    const res = await api.get('/stats/highest-currency-gap')
    return res.data
  },
}
