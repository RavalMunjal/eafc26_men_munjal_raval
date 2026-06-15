import { createSlice } from '@reduxjs/toolkit'
import { THEME_KEY } from '../utils/constants'

const storedTheme = localStorage.getItem(THEME_KEY) || 'dark'

const initialState = {
  theme: storedTheme,           // 'dark' | 'light'
  sidebarOpen: true,            // desktop sidebar open/closed
  mobileSidebarOpen: false,     // mobile sidebar drawer
  globalLoading: false,
  toastQueue: [],
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
      localStorage.setItem(THEME_KEY, state.theme)
    },
    setTheme: (state, action) => {
      state.theme = action.payload
      localStorage.setItem(THEME_KEY, action.payload)
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    toggleMobileSidebar: (state) => {
      state.mobileSidebarOpen = !state.mobileSidebarOpen
    },
    setMobileSidebarOpen: (state, action) => {
      state.mobileSidebarOpen = action.payload
    },
    setGlobalLoading: (state, action) => {
      state.globalLoading = action.payload
    },
    addToast: (state, action) => {
      state.toastQueue.push(action.payload)
    },
    clearToast: (state) => {
      state.toastQueue = []
    },
  },
})

export const {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleMobileSidebar,
  setMobileSidebarOpen,
  setGlobalLoading,
  addToast,
  clearToast,
} = uiSlice.actions

export default uiSlice.reducer
