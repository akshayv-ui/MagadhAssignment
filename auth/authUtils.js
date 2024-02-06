const jwt = require('jsonwebtoken');
const { privateKey } = require('../configs').keys;


const createTokens = async ({ email, userId, userType, accessTokenKey, refreshTokenKey }) => {
    const accessToken = jwt.sign({ email, userId, userType, accessTokenKey }, privateKey, { expiresIn: '15m', algorithm: 'RS256' });
    const refreshToken = jwt.sign({ email, userId, userType, refreshTokenKey }, privateKey, { expiresIn: '7d', algorithm: 'RS256' });
    return {
        accessToken,
        refreshToken
    }
}

exports.default = { createTokens };