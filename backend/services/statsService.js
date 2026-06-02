const Conflict = require('../models/Conflict');

// ─── Stats Service Layer ───────────────────────────────────────────────────────
// All heavy aggregation pipelines live here
// Controllers stay thin by calling these service functions

// ── Full overview aggregation ──────────────────────────────────────────────────
const getOverviewStats = async () => {
  const result = await Conflict.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: null,
        totalConflicts:    { $sum: 1 },
        activeConflicts:   { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        resolvedConflicts: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } },
        frozenConflicts:   { $sum: { $cond: [{ $eq: ['$status', 'Frozen'] }, 1, 0] } },
        totalMilitary:     { $sum: '$casualties.military' },
        totalCivilian:     { $sum: '$casualties.civilian' },
        totalWounded:      { $sum: '$casualties.wounded' },
        totalMissing:      { $sum: '$casualties.missing' },
        totalGDPLoss:      { $sum: '$economicImpact.gdpLossBillionUSD' },
        totalDisplaced:    { $sum: '$economicImpact.displacedPeople' },
        totalAid:          { $sum: '$economicImpact.aidReceivedUSD' },
        totalInfra:        { $sum: '$economicImpact.infrastructureDamageUSD' },
      },
    },
    {
      $project: {
        _id: 0,
        totalConflicts: 1,
        activeConflicts: 1,
        resolvedConflicts: 1,
        frozenConflicts: 1,
        casualties: {
          military: '$totalMilitary',
          civilian: '$totalCivilian',
          wounded:  '$totalWounded',
          missing:  '$totalMissing',
          total: { $add: ['$totalMilitary', '$totalCivilian', '$totalWounded', '$totalMissing'] },
        },
        economicImpact: {
          totalGDPLossBillionUSD:       '$totalGDPLoss',
          totalDisplacedPeople:         '$totalDisplaced',
          totalAidReceivedUSD:          '$totalAid',
          totalInfrastructureDamageUSD: '$totalInfra',
        },
      },
    },
  ]);
  return result[0] || null;
};

// ── Conflicts grouped by region ────────────────────────────────────────────────
const getRegionStats = async () => {
  return await Conflict.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$region',
        count:          { $sum: 1 },
        activeCount:    { $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] } },
        totalGDPLoss:   { $sum: '$economicImpact.gdpLossBillionUSD' },
        totalDisplaced: { $sum: '$economicImpact.displacedPeople' },
        totalCasualties: {
          $sum: { $add: ['$casualties.military', '$casualties.civilian', '$casualties.wounded'] },
        },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        region: '$_id', _id: 0,
        count: 1, activeCount: 1,
        totalGDPLossBillionUSD: '$totalGDPLoss',
        totalDisplacedPeople: '$totalDisplaced',
        totalCasualties: 1,
      },
    },
  ]);
};

// ── Conflicts grouped by year ──────────────────────────────────────────────────
const getYearStats = async () => {
  return await Conflict.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: { $year: '$startDate' },
        count:        { $sum: 1 },
        totalGDPLoss: { $sum: '$economicImpact.gdpLossBillionUSD' },
        totalCasualties: {
          $sum: { $add: ['$casualties.military', '$casualties.civilian', '$casualties.wounded'] },
        },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        year: '$_id', _id: 0,
        count: 1,
        totalGDPLossBillionUSD: '$totalGDPLoss',
        totalCasualties: 1,
      },
    },
  ]);
};

// ── Conflicts grouped by type ──────────────────────────────────────────────────
const getTypeStats = async () => {
  return await Conflict.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$type',
        count:        { $sum: 1 },
        totalGDPLoss: { $sum: '$economicImpact.gdpLossBillionUSD' },
        avgDuration:  { $avg: '$durationDays' },
      },
    },
    { $sort: { count: -1 } },
    {
      $project: {
        type: '$_id', _id: 0,
        count: 1,
        totalGDPLossBillionUSD: '$totalGDPLoss',
        avgDurationDays: { $round: ['$avgDuration', 0] },
      },
    },
  ]);
};

// ── Top N conflicts by GDP loss ────────────────────────────────────────────────
const getTopConflictsByGDP = async (limit = 5) => {
  return await Conflict.find({ isDeleted: false })
    .sort({ 'economicImpact.gdpLossBillionUSD': -1 })
    .limit(limit)
    .select('name country region status economicImpact.gdpLossBillionUSD casualties');
};

module.exports = { getOverviewStats, getRegionStats, getYearStats, getTypeStats, getTopConflictsByGDP };
