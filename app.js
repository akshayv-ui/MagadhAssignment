require('dotenv').config();
const express = require('express');
const dbClient = require('./services/prisma/index.js');

const app = express();

app.listen(3000, async (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    };
    const db = dbClient.default;

    try {
        console.log('Connecting to database');
        await db.$connect();
        console.log('Connected to database');
    } catch (err) {
        console.log(err);
        console.log('Error connecting to database');
    }

    console.log('Server is running on port 3000');
});