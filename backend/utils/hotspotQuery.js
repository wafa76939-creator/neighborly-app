const Report = require('../models/Report');
const { HOTSPOT_THRESHOLD } = require('../utils/constants');

const daysAgo = (days) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

const categoryBreakdown = (categories) => {
  const counts = {};
  categories.forEach((category) => {
    counts[category] = (counts[category] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
};

const shapeLocation = (row) => {
  const breakdown = categoryBreakdown(row.categories || []);
  const top = breakdown[0];
  const prev = row.reportsPrev30Days || 0;
  const current = row.reportsLast30Days || 0;
  let trend = 0;
  if (prev === 0) trend = current > 0 ? 100 : 0;
  else trend = Math.round(((current - prev) / prev) * 100);

  return {
    address: row.address,
    normalizedAddress: row._id,
    lat: row.lat,
    lng: row.lng,
    totalReports: row.totalReports,
    reportsLast30Days: current,
    reportsPrev30Days: prev,
    confirmationCount: row.confirmationCount,
    lastActivity: row.lastActivity,
    categoryBreakdown: breakdown,
    topCategory: top?.category || null,
    topCategoryShare: row.totalReports
      ? Math.round(((top?.count || 0) / row.totalReports) * 100)
      : 0,
    isHotspot: current >= HOTSPOT_THRESHOLD,
    hotspotThreshold: HOTSPOT_THRESHOLD,
    trend,
    changeVsPrevious: current - prev,
  };
};

const aggregateLocations = async () => {
  const thirtyDaysAgo = daysAgo(30);
  const sixtyDaysAgo = daysAgo(60);

  const rows = await Report.aggregate([
    {
      $group: {
        _id: '$normalizedAddress',
        address: { $first: '$address' },
        lat: { $first: '$location.lat' },
        lng: { $first: '$location.lng' },
        totalReports: { $sum: 1 },
        confirmationCount: { $sum: { $size: { $ifNull: ['$upvotes', []] } } },
        lastActivity: { $max: '$createdAt' },
        categories: { $push: '$category' },
        reportsLast30Days: {
          $sum: { $cond: [{ $gte: ['$createdAt', thirtyDaysAgo] }, 1, 0] },
        },
        reportsPrev30Days: {
          $sum: {
            $cond: [
              {
                $and: [
                  { $gte: ['$createdAt', sixtyDaysAgo] },
                  { $lt: ['$createdAt', thirtyDaysAgo] },
                ],
              },
              1,
              0,
            ],
          },
        },
      },
    },
    { $sort: { reportsLast30Days: -1, totalReports: -1 } },
  ]);

  return rows.map(shapeLocation);
};

module.exports = { aggregateLocations, daysAgo };
