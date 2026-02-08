import express from 'express';
import { uploadFile } from '../controllers/upload.controller.js';
import upload from '../middlewares/upload.middleware.js';
import auth from '../middlewares/auth.middleware.js';

const router = express.Router();

// POST /upload
// Uses auth middleware and multer upload middleware
router.post('/', auth, upload.single('file'), uploadFile);

export default router;
