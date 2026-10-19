const express = require('express');
const router = express.Router();

function hasValidHeaders(headers) {
  const contentType = headers['content-type'];
  return contentType === 'application/json';
}

// Optional shared-secret check. When PROOFING_AGENT_WEBHOOK_SECRET is set the
// incoming request must present it in the Authorization header. In lower
// environments the secret can be left unset to disable the check entirely.
function isAuthorized(headers) {
  const expected = process.env.PROOFING_AGENT_WEBHOOK_SECRET;
  if (!expected) return true;
  return headers['authorization'] === expected;
}

router.post('/webhook', async (req, res) => {
  if (!hasValidHeaders(req.headers)) {
    console.error('Proofing agent webhook rejected: missing or invalid headers');
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  if (!isAuthorized(req.headers)) {
    console.error('Proofing agent webhook rejected: unauthorized request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const event = req.body;
  console.log('Proofing agent webhook received:', event);

  return res.status(200).json({
    status: 'received',
    receivedAt: new Date().toISOString(),
    event
  });
});

module.exports = router;
