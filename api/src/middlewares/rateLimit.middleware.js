import rateLimit from 'express-rate-limit';

// General API rate limiter
export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later' },
});

// Stricter limiter for uploads
export const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 uploads per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Upload limit reached, please try again later' },
});

// Stricter limiter for deletes
export const deleteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // 20 deletes per 15 min per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Delete limit reached, please try again later' },
});
