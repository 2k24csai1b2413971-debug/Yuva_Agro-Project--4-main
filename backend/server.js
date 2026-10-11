require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');

const connectDB = require('./config/db');
const farmerRoutes = require('./routes/farmerRoutes');
const diseaseRoutes = require('./routes/diseaseRoutes');
const chatRoutes = require('./routes/chatRoutes');
const kvkRoutes = require('./routes/kvkRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// ---- API routes ----
app.use('/api/farmers', farmerRoutes);
app.use('/api/disease', diseaseRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/kvks', kvkRoutes);

// Health check — handy for showing the faculty that the server is alive
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: connectDB.isConnected() ? 'connected' : 'disconnected',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY),
  });
});

// ---- Serve the frontend ----
// The whole site is served from this same server, so the browser and the API
// share one origin. That means the pages can call "/api/..." directly.
const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
app.use(express.static(FRONTEND_DIR));

app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

const PORT = process.env.PORT || 5000;

// Ensure MongoDB is connected before handling API requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error('Database connection error:', error.message);
    res.status(503).json({
      message: 'Database connection failed'
    });
  }
});

// Export the Express app for Vercel.
module.exports = app;

// Start a local server only when running directly.
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(Yuva Agro running on port ${PORT});
  });
}
