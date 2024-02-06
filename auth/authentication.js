const express = require('express');
const authenticationMiddleWare = require('./middleware').default;
const dbClient = require('../services/prisma/index');

const router = express.Router();

router.use(authenticationMiddleWare, async (req, res, next) => {
    try {
        const db = dbClient.default;
        const payload = res.locals.payload;
        const userId = payload.userId;

        const user = await db.users.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(401).json({ error: 'Invalid access token' });
        }

        res.locals.username = user.name;
        res.locals.email = user.email;
        return next();
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

exports.default = router;