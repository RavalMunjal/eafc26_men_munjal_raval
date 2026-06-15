import api from './api'

export const authService = {
  /**
   * POST /auth/login
   * Returns { success, token, user }
   */
  login: async (credentials) => {
    const res = await api.post('/auth/login', credentials)
    return res.data
  },

  /**
   * POST /auth/register
   * Returns { success, token, user }
   */
  register: async (userData) => {
    const res = await api.post('/auth/register', userData)
    return res.data
  },

  /**
   * POST /auth/logout
   */
  logout: async () => {
    const res = await api.post('/auth/logout')
    return res.data
  },

  /**
   * GET /auth/me
   * Returns logged-in user info
   */
  getMe: async () => {
    const res = await api.get('/auth/me')
    return res.data
  },

  /**
   * POST /auth/refresh-token
   */
  refreshToken: async () => {
    const res = await api.post('/auth/refresh-token')
    return res.data
  },
}
