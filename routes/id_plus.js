const express = require('express');
const router = express.Router();
const { authorized, documentVerification } = require('../services/id_plus');

// Middleware to parse JSON bodies
router.post('/', (req, res) => {
  // Check for required headers
  const authHeader = req.headers['authorization'];
  const contentType = req.headers['content-type'];

  if (!authHeader || !contentType || contentType !== 'application/json') {
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  const { modules } = req.body;

  if (!Array.isArray(modules) &&
    modules.length !== 1 &&
    modules[0] !== "documentverification"
  ) {
    return res.status(400).json({ error: 'Invalid modules' });
  }
  
  return documentVerification(req, res);
  
});

module.exports = router;