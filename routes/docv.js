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

  const { documentType, redirect } = req.body.config ;

  if (
    typeof documentType !== 'string' ||
    !['license', 'passport'].includes(documentType)
  ) {
    return res.status(400).json({ error: 'Invalid or missing documentType' });
  }

  const { method = 'GET', url = process.env.DEFAULT_IDP_DOCV_CALLBACK_URL } = redirect || {};

  if (
    typeof method !== 'string' ||
    !['GET', 'POST'].includes(method)
  ) {
    return res.status(400).json({ error: 'Invalid or missing redirect method' });
  }

  const docvTransactionToken = generateRandomString(12);
  try {
    const idpOrigin = new URL(url).origin;
    const data = {
      event: {
        created: new Date().toISOString(),
        docvTransactionToken,
        eventType: 'DOCUMENTS_UPLOADED',
        referenceId: 'the-reference-id'
      }
    }

    const webhook_endpoint = `${idpOrigin}${process.env.IDP_WEBHOOK_PATH}`;
    console.log('Sending webhook to:', webhook_endpoint);
    axios.post(webhook_endpoint, data, { // await removed - sending but hanging
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.WEBHOOK_SECRET
      }
    });
  } catch (e) {
    console.log('Error sending webhook:', e.message);
    return res.status(400).json({ error: 'Invalid redirect url' });
  }

  // Store a record in Redis with a 60-minute expiration
  const value = JSON.stringify({ documentType, redirect });
  await redisClient.setEx(docvTransactionToken, 60 * 60, value); // 3600 seconds = 60 minutes

  const response_body = { data: { url, docvTransactionToken } };
  return res.status(200).json(response_body);
});

module.exports = router;