const express = require('express');
const cors = require('cors');
const { getStats } = require('./src/controllers/statsController');
const jobRoutes = require('./src/routes/jobs');
const applicantRoutes = require('./src/routes/applicants');
const chatRoutes = require('./src/routes/chat');
const screeningRoutes = require('./src/routes/screening');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/stats', getStats);

app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/screening', screeningRoutes);

app.use(errorHandler);

module.exports = app;
