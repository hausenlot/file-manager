import express from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { uploadLimiter } from '../middlewares/rateLimit.middleware.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /upload - rate limited, optional auth for ownership
router.post('/', uploadLimiter, optionalAuth, upload.single('file'), uploadFile);

export default router;
