const express = require('express');
const router = express.Router();
const { passport_pass, license_pass } = require('../data/docv_results');

// Middleware to parse JSON bodies
router.post('/result', (req, res) => {
  console.log('Received request:', {
    headers: req.headers,
    body: req.body
  });
  const authHeader = req.headers['authorization'];
  const contentType = req.headers['content-type'];

  if (!authHeader || !contentType || contentType !== 'application/json') {
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  const { modules, docvTransactionToken, documentType } = req.body;

  if (!Array.isArray(modules) || typeof docvTransactionToken !== 'string') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (
    typeof documentType !== 'string' ||
    !['license', 'passport'].includes(documentType)
  ) {
    return res.status(400).json({ error: 'Invalid or missing documentType' });
  }

  let response_body = {};
  if (documentType === 'license') {
    response_body = license_pass;
  } else if (documentType === 'passport') {
    response_body = passport_pass;
  }

  res.json(response_body);
});

module.exports = router;