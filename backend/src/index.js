const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const issueRoutes = require('./routes/issueRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// Frontend serve karne ke liye
const frontendPath = path.join(__dirname, '..', '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/api/issues', issueRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});