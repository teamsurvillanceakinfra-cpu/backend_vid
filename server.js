import express from 'express';

import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import route definitions
import downloadRoutes from './routes/download.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Security & Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'https://frontend-vid.vercel.app/' }));
app.use(express.json());

// Rate Limiting (Prevent abuse on downloads)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per `window`
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// No Database connection needed.

// Route Mounts
app.use('/api/download', downloadRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'success', message: 'VidSnatcher Core API running securely!' }));

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server processing operations on port ${PORT}`);
});
