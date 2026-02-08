import express from 'express';
import { getFile, softDeleteFile } from '../controllers/file.controller.js';

const router = express.Router();

router.get('/:uuid', getFile);
router.delete('/:uuid', softDeleteFile);

export default router;
