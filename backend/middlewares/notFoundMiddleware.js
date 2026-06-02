// ─── 404 Not Found Middleware ──────────────────────────────────────────────────
// Handles all requests that don't match any registered route
// Must be placed AFTER all route registrations in server.js

const notFoundMiddleware = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.originalUrl}' not found`,
    hint: 'Please check the API documentation for available endpoints',
    availableRoutes: [
      'GET  /api/v1/health',
      'GET  /api/v1/version',
      'POST /api/v1/auth/register',
      'POST /api/v1/auth/login',
      'GET  /api/v1/auth/me',
      'GET  /api/v1/conflicts',
      'GET  /api/v1/conflicts/:id',
      'POST /api/v1/conflicts',
      'PUT  /api/v1/conflicts/:id',
      'DELETE /api/v1/conflicts/:id',
      'GET  /api/v1/stats/overview',
      'GET  /api/v1/stats/by-region',
      'GET  /api/v1/stats/by-year',
      'GET  /api/v1/users/profile',
      'PUT  /api/v1/users/profile',
      'PUT  /api/v1/users/change-password',
      'GET  /api/v1/admin/users',
    ],
    timestamp: new Date().toISOString(),
  });
};

module.exports = notFoundMiddleware;
