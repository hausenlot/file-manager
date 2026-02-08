import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { generalLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(morgan('dev'));
app.use(generalLimiter); // Apply general rate limit to all routes

// Routes
import healthRouter from './routes/health.route.js';
import uploadRouter from './routes/upload.route.js';
import authRouter from './routes/auth.route.js';
import fileRouter from './routes/file.route.js';

app.use('/health', healthRouter);
app.use('/upload', uploadRouter);
app.use('/auth', authRouter);
app.use('/files', fileRouter);

// 404 Handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: 'Resource not found',
    });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
    });
});

export default app;
