require('dotenv').config();

const express = require('express');
const app = express();

const idPlusRoute = require('./routes/id_plus');
const docvRoute = require('./routes/docv');
const dosRoute = require('./routes/dos');
const trustedRefereeRoute = require('./routes/trusted_referee');

app.use(express.json());
app.use('/api/3.0/EmailAuthScore', idPlusRoute);
app.use('/docv', docvRoute);
app.use('/dos', dosRoute);
app.use('/trusted_referee', trustedRefereeRoute);

if (process.env.NODE_ENV === 'test') {
  app.get('/error', (req, res, next) => {
    next(new Error('Test error'));
  });
}

if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });
}

module.exports = app;