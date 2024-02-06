const express = require('express');
const { keys } = require('../configs/index');

const router = express.Router()

router.use(async (req, res, next) => {
    if (!req.headers['x-api-key']) {
        return res.status(401).json({ error: 'Missing X-API-KEY header' });
    }
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== keys.apiKey) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
});

exports.router = router;