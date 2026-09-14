const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
app.use(cors());
app.use(express.json());

// Serverless / dynamic DB connection middleware with clear error diagnostics
let isConnected = false;
const ensureDb = async (req, res, next) => {
  if (!process.env.MONGODB_URI) {
    return res.status(500).json({
      message: 'MONGODB_URI is not defined in Environment Variables. Please set it in Vercel settings.',
    });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      message: 'JWT_SECRET is not defined in Environment Variables. Please set it in Vercel settings.',
    });
  }
  if (isConnected || mongoose.connection.readyState === 1) {
    isConnected = true;
    return next();
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    next();
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    return res.status(500).json({
      message: `Database connection failed: ${err.message}. Please check MongoDB Atlas Network Access (allow 0.0.0.0/0).`,
    });
  }
};

app.use('/api', ensureDb);

const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const addressRoutes = require('./routes/addressRoutes');
const hotspotRoutes = require('./routes/hotspotRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/hotspots', hotspotRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Frontend static serving (locates frontend folder in local or Vercel serverless environments)
const possibleFrontendPaths = [
  path.join(process.cwd(), 'frontend'),
  path.join(__dirname, '..', 'frontend'),
  path.join(__dirname, 'frontend'),
];
const frontendPath = possibleFrontendPaths.find((p) => fs.existsSync(p)) || path.join(__dirname, '..', 'frontend');
const distPath = path.join(frontendPath, 'dist');
const staticPath = fs.existsSync(distPath) ? distPath : frontendPath;

app.use(express.static(staticPath));

// Send index.html for non-API client-side routes
app.get(/^(?!\/api).*/, (req, res) => {
  const indexPath = fs.existsSync(path.join(staticPath, 'index.html'))
    ? path.join(staticPath, 'index.html')
    : path.join(frontendPath, 'index.html');
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 5002;

if (!process.env.VERCEL) {
  mongoose.connect(process.env.MONGODB_URI)
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