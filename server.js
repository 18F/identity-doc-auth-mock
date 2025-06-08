const express = require('express');
const app = express();

// Import the id_plus route
const idPlusRoute = require('./routes/id_plus');

app.use(express.json());

// Mount the /id_plus route
app.use('/id_plus/api/3.0/EmailAuthScore', idPlusRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});