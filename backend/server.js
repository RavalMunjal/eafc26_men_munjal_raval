require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const connectDB          = require('./config/db');
const corsOptions        = require('./config/corsConfig');
const { generalLimiter } = require('./config/rateLimit');
const errorMiddleware    = require('./middlewares/errorMiddleware');
const loggerMiddleware   = require('./middlewares/loggerMiddleware');
const notFoundMiddleware = require('./middlewares/notFoundMiddleware');

// Route imports
const authRoutes     = require('./routes/authRoutes');
const conflictRoutes = require('./routes/conflictRoutes');
const statsRoutes    = require('./routes/statsRoutes');
const adminRoutes    = require('./routes/adminRoutes');
const userRoutes     = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security & Parsing Middlewares ───────────────────────────────────────────
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Request Logger ────────────────────────────────────────────────────────────
app.use(loggerMiddleware);

// ─── Global Rate Limiter ───────────────────────────────────────────────────────
app.use(generalLimiter);

// ─── Health & Version Routes ───────────────────────────────────────────────────
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'War Economic Impact API is healthy',
    uptime: `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/version', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API version info',
    data: {
      version: '1.0.0',
      name: 'War Economic Impact API',
      environment: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
});

// ─── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth',      authRoutes);
app.use('/api/v1/conflicts', conflictRoutes);
app.use('/api/v1/stats',     statsRoutes);
app.use('/api/v1/admin',     adminRoutes);
app.use('/api/v1/users',     userRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────────
app.use('*', notFoundMiddleware);

// ─── Global Error Middleware ───────────────────────────────────────────────────
app.use(errorMiddleware);

// ─── Start Server ──────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on PORT ${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔐 JWT Auth: Enabled`);
    console.log(`⚡ Rate Limiting: Enabled`);
  });
};

startServer();
