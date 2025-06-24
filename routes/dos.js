const express = require('express');
const router = express.Router();

const hasValidHeaders = (headers) => {
  const clientIdHeader = headers['client-id'] ;
  const correlationIdHeader = headers['x-correlation-id'];
  const clientSecretHeader = headers['client-secret'];
  const contentType = headers['content-type'];
  return clientIdHeader && correlationIdHeader && clientSecretHeader && contentType === 'application/json';
};

router.post('/mrz', async (req, res) => {
  console.log('MRZ Request received');
  if (!hasValidHeaders(req.headers)) {
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  const response_body = { response: 'YES' };
  console.log('Mrz response_body', response_body);
  return res.status(200).json(response_body);
});

router.get('/healthcheck', async (req, res) => {
  const response_body = { status: 'UP' };
  console.log('Healthcheck Request received', response_body);
  return res.status(200).json(response_body);
});

module.exports = router;