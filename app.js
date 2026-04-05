const express = require('express');
const cors = require('cors');
const jobRoutes = require('./src/routes/jobs');
const applicantRoutes = require('./src/routes/applicants');

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);

module.exports = app;
