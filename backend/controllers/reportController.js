const Report = require('../models/Report');
const normalizeAddress = require('../utils/addressNormalizer');
const { uploadBuffer } = require('../utils/cloudinaryUpload');
const { CATEGORIES, STATUSES } = require('../utils/constants');

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

const createReport = async (req, res, next) => {
  try {
    const { title, description, category, address, lat, lng, occurredAt } = req.body;
    let photoUrl = '';

    if (req.file) {
      const uploaded = await uploadBuffer(req.file.buffer);
      photoUrl = uploaded.secure_url;
    }

    const report = await Report.create({
      title: title.trim(),
      description: description.trim(),
      category,
      address: address.trim(),
      normalizedAddress: normalizeAddress(address),
      location: { lat: Number(lat), lng: Number(lng) },
      occurredAt: new Date(occurredAt),
      reportedBy: req.userId,
      photoUrl,
    });

    await report.populate(populateFields);
    res.status(201).json(shapeReport(report, req.userId));
  } catch (error) {
    next(error);
  }
};

const getMyReports = async (req, res, next) => {
  try {
    const reports = await Report.find({ reportedBy: req.userId })
      .populate(populateFields)
      .sort({ createdAt: -1 });
    res.json(reports.map((report) => shapeReport(report, req.userId)));
  } catch (error) {
    next(error);
  }
};

const getReports = async (req, res, next) => {
  try {
    const { category, status, from, to, search } = req.query;
    const filter = {};

    if (category) {
      if (!CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: [`category must be one of: ${CATEGORIES.join(', ')}`],
        });
      }
      filter.category = category;
    }

    if (status) {
      if (!STATUSES.includes(status)) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: [`status must be one of: ${STATUSES.join(', ')}`],
        });
      }
      filter.status = status;
    }

    if (search && String(search).trim()) {
      const rx = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: rx }, { address: rx }, { description: rx }];
    }

    if (from || to) {
      filter.occurredAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: ['from must be a valid date'],
          });
        }
        filter.occurredAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: ['to must be a valid date'],
          });
        }
        filter.occurredAt.$lte = toDate;
      }
    }

    const reports = await Report.find(filter)
      .populate(populateFields)
      .sort({ createdAt: -1 });

    res.json(reports.map((report) => shapeReport(report, req.userId)));
  } catch (error) {
    next(error);
  }
};

const getReportById = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id).populate(populateFields);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    const similarNearby = await Report.countDocuments({
      _id: { $ne: report._id },
      normalizedAddress: report.normalizedAddress,
    });
    res.json({ ...shapeReport(report, req.userId), similarNearby });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    if (report.reportedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the reporter can update status' });
    }

    report.status = req.body.status;
    await report.save();
    await report.populate(populateFields);
    res.json(shapeReport(report, req.userId));
  } catch (error) {
    next(error);
  }
};

const toggleUpvote = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    const userId = req.userId;
    const index = report.upvotes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      report.upvotes.push(userId);
    } else {
      report.upvotes.splice(index, 1);
    }

    await report.save();
    await report.populate(populateFields);
    res.json(shapeReport(report, userId));
  } catch (error) {
    next(error);
  }
};

const addComment = async (req, res, next) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    report.comments.push({
      userId: req.userId,
      text: req.body.text.trim(),
    });

    await report.save();
    await report.populate(populateFields);
    res.status(201).json(shapeReport(report, req.userId));
  } catch (error) {
    next(error);
  }
};

const uploadReportPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }
    if (report.reportedBy.toString() !== req.userId) {
      return res.status(403).json({ message: 'Only the reporter can upload a photo' });
    }

    const uploaded = await uploadBuffer(req.file.buffer);
    report.photoUrl = uploaded.secure_url;
    await report.save();
    await report.populate(populateFields);
    res.json(shapeReport(report, req.userId));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReport,
  getReports,
  getMyReports,
  getReportById,
  updateStatus,
  toggleUpvote,
  addComment,
  uploadReportPhoto,
};
