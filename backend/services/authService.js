const User = require('../models/User');
const jwt = require('jsonwebtoken');

// ─── Auth Service Layer ────────────────────────────────────────────────────────
// Business logic for authentication — controllers stay thin by calling these

// ── Generate signed JWT token ──────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// ── Decode and verify a JWT token ─────────────────────────────────────────────
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

// ── Find user by email (with password included for auth checks) ───────────────
const findUserByEmail = async (email) => {
  return await User.findOne({ email, isDeleted: false }).select('+password');
};

// ── Find user by ID (safe — no password) ──────────────────────────────────────
const findUserById = async (id) => {
  return await User.findOne({ _id: id, isDeleted: false }).select('-password');
};

// ── Check if email is already registered ──────────────────────────────────────
const emailExists = async (email) => {
  const user = await User.findOne({ email });
  return !!user;
};

// ── Create new user in DB ──────────────────────────────────────────────────────
const createUser = async ({ name, email, password, role = 'user' }) => {
  return await User.create({ name, email, password, role });
};

// ── Update last login timestamp ────────────────────────────────────────────────
const updateLastLogin = async (userId) => {
  return await User.findByIdAndUpdate(
    userId,
    { lastLogin: new Date() },
    { new: true, validateBeforeSave: false }
  );
};

// ── Format user response (no password, only safe fields) ──────────────────────
const formatUserResponse = (user) => ({
  id:        user._id,
  name:      user.name,
  email:     user.email,
  role:      user.role,
  isActive:  user.isActive,
  lastLogin: user.lastLogin,
  createdAt: user.createdAt,
});

module.exports = {
  generateToken,
  verifyToken,
  findUserByEmail,
  findUserById,
  emailExists,
  createUser,
  updateLastLogin,
  formatUserResponse,
};
