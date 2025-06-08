const express = require('express');
const router = express.Router();
const { documentVerification } = require('../services/id_plus');

// Middleware to parse JSON bodies
router.post('/', (req, res) => {
  // console.log('Received request:', {
  //   headers: req.headers,
  //   body: req.body
  // });
  const authHeader = req.headers['authorization'];
  const contentType = req.headers['content-type'];

  if (!authHeader || !contentType || contentType !== 'application/json') {
    return res.status(400).json({ error: 'Missing or invalid headers' });
  }

  const { modules } = req.body;

  if (Array.isArray(modules) &&
    modules.length === 1 &&
    modules[0] === "documentverification"
  ) {
    return documentVerification(req, res);
  }
  
  return res.status(400).json({ error: 'Invalid modules' });
  
});

module.exports = router;