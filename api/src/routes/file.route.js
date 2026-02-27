import express from 'express';
import { getFile, softDeleteFile, downloadFile, getAllFiles, streamFile } from '../controllers/file.controller.js';
import { deleteLimiter } from '../middlewares/rateLimit.middleware.js';
import { optionalAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

// All file routes use optionalAuth for ownership-based filtering
router.get('/', optionalAuth, getAllFiles);
router.get('/:uuid', optionalAuth, getFile);
router.get('/:uuid/download', optionalAuth, downloadFile);
router.get('/:uuid/stream', optionalAuth, streamFile);
router.delete('/:uuid', optionalAuth, deleteLimiter, softDeleteFile);

export default router;
