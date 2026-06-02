// ─── App-wide Constants ────────────────────────────────────────────────────────
// Centralized place for all magic numbers, enums, and fixed values
// Import from here instead of hardcoding across files

// ── User Roles ─────────────────────────────────────────────────────────────────
const USER_ROLES = {
  USER:     'user',
  ANALYST:  'analyst',
  ADMIN:    'admin',
};

// ── Conflict Status ────────────────────────────────────────────────────────────
const CONFLICT_STATUS = {
  ACTIVE:      'Active',
  RESOLVED:    'Resolved',
  FROZEN:      'Frozen',
  ESCALATING:  'Escalating',
};

// ── Conflict Types ─────────────────────────────────────────────────────────────
const CONFLICT_TYPES = {
  CIVIL_WAR:       'Civil War',
  INTERSTATE_WAR:  'Interstate War',
  PROXY_WAR:       'Proxy War',
  INSURGENCY:      'Insurgency',
  TERRORISM:       'Terrorism',
  OTHER:           'Other',
};

// ── Pagination Defaults ────────────────────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     100,
};

// ── JWT Settings ───────────────────────────────────────────────────────────────
const JWT = {
  EXPIRE:         '7d',
  REFRESH_EXPIRE: '30d',
  BCRYPT_ROUNDS:  12,
};

// ── HTTP Status Codes ──────────────────────────────────────────────────────────
const HTTP_STATUS = {
  OK:                    200,
  CREATED:               201,
  NO_CONTENT:            204,
  BAD_REQUEST:           400,
  UNAUTHORIZED:          401,
  FORBIDDEN:             403,
  NOT_FOUND:             404,
  CONFLICT:              409,
  UNPROCESSABLE_ENTITY:  422,
  TOO_MANY_REQUESTS:     429,
  INTERNAL_SERVER_ERROR: 500,
};

// ── API Version ────────────────────────────────────────────────────────────────
const API = {
  VERSION:  'v1',
  BASE_URL: '/api/v1',
  NAME:     'War Economic Impact API',
};

// ── Regions ────────────────────────────────────────────────────────────────────
const REGIONS = [
  'Middle East',
  'Eastern Europe',
  'South Asia',
  'East Africa',
  'North Africa',
  'Southeast Asia',
  'West Africa',
  'Central Asia',
  'Latin America',
  'East Asia',
];

module.exports = {
  USER_ROLES,
  CONFLICT_STATUS,
  CONFLICT_TYPES,
  PAGINATION,
  JWT,
  HTTP_STATUS,
  API,
  REGIONS,
};
