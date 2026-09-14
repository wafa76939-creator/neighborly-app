const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['Noise', 'Trash', 'Parking', 'Safety', 'Maintenance', 'Other'],
    required: true,
  },
  address: { type: String, required: true },
  normalizedAddress: { type: String, required: true, index: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  occurredAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  photoUrl: { type: String, default: '' },
  status: {
    type: String,
    enum: ['open', 'acknowledged', 'resolved'],
    default: 'open',
  },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

ReportSchema.index({ category: 1, status: 1, occurredAt: -1 });
ReportSchema.index({ normalizedAddress: 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
