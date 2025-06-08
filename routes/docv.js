const express = require('express');
const router = express.Router();
const axios = require('axios');
const crypto = require('crypto');
const { createClient } = require('redis');
const { authorized } = require('../services/id_plus');

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

  if (!authorized(req.headers['authorization'])) {
    return res.status(401).json({ error: 'Unauthorized' });
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

  const docvTransactionToken = generateRandomString(12);

  try {
    if (url) {
      new URL(url);
      const data = {
        event: {
          created: new Date().toISOString(),
          docvTransactionToken,
          eventType: 'DOCUMENTS_UPLOADED',
          referenceId: 'the-reference-id'
        }
      }
      await axios.post(url, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': process.env.webhook_secret
        }
      });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid redirect url' });
  }

  // Store a record in Redis with a 60-minute expiration
  const value = JSON.stringify({ documentType, redirect });
  await redisClient.setEx(docvTransactionToken, 60 * 60, value); // 3600 seconds = 60 minutes

  const domain = process.env.domain || 'http://localhost:3001';
  const path = `/docv/app/${docvTransactionToken}`;
  const appUrl = `${domain}${path}`;
  return res.status(200).json({ data: { url: appUrl, docvTransactionToken } });
});

module.exports = router;