const express = require('express');
const app = express();

// Import the docv/result route
const docvRoute = require('./routes/docv');

app.use(express.json());

// Mount the /docv/result route
app.use('/docv', docvRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});