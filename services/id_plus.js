const { passport_pass, license_pass } = require('../data/docv/results');
const { createClient } = require('redis');
const redisClient = createClient();
redisClient.connect().catch(console.error);

const documentVerification = async (req, res) => {
  const { docvTransactionToken } = req.body;

  if (typeof docvTransactionToken !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing docvTransactionToken' });
  }

  // Fetch the value from Redis
  const value = await redisClient.get(docvTransactionToken);
  if (!value) {
    return res.status(404).json({ error: 'docvTransactionToken not found' });
  }

  const { documentType } = JSON.parse(value); 

  let response_body = {};
  if (documentType === 'license') {
    response_body = license_pass;
  } else if (documentType === 'passport') {
    response_body = passport_pass;
  }

  res.json(response_body);
}

module.exports = { documentVerification };