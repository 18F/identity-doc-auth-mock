const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { createClient } = require('redis');

const redisClient = createClient();
redisClient.connect().catch(console.error);

function hasValidHeaders(headers) {
  const authHeader = headers['authorization'];
  const contentType = headers['content-type'];
  return authHeader && contentType === 'application/json';
}

function generateRandomString(length = 16) {
  return crypto.randomBytes(length).toString('hex');
}

router.post('/doc_request', async (req, res) => {
  if (!hasValidHeaders(req.headers)) {
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  const { documentType, redirect } = req.body;

  if (
    typeof documentType !== 'string' ||
    !['license', 'passport'].includes(documentType)
  ) {
    return res.status(400).json({ error: 'Invalid or missing documentType' });
  }

  const { method, url } = redirect || {};
  if (
    typeof method !== 'string' ||
    !['GET', 'POST'].includes(method)
  ) {
    return res.status(400).json({ error: 'Invalid or missing redirect method' });
  }

  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid or missing url' });
  }

  // Store a record in Redis with a 60-minute expiration
  const key = generateRandomString(12);
  const value = JSON.stringify({ documentType, redirect });
  await redisClient.setEx(key, 60 * 60, value); // 3600 seconds = 60 minutes

  const domain = process.env.domain || 'http://localhost:3001';
  const path = `/docv/app/${key}`;
  const appUrl = `${domain}${path}`;
  return res.status(200).json({ data: { url: appUrl, docvTransactonToken: key } });
});

module.exports = router;