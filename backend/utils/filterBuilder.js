// ─── Dynamic Filter Builder Utility ───────────────────────────────────────────
// Builds MongoDB-compatible filter objects from request query params
// Supports: exact match, regex search, range, boolean, $in operator

/**
 * Build a dynamic filter object from query params
 * @param {object} query       - req.query object
 * @param {object} fieldConfig - configuration per field
 *
 * Field config options per field:
 *   type: 'exact' | 'regex' | 'range' | 'boolean' | 'in'
 *   dbField: actual MongoDB field name (optional, defaults to key)
 *
 * Example usage:
 *   const filter = buildFilter(req.query, {
 *     status:  { type: 'exact' },
 *     region:  { type: 'regex' },
 *     country: { type: 'regex' },
 *     minGdp:  { type: 'range', dbField: 'economicImpact.gdpLossBillionUSD', direction: 'gte' },
 *     maxGdp:  { type: 'range', dbField: 'economicImpact.gdpLossBillionUSD', direction: 'lte' },
 *     tags:    { type: 'in' },
 *   });
 */
const buildFilter = (query, fieldConfig) => {
  const filter = { isDeleted: false };

  for (const [key, config] of Object.entries(fieldConfig)) {
    const value = query[key];
    if (value === undefined || value === '') continue;

    const dbField = config.dbField || key;

    switch (config.type) {
      // Exact match: status=Active
      case 'exact':
        filter[dbField] = value;
        break;

      // Case-insensitive regex search: region=middle
      case 'regex':
        filter[dbField] = { $regex: value, $options: 'i' };
        break;

      // Range: minGdp=100 → { $gte: 100 }
      case 'range':
        if (!filter[dbField]) filter[dbField] = {};
        filter[dbField][`$${config.direction || 'gte'}`] = Number(value);
        break;

      // Boolean: isActive=true
      case 'boolean':
        filter[dbField] = value === 'true';
        break;

      // $in array: tags=war,civil → { $in: ['war', 'civil'] }
      case 'in':
        filter[dbField] = { $in: value.split(',').map((v) => v.trim()) };
        break;

      // Text search (uses MongoDB text index)
      case 'text':
        filter.$text = { $search: value };
        break;

      default:
        filter[dbField] = value;
    }
  }

  return filter;
};

/**
 * Build sort object from query params
 * @param {string} sortBy  - field to sort by (default: createdAt)
 * @param {string} order   - 'asc' or 'desc' (default: desc)
 * @returns {object} MongoDB sort object
 */
const buildSort = (sortBy = 'createdAt', order = 'desc') => {
  return { [sortBy]: order === 'asc' ? 1 : -1 };
};

module.exports = { buildFilter, buildSort };
