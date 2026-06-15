import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import conflictsReducer from './conflictsSlice'
import statsReducer from './statsSlice'
import uiReducer from './uiSlice'

const store = configureStore({
  reducer: {
    auth: authReducer,
    conflicts: conflictsReducer,
    stats: statsReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
})

export default store
