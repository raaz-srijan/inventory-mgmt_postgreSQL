const jwt = require('jsonwebtoken');

const JWT_KEY = process.env.JWT_SECRET_KEY;

function generateJWT(payload) {
    return jwt.sign(payload, JWT_KEY, { expiresIn: '7d' });
}

function verifyJWT(token) {
    try {
        const data = jwt.verify(token, JWT_KEY);
        console.log('Token verified');
        return data; 
    } catch (error) {
        console.error('JWT verification failed:', error.message);
        return false; 
    }
}

module.exports = { generateJWT, verifyJWT };
