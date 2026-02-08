import jwt from 'jsonwebtoken';

export const generateToken = (req, res) => {
    const payload = {
        id: 'test-user-' + Date.now(),
        name: 'Test User',
        role: 'tester'
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'secret', {
        expiresIn: '1h'
    });

    res.json({
        success: true,
        token: token,
        expiresIn: '1h'
    });
};
