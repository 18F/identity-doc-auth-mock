const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('documentVerification', function () {
  let req, res, redisStub, randomDocumentPassStub, licensePass, passportPass, documentVerification, authorizedStub;

  beforeEach(function () {
    // Stubs for result data
    licensePass = { result: 'license' };
    passportPass = { result: 'passport' };
    randomDocumentPassStub = sinon.stub().returns({ result: 'random' });

    // Stub Redis client
    redisStub = {
      connect: sinon.stub().resolves(),
      get: sinon.stub()
    };

    // Stub authorized
    authorizedStub = sinon.stub();

    // Proxyquire the module with stubs
    ({ documentVerification } = proxyquire('../../services/id_plus', {
      '../data/docv/results': {
        passport_pass: passportPass,
        license_pass: licensePass,
        randomDocumentPass: randomDocumentPassStub
      },
      redis: { createClient: () => redisStub }
    }));

    // Set up mock req/res
    req = {
      body: {},
      headers: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub()
    };

    // Set API_KEY for authorized
    process.env.API_KEY = 'test-key';
  });

  it('should return 400 if docvTransactionToken is missing', async function () {
    req.body = {};
    await documentVerification(req, res);
    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ error: 'Invalid or missing docvTransactionToken' })).to.be.true;
  });

  it('should return randomDocumentPass if not authorized', async function () {
    req.body = { docvTransactionToken: 'token' };
    req.headers['authorization'] = 'Bearer wrong-key';
    // Patch authorized to return false
    const origAuthorized = require('../../services/id_plus').authorized;
    sinon.stub(require('../../services/id_plus'), 'authorized').returns(false);

    await documentVerification(req, res);
    expect(randomDocumentPassStub.called).to.be.true;
    expect(res.json.calledWithMatch({ result: 'random' })).to.be.true;

    // Restore authorized
    require('../../services/id_plus').authorized.restore();
  });

  it('should return license_pass if authorized and documentType is license', async function () {
    req.body = { docvTransactionToken: 'token' };
    req.headers['authorization'] = 'Bearer test-key';
    redisStub.get.resolves(JSON.stringify({ documentType: 'license' }));

    // Patch authorized to return true
    const origAuthorized = require('../../services/id_plus').authorized;
    sinon.stub(require('../../services/id_plus'), 'authorized').returns(true);

    await documentVerification(req, res);
    expect(res.json.calledWithMatch({ result: 'license' })).to.be.true;

    // Restore authorized
    require('../../services/id_plus').authorized.restore();
  });

  it('should return passport_pass if authorized and documentType is passport', async function () {
    req.body = { docvTransactionToken: 'token' };
    req.headers['authorization'] = 'Bearer test-key';
    redisStub.get.resolves(JSON.stringify({ documentType: 'passport' }));

    // Patch authorized to return true
    const origAuthorized = require('../../services/id_plus').authorized;
    sinon.stub(require('../../services/id_plus'), 'authorized').returns(true);

    await documentVerification(req, res);
    expect(res.json.calledWithMatch({ result: 'passport' })).to.be.true;

    // Restore authorized
    require('../../services/id_plus').authorized.restore();
  });

  it('should return randomDocumentPass if authorized but no redis value', async function () {
    req.body = { docvTransactionToken: 'token' };
    req.headers['authorization'] = 'Bearer test-key';
    redisStub.get.resolves(null);

    // Patch authorized to return true
    const origAuthorized = require('../../services/id_plus').authorized;
    sinon.stub(require('../../services/id_plus'), 'authorized').returns(true);

    await documentVerification(req, res);
    expect(randomDocumentPassStub.called).to.be.true;
    expect(res.json.calledWithMatch({ result: 'random' })).to.be.true;

    // Restore authorized
    require('../../services/id_plus').authorized.restore();
  });
});