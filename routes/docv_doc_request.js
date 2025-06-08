const express = require('express');
const router = express.Router();

function hasValidHeaders(headers) {
  const authHeader = headers['authorization'];
  const contentType = headers['content-type'];

  if (!authHeader || !contentType || contentType !== 'application/json') {
    return  false;
  }
  return true;

}

// Middleware to parse JSON bodies
router.post('/', (req, res) => {

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

  const { method, url } = redirect;
  if (
    typeof method !== 'string' ||
    !['GET', 'POST'].includes(method)
  ) {
    return res.status(400).json({ error: 'Invalid or missing redirect method' });
  }
  
  try {
    new URL(url);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid or missing url' });  // If URL is invalid, return error
  }
  

  return res.status(200).json({ message: 'OK' });
  
});

module.exports = router;