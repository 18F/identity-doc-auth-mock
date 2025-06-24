const { passport_pass, license_pass, randomDocumentPass } = require('../data/docv/results');
const { createClient } = require('redis');
const redisClient = createClient();
redisClient.connect().catch(console.error);

const documentVerification = async (req, res) => {
  console.log('Document Verification Request:', req.body);
  const { docvTransactionToken } = req.body;

  if (typeof docvTransactionToken !== 'string') {
    return res.status(400).json({ error: 'Invalid or missing docvTransactionToken' });
  }

  let response_body = randomDocumentPass();

  if (authorized(req.headers['authorization'])) {
  // Fetch the value from Redis
    const value = await redisClient.get(docvTransactionToken);
    if (value) {     
      const { documentType } = JSON.parse(value); 

      if (documentType === 'license') {
        response_body = license_pass;
      } else if (documentType === 'passport') {
        response_body = passport_pass;
      }
    }
  }

  res.json(response_body);
}

const authorized = (apiKey) =>{
  if (apiKey && apiKey.split(' ')[1] === process.env.API_KEY) {
    return true;
  }
  return false;
}
module.exports = { authorized, documentVerification };