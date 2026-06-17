// ─── CORS Configuration ────────────────────────────────────────────────────────
// Centralized CORS setup — imported in server.js

const allowedOrigins = [
  'http://localhost:3000',   // React dev server
  'http://localhost:5173',   // Vite dev server
  'http://localhost:5000',   // Backend itself (for testing)
  // Add your production frontend URL here when deploying:
  // 'https://your-frontend.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow all origins to fix Vercel connection issues
    return callback(null, true);
  },

  credentials: true,                          // Allow cookies / Authorization header
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page', 'X-Limit'], // expose pagination headers
  optionsSuccessStatus: 200,                  // Legacy browser support
  maxAge: 86400,                              // Cache preflight for 24 hours
};

module.exports = corsOptions;
