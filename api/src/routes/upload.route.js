import express from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { uploadLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

// POST /upload - rate limited
router.post('/', uploadLimiter, upload.single('file'), uploadFile);

export default router;
