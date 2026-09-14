const Report = require('../models/Report');
const { aggregateLocations, daysAgo } = require('../utils/hotspotQuery');

const getDashboardStats = async (req, res, next) => {
  try {
    const thirtyDaysAgo = daysAgo(30);
    const sixtyDaysAgo = daysAgo(60);
    const locations = await aggregateLocations();
    const hotspots = locations.filter((item) => item.isHotspot);

    const [
      totalReports,
      activeIssues,
      resolved,
      reportsThisMonth,
      reportsPrevMonth,
      confirmationAgg,
    ] = await Promise.all([
      Report.countDocuments(),
      Report.countDocuments({ status: { $in: ['open', 'acknowledged'] } }),
      Report.countDocuments({ status: 'resolved' }),
      Report.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Report.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
      }),
      Report.aggregate([
        { $unwind: { path: '$upvotes', preserveNullAndEmptyArrays: false } },
        { $count: 'count' },
      ]),
    ]);

    const confirmations = confirmationAgg[0]?.count || 0;
    const trend = (current, previous) => {
      if (!previous) return current ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    res.json({
      totalReports,
      activeIssues,
      hotspots: hotspots.length,
      resolved,
      confirmations,
      reportsThisMonth,
      neighborhoods: locations.length,
      trends: {
        totalReports: trend(reportsThisMonth, reportsPrevMonth),
        hotspots: trend(
          hotspots.filter((h) => h.reportsLast30Days >= 5).length,
          locations.filter((h) => h.reportsPrev30Days >= 5).length
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardActivity = async (req, res, next) => {
  try {
    const populateFields = [
      { path: 'reportedBy', select: 'name email' },
      { path: 'comments.userId', select: 'name' },
    ];
    const recent = await Report.find()
      .populate(populateFields)
      .sort({ createdAt: -1 })
      .limit(8);

    const locations = await aggregateLocations();
    const trending = locations.slice(0, 5);

    res.json({
      recent: recent.map((report) => {
        const obj = report.toObject();
        return {
          ...obj,
          upvoteCount: obj.upvotes.length,
          hasUpvoted: obj.upvotes.some((id) => id.toString() === String(req.userId)),
        };
      }),
      trending,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, getDashboardActivity };
