import express from 'express';
import { getFile, softDeleteFile, downloadFile, getAllFiles, streamFile } from '../controllers/file.controller.js';
import { deleteLimiter } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

router.get('/', getAllFiles);
router.get('/:uuid', getFile);
router.get('/:uuid/download', downloadFile);
router.get('/:uuid/stream', streamFile);
router.delete('/:uuid', deleteLimiter, softDeleteFile);

export default router;
