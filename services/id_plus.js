const { passport_pass, license_pass } = require('../data/docv/results');

const documentVerification = (req, res) => {
  const { docvTransactionToken, documentType } = req.body;

  if (typeof docvTransactionToken !== 'string') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (
    typeof documentType !== 'string' ||
    !['license', 'passport'].includes(documentType)
  ) {
    return res.status(400).json({ error: 'Invalid or missing documentType' });
  }

  let response_body = {};
  if (documentType === 'license') {
    response_body = license_pass;
  } else if (documentType === 'passport') {
    response_body = passport_pass;
  }

  res.json(response_body);
}

module.exports = { documentVerification };