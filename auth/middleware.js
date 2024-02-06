const express = require('express');
const jwt = require('jsonwebtoken');
const { publicKey } = require('../configs').keys;

const authenticationMiddleWare = (async (req, res, next) => {
    if (!req.headers['access-token'] || !req.headers['refresh-token']) {
        return res.status(401).json({ error: 'Missing token' });
    }
    const accessToken = req.headers['access-token'];

    const payload = jwt.verify(accessToken, publicKey, { algorithms: ['RS256'] });
    if (!payload) {
        return res.status(401).json({ error: 'Invalid access token' });
    }
    res.locals.payload = payload;
    next();
});

exports.default = authenticationMiddleWare;