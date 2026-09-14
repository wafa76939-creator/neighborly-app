const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

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

// ✅ FRONTEND SERVE KARNE KE LIYE (Ye zaroori hai!)
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

// ✅ Har non-API route par index.html bhejo
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

const PORT = process.env.PORT || 5002;

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