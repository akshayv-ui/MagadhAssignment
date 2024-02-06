require('dotenv').config();
const express = require('express');
const cors = require('cors')
const indexRoutes = require('./routes/index.js').default;
const dbClient = require('./services/prisma/index.js');
const bodyParser = require('body-parser');

const app = express();

app.disable('x-powered-by');
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '5mb', type: 'application/json' }))
app.use(bodyParser.json());

app.get('/', (_req, res) => {
    res.send('Health Ok !')
});

app.use('/api', indexRoutes);

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