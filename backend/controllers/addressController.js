const Report = require('../models/Report');
const normalizeAddress = require('../utils/addressNormalizer');
const { HOTSPOT_THRESHOLD } = require('../utils/constants');

const populateFields = [
  { path: 'reportedBy', select: 'name email' },
  { path: 'comments.userId', select: 'name' },
];

const shapeReport = (report, userId) => {
  const obj = report.toObject();
  return {
    ...obj,
    upvoteCount: obj.upvotes.length,
    hasUpvoted: obj.upvotes.some((id) => id.toString() === String(userId)),
  };
};

const getReportsByAddress = async (req, res, next) => {
  try {
    const normalizedAddress = normalizeAddress(decodeURIComponent(req.params.address));
    if (!normalizedAddress) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const reports = await Report.find({ normalizedAddress })
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.json({
      address: reports[0]?.address || req.params.address,
      normalizedAddress,
      count: reports.length,
      reports: reports.map((report) => shapeReport(report, req.userId)),
    });
  } catch (error) {
    next(error);
  }
};

const getAddressStats = async (req, res, next) => {
  try {
    const normalizedAddress = normalizeAddress(decodeURIComponent(req.params.address));
    if (!normalizedAddress) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    const [stats] = await Report.aggregate([
      { $match: { normalizedAddress } },
      {
        $facet: {
          sample: [{ $limit: 1 }, { $project: { address: 1, location: 1 } }],
          total: [{ $count: 'count' }],
          last30Days: [
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            { $count: 'count' },
          ],
          previous30Days: [
            { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
            { $count: 'count' },
          ],
          confirmations: [
            { $project: { n: { $size: { $ifNull: ['$upvotes', []] } } } },
            { $group: { _id: null, count: { $sum: '$n' } } },
          ],
          statusBreakdown: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
            { $project: { _id: 0, status: '$_id', count: 1 } },
          ],
          categoryBreakdown: [
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $project: { _id: 0, category: '$_id', count: 1 } },
            { $sort: { count: -1 } },
          ],
          timeline: [
            { $match: { createdAt: { $gte: sixtyDaysAgo } } },
            {
              $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                count: { $sum: 1 },
              },
            },
            { $project: { _id: 0, date: '$_id', count: 1 } },
            { $sort: { date: 1 } },
          ],
        },
      },
    ]);

    const total = stats.total[0]?.count || 0;
    const last30Days = stats.last30Days[0]?.count || 0;
    const previous30Days = stats.previous30Days[0]?.count || 0;
    const confirmations = stats.confirmations[0]?.count || 0;
    const topCategory = stats.categoryBreakdown[0];

    res.json({
      address: stats.sample[0]?.address || decodeURIComponent(req.params.address),
      normalizedAddress,
      location: stats.sample[0]?.location || null,
      totalReports: total,
      last30Days,
      previous30Days,
      confirmations,
      categoryBreakdown: stats.categoryBreakdown,
      statusBreakdown: stats.statusBreakdown,
      timeline: stats.timeline,
      isHotspot: last30Days >= HOTSPOT_THRESHOLD,
      hotspotThreshold: HOTSPOT_THRESHOLD,
      changeVsPrevious: last30Days - previous30Days,
      topCategory: topCategory?.category || null,
      topCategoryShare: total ? Math.round((topCategory?.count || 0) / total * 100) : 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getReportsByAddress, getAddressStats };
