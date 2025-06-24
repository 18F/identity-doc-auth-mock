require('dotenv').config();

const express = require('express');
const app = express();

// Import the id_plus route
const idPlusRoute = require('./routes/id_plus');
const docvRoute = require('./routes/docv');

app.use(express.json());

// Mount the /id_plus route
app.use('/api/3.0/EmailAuthScore', idPlusRoute);

app.use('/docv', docvRoute);

if (process.env.NODE_ENV === 'production') {
  // Global error handler (add this before app.listen)
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
  });
}

const PORT = process.env.PORT;// || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});