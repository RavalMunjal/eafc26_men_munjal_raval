import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// ─── Async Thunks ───────────────────────────────────────────────────────────

export const fetchConflicts = createAsyncThunk(
  'conflicts/fetchAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { conflictService } = await import('../services/conflictService')
      const data = await conflictService.getAll(params)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch conflicts')
    }
  }
)

export const fetchConflictById = createAsyncThunk(
  'conflicts/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const { conflictService } = await import('../services/conflictService')
      const data = await conflictService.getById(id)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Conflict not found')
    }
  }
)

export const createConflict = createAsyncThunk(
  'conflicts/create',
  async (conflictData, { rejectWithValue }) => {
    try {
      const { conflictService } = await import('../services/conflictService')
      const data = await conflictService.create(conflictData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create conflict')
    }
  }
)

export const updateConflict = createAsyncThunk(
  'conflicts/update',
  async ({ id, data: conflictData }, { rejectWithValue }) => {
    try {
      const { conflictService } = await import('../services/conflictService')
      const data = await conflictService.update(id, conflictData)
      return data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update conflict')
    }
  }
)

export const deleteConflict = createAsyncThunk(
  'conflicts/delete',
  async (id, { rejectWithValue }) => {
    try {
      const { conflictService } = await import('../services/conflictService')
      await conflictService.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete conflict')
    }
  }
)

// ─── Initial State ───────────────────────────────────────────────────────────

const initialState = {
  list: [],
  selected: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 1,
  filters: {
    status: '',
    region: '',
    type: '',
    keyword: '',
    minInflation: '',
    maxInflation: '',
    minGDP: '',
    maxGDP: '',
    blackMarket: '',
    profiteering: '',
  },
  sort: '',
  loading: false,
  detailLoading: false,
  error: null,
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const conflictsSlice = createSlice({
  name: 'conflicts',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.page = action.payload
    },
    setLimit: (state, action) => {
      state.limit = action.payload
    },
    setSort: (state, action) => {
      state.sort = action.payload
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload }
      state.page = 1 // reset to first page on filter change
    },
    clearFilters: (state) => {
      state.filters = initialState.filters
      state.page = 1
    },
    clearSelected: (state) => {
      state.selected = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    // Fetch All
    builder
      .addCase(fetchConflicts.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchConflicts.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.data || []
        state.total = action.payload.pagination?.total || 0
        state.page = action.payload.pagination?.page || 1
        state.totalPages = action.payload.pagination?.totalPages || 1
      })
      .addCase(fetchConflicts.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Fetch by ID
    builder
      .addCase(fetchConflictById.pending, (state) => {
        state.detailLoading = true
        state.error = null
      })
      .addCase(fetchConflictById.fulfilled, (state, action) => {
        state.detailLoading = false
        state.selected = action.payload.data || action.payload
      })
      .addCase(fetchConflictById.rejected, (state, action) => {
        state.detailLoading = false
        state.error = action.payload
      })

    // Create
    builder
      .addCase(createConflict.pending, (state) => {
        state.loading = true
      })
      .addCase(createConflict.fulfilled, (state, action) => {
        state.loading = false
        const newConflict = action.payload.data || action.payload
        state.list.unshift(newConflict)
        state.total += 1
      })
      .addCase(createConflict.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Update
    builder
      .addCase(updateConflict.pending, (state) => {
        state.loading = true
      })
      .addCase(updateConflict.fulfilled, (state, action) => {
        state.loading = false
        const updated = action.payload.data || action.payload
        const idx = state.list.findIndex((c) => c._id === updated._id)
        if (idx !== -1) state.list[idx] = updated
        if (state.selected?._id === updated._id) state.selected = updated
      })
      .addCase(updateConflict.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    // Delete
    builder
      .addCase(deleteConflict.pending, (state) => {
        state.loading = true
      })
      .addCase(deleteConflict.fulfilled, (state, action) => {
        state.loading = false
        state.list = state.list.filter((c) => c._id !== action.payload)
        state.total -= 1
      })
      .addCase(deleteConflict.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  },
})

export const { setPage, setLimit, setSort, setFilters, clearFilters, clearSelected, clearError } =
  conflictsSlice.actions
export default conflictsSlice.reducer
