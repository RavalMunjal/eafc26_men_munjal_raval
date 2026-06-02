// ─── Debug Logger Utility ──────────────────────────────────────────────────────
// Logs detailed info ONLY in development mode
// In production, logs are suppressed to keep output clean

const isDev = process.env.NODE_ENV === 'development';

// ── Color codes for terminal ───────────────────────────────────────────────────
const colors = {
  reset:   '\x1b[0m',
  cyan:    '\x1b[36m',
  yellow:  '\x1b[33m',
  green:   '\x1b[32m',
  red:     '\x1b[31m',
  magenta: '\x1b[35m',
  blue:    '\x1b[34m',
  grey:    '\x1b[90m',
};

const timestamp = () => `${colors.grey}[${new Date().toISOString()}]${colors.reset}`;

/**
 * Log general debug information (dev only)
 * @param {string} label
 * @param {any} data
 */
const debug = (label, data = '') => {
  if (!isDev) return;
  console.log(`${timestamp()} ${colors.cyan}[DEBUG]${colors.reset} ${label}`, data);
};

/**
 * Log info messages (dev only)
 * @param {string} message
 */
const info = (message) => {
  if (!isDev) return;
  console.log(`${timestamp()} ${colors.blue}[INFO]${colors.reset}  ${message}`);
};

/**
 * Log warning messages (dev only)
 * @param {string} message
 */
const warn = (message) => {
  if (!isDev) return;
  console.warn(`${timestamp()} ${colors.yellow}[WARN]${colors.reset}  ${message}`);
};

/**
 * Log error messages (always shown in all environments)
 * @param {string} message
 * @param {Error|string} error
 */
const error = (message, err = '') => {
  console.error(`${timestamp()} ${colors.red}[ERROR]${colors.reset} ${message}`, err);
};

/**
 * Log success / milestone messages (dev only)
 * @param {string} message
 */
const success = (message) => {
  if (!isDev) return;
  console.log(`${timestamp()} ${colors.green}[OK]${colors.reset}    ${message}`);
};

/**
 * Log DB query details (dev only) — useful for aggregation debugging
 * @param {string} collection
 * @param {object} query
 */
const dbQuery = (collection, query) => {
  if (!isDev) return;
  console.log(
    `${timestamp()} ${colors.magenta}[DB]${colors.reset}    ${collection}:`,
    JSON.stringify(query, null, 2)
  );
};

module.exports = { debug, info, warn, error, success, dbQuery };
