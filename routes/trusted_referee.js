const express = require('express');
const router = express.Router();

const hasValidHeaders = (headers) => {
  return true; // contentType === 'application/json';
};

router.post('/webhook', async (req, res) => {
  const responseBody = req.body;
  if (!hasValidHeaders(req.headers)) {
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  return res.status(200).json(responseBody);
});

module.exports = router;