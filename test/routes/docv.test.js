const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();
const { expect } = require('chai');

describe('POST /docv/doc_request', function () {
  let app, redisStub, axiosStub, authorizedStub;

  beforeEach(async function () {
    // Stub Redis client
    redisStub = {
      connect: sinon.stub().resolves(),
      setEx: sinon.stub().resolves()
    };

    // Stub axios
    axiosStub = { post: sinon.stub().resolves() };

    // Stub authorized
    authorizedStub = sinon.stub();

    // Proxyquire the route with stubs
    const docvRoute = proxyquire('../../routes/docv', {
      axios: axiosStub,
      crypto: require('crypto'),
      redis: { createClient: () => redisStub },
      '../services/id_plus': { authorized: authorizedStub }
    });

    // Set up express app
    app = express();
    app.use(express.json());
    app.use('/docv', docvRoute);

    // Set required env vars
    process.env.DEFAULT_IDP_DOCV_CALLBACK_URL = 'https://example.com/callback';
    process.env.IDP_WEBHOOK_PATH = '/webhook';
    process.env.WEBHOOK_SECRET = 'secret';
  });

  it('should reject missing or invalid headers', async function () {
    const res = await request(app)
      .post('/docv/doc_request')
      .send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Missing or invalid headers');
  });

  it('should reject unauthorized requests', async function () {
    authorizedStub.returns(false);
    const res = await request(app)
      .post('/docv/doc_request')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({});
    expect(res.status).to.equal(401);
    expect(res.body).to.have.property('error', 'Unauthorized');
  });

  it('should reject invalid documentType', async function () {
    authorizedStub.returns(true);
    const res = await request(app)
      .post('/docv/doc_request')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({ config: { documentType: 'foo', redirect: {} } });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid or missing documentType');
  });

  it('should reject invalid redirect method', async function () {
    authorizedStub.returns(true);
    const res = await request(app)
      .post('/docv/doc_request')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({ config: { documentType: 'license', redirect: { method: 'PUT', url: 'https://example.com/callback' } } });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid or missing redirect method');
  });

  it('should reject invalid redirect url', async function () {
    authorizedStub.returns(true);
    const res = await request(app)
      .post('/docv/doc_request')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({ config: { documentType: 'license', redirect: { method: 'GET', url: 'not-a-url' } } });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid redirect url');
  });

  it('should accept valid request and store in redis', async function () {
    authorizedStub.returns(true);
    const res = await request(app)
      .post('/docv/doc_request')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({ config: { documentType: 'passport', redirect: { method: 'POST', url: 'https://example.com/callback' } } });
    expect(res.status).to.equal(200);
    expect(res.body.data).to.have.property('url', 'https://example.com/callback');
    expect(res.body.data).to.have.property('docvTransactionToken');
    expect(redisStub.setEx.calledOnce).to.be.true;
    expect(axiosStub.post.calledOnce).to.be.true;
  });
});