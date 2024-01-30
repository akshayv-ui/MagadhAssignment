const express = require('express');
const dbClient = require('./services/prisma/index.js');

const app = express();

app.listen(3000, async () => {
    console.log('Server is running on port 3000');

    const db = dbClient.default;
    try {
        console.log('🤞Connecting to database...');
        await db.$connect();

        console.log('✅Database connected!');
    } catch (error) {
        console.log(error);

        console.log('💥Database connection failed!');
    }
});