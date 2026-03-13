import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { auth } from './middleware/auth';
import { errorHandler } from './middleware/errorHandler';
import logger from './utils/logger';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Apply auth middleware to all API routes
app.use('/api', auth);

import domainRoutes from './routes/domainRoutes';
import configRoutes from './routes/configRoutes';
import logRoutes from './routes/logRoutes';
import statsRoutes from './routes/statsRoutes';
import warmupRoutes from './routes/warmupRoutes';

// Existing routes
app.get('/api/status', (req, res) => {
  res.status(200).send({ message: 'API is running' });
});

app.use('/api/domains', domainRoutes);
app.use('/api/config', configRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/warmup', warmupRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
