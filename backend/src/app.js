const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
require('dotenv').config();

const app = express();

// ─── Security Middleware ───────────────────────────────────────────
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false // allow frontend dev
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth routes
  message: { success: false, message: 'Too many authentication attempts. Please wait 15 minutes.' }
});

app.use('/api/', limiter);
app.use('/api/auth/login',          authLimiter);
app.use('/api/auth/register',       authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// ─── CORS ─────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ─── Body Parsers ─────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ─── Passport ─────────────────────────────────────────────────────
app.use(passport.initialize());
require('./config/passport')(passport);

// ─── Routes ───────────────────────────────────────────────────────
const authRoutes        = require('./routes/authRoutes');
const dashboardRoutes   = require('./routes/dashboardRoutes');
const dealRoutes        = require('./routes/dealRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const accountRoutes     = require('./routes/accountRoutes');
const alertRoutes       = require('./routes/alertRoutes');
const productRoutes     = require('./routes/productRoutes');
const customerRoutes    = require('./routes/customerRoutes');
const saleRoutes        = require('./routes/saleRoutes');
const adminRoutes       = require('./routes/adminRoutes');

app.use('/api/auth',        authRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/deals',       dealRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/accounts',    accountRoutes);
app.use('/api/alerts',      alertRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/customers',   customerRoutes);
app.use('/api/sales',       saleRoutes);
app.use('/api/admin',       adminRoutes);

// ─── Health Check ─────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date(), version: '2.0.0' });
});

// ─── 404 Handler ──────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
