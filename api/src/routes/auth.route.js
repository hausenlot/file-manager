import express from 'express';
import { generateToken } from '../controllers/auth.controller.js';

const router = express.Router();

// GET /auth/token
router.get('/token', generateToken);

export default router;
