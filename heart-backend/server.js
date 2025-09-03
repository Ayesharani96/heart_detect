require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const resultRoutes = require('./routes/resultRoutes');
const userDataRoutes = require('./routes/userDataRoutes');
const predictRoute = require('./routes/predict');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/user-data', userDataRoutes);
app.use('/api/predict', predictRoute);

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected');
  app.listen(PORT, () => {
    console.log(`🚀 Server running at ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
  });
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
});
