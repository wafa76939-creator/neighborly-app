const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const addressRoutes = require('./routes/addressRoutes');
const hotspotRoutes = require('./routes/hotspotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

let databaseConnection;
const connectDatabase = () => {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (!databaseConnection) {
    databaseConnection = mongoose.connect(process.env.MONGODB_URI);
  }
  return databaseConnection;
};

app.use('/api', async (req, res, next) => {
  try {
    await connectDatabase();
    next();
  } catch (err) {
    next(err);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again later.' },
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ message: 'Neighborly API is running' });
});

const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  connectDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
}


module.exports = app;
