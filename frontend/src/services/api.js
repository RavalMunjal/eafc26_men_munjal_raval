import axios from 'axios'
import toast from 'react-hot-toast'
import { TOKEN_KEY } from '../utils/constants'

// ─── Axios Instance ──────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ─── Request Interceptor — attach JWT ────────────────────────────────────────

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ─── Response Interceptor — handle errors globally ───────────────────────────

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      // Network error / server unreachable
      toast.error('⚠️ Server unreachable. Check your connection.', {
        id: 'network-error',
        duration: 4000,
      })
      return Promise.reject(error)
    }

    const { status } = error.response

    if (status === 401) {
      // Unauthorized — clear token and redirect to login
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('cl_user')
      toast.error('Session expired. Please login again.', { id: 'auth-error' })
      window.location.href = '/login'
    } else if (status === 403) {
      toast.error('Access denied. Admin privileges required.', { id: 'forbidden' })
    } else if (status === 429) {
      toast.error('Too many requests. Please slow down.', { id: 'rate-limit' })
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.', { id: 'server-error' })
    }

    return Promise.reject(error)
  }
)

export default api
