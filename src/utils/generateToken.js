const jwt = require('jsonwebtoken');

const JWT_KEY=process.env.JWT_KEY;

function generateJWT(payload) {
    return jwt.sign(payload, JWT_KEY, {expiresIn:"7d"});
    
}

async function verifyJWT(token) {
    return jwt.verify(token, JWT_KEY);
}

module.exports = {generateJWT, verifyJWT};