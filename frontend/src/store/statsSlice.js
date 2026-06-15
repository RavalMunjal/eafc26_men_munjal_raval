import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const fetchAllStats = createAsyncThunk(
  'stats/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { statsService } = await import('../services/statsService')
      const [totals, highestInflation, lowestGDP, highestPoverty, regionSummary, typeSummary, economicOverview] =
        await Promise.all([
          statsService.getTotals(),
          statsService.getHighestInflation(),
          statsService.getLowestGDP(),
          statsService.getHighestPoverty(),
          statsService.getRegionSummary(),
          statsService.getTypeSummary(),
          statsService.getEconomicOverview(),
        ])
      return {
        totals,
        highestInflation,
        lowestGDP,
        highestPoverty,
        regionSummary,
        typeSummary,
        economicOverview,
      }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch stats')
    }
  }
)

export const fetchRegionSummary = createAsyncThunk(
  'stats/fetchRegionSummary',
  async (_, { rejectWithValue }) => {
    try {
      const { statsService } = await import('../services/statsService')
      return await statsService.getRegionSummary()
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch region summary')
    }
  }
)

export const fetchInflationByRegion = createAsyncThunk(
  'stats/fetchInflationByRegion',
  async (_, { rejectWithValue }) => {
    try {
      const { statsService } = await import('../services/statsService')
      return await statsService.getInflationByRegion()
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch inflation data')
    }
  }
)

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  totals: {
    total: 0,
    ongoing: 0,
    resolved: 0,
  },
  highestInflation: null,
  lowestGDP: null,
  highestPoverty: null,
  regionSummary: [],
  typeSummary: [],
  inflationByRegion: [],
  economicOverview: null,
  loading: false,
  error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const statsSlice = createSlice({
  name: 'stats',
  initialState,
  reducers: {
    clearStatsError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStats.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchAllStats.fulfilled, (state, action) => {
        state.loading = false
        const { totals, highestInflation, lowestGDP, highestPoverty, regionSummary, typeSummary, economicOverview } =
          action.payload
        // totals endpoint returns { total, ongoing, resolved }
        state.totals = {
          total: totals?.data?.total ?? totals?.total ?? 0,
          ongoing: totals?.data?.ongoing ?? totals?.ongoing ?? 0,
          resolved: totals?.data?.resolved ?? totals?.resolved ?? 0,
        }
        state.highestInflation = highestInflation?.data || highestInflation
        state.lowestGDP = lowestGDP?.data || lowestGDP
        state.highestPoverty = highestPoverty?.data || highestPoverty
        state.regionSummary = regionSummary?.data || regionSummary || []
        state.typeSummary = typeSummary?.data || typeSummary || []
        state.economicOverview = economicOverview?.data || economicOverview
      })
      .addCase(fetchAllStats.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(fetchRegionSummary.fulfilled, (state, action) => {
        state.regionSummary = action.payload?.data || action.payload || []
      })

    builder
      .addCase(fetchInflationByRegion.fulfilled, (state, action) => {
        state.inflationByRegion = action.payload?.data || action.payload || []
      })
  },
})

export const { clearStatsError } = statsSlice.actions
export default statsSlice.reducer
