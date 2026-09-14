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

// Frontend static serving (serves Vite dist if built, otherwise frontend directory)
const distPath = path.join(__dirname, '..', 'frontend', 'dist');
const frontendPath = path.join(__dirname, '..', 'frontend');
const staticPath = fs.existsSync(distPath) ? distPath : frontendPath;

app.use(express.static(staticPath));

// Send index.html for non-API routes
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
} else {
  mongoose.connect(process.env.MONGODB_URI).catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
}

module.exports = app;