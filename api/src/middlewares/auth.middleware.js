import jwt from 'jsonwebtoken';

/**
 * Strict auth middleware — returns 401 if no valid token
 */
const auth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

/**
 * Optional auth middleware — attaches req.user if token is valid, 
 * otherwise sets req.user = null and continues (no 401).
 */
export const optionalAuth = (req, res, next) => {
    // Check Authorization header first, then fall back to query param
    // Query param is needed for <img src>, <video src>, etc. which can't send headers
    const token = req.header('Authorization')?.replace('Bearer ', '') || req.query.token;

    if (!token) {
        req.user = null;
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = decoded;
    } catch (err) {
        req.user = null;
    }

    next();
};

export default auth;
