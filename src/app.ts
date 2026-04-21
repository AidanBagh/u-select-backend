import express from 'express';
import cors from 'cors';
import { getStats } from './controllers/statsController.js';
import jobRoutes from './routes/jobs.js';
import applicantRoutes from './routes/applicants.js';
import chatRoutes from './routes/chat.js';
import screeningRoutes from './routes/screening.js';
import errorHandler from './middleware/errorHandler.js';

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

export default app;
