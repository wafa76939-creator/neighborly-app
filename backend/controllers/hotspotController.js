const Report = require('../models/Report');
const { aggregateLocations } = require('../utils/hotspotQuery');
const { HOTSPOT_THRESHOLD } = require('../utils/constants');

const getHotspots = async (req, res, next) => {
  try {
    const locations = await aggregateLocations();
    const onlyHotspots = req.query.all !== 'true';
    const data = onlyHotspots ? locations.filter((item) => item.isHotspot) : locations;
    res.json({
      hotspotThreshold: HOTSPOT_THRESHOLD,
      count: data.length,
      hotspots: data,
    });
  } catch (error) {
    next(error);
  }
};

const getHotspotByAddress = async (req, res, next) => {
  try {
    const normalizeAddress = require('../utils/addressNormalizer');
    const normalizedAddress = normalizeAddress(decodeURIComponent(req.params.address));
    const locations = await aggregateLocations();
    const hotspot = locations.find((item) => item.normalizedAddress === normalizedAddress);

    if (!hotspot) {
      return res.status(404).json({ message: 'No reports found for this address' });
    }

    const populateFields = [
      { path: 'reportedBy', select: 'name email' },
      { path: 'comments.userId', select: 'name' },
    ];

    const reports = await Report.find({ normalizedAddress })
      .populate(populateFields)
      .sort({ createdAt: 1 });

    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const timelineMap = {};
    reports.forEach((report) => {
      if (report.createdAt >= sixtyDaysAgo) {
        const key = report.createdAt.toISOString().slice(0, 10);
        timelineMap[key] = (timelineMap[key] || 0) + 1;
      }
    });

    const timeline = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    let running = 0;
    let crossedOn = null;
    const windowStart = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    reports
      .filter((report) => report.createdAt >= windowStart)
      .forEach((report) => {
        running += 1;
        if (!crossedOn && running >= HOTSPOT_THRESHOLD) {
          crossedOn = report.createdAt;
        }
      });

    res.json({
      ...hotspot,
      insight:
        hotspot.changeVsPrevious > 0
          ? `This location received ${hotspot.changeVsPrevious} more report${hotspot.changeVsPrevious === 1 ? '' : 's'} than the previous 30-day period.`
          : hotspot.isHotspot
            ? 'Activity at this address has crossed the hotspot threshold in the last 30 days.'
            : 'This location has not yet reached hotspot intensity.',
      crossedOn,
      timeline,
      reports: reports.map((report) => {
        const obj = report.toObject();
        return {
          ...obj,
          upvoteCount: obj.upvotes.length,
          hasUpvoted: obj.upvotes.some((id) => id.toString() === String(req.userId)),
        };
      }),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getHotspots, getHotspotByAddress };
