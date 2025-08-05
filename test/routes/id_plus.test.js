const express = require('express');
const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const proxyquire = require('proxyquire').noCallThru();

describe('id_plus Route', function () {
  let app, documentVerificationStub;

  beforeEach(function () {
    documentVerificationStub = sinon.stub().callsFake((req, res) => {
      res.status(200).json({ ok: true });
    });

    const idPlusRoute = proxyquire('../../routes/id_plus', {
      '../services/id_plus': {
        authorized: () => true,
        documentVerification: documentVerificationStub
      }
    });

    app = express();
    app.use(express.json());
    app.use('/api/3.0/EmailAuthScore', idPlusRoute);
  });

  it('should return 400 for missing headers', async function () {
    const res = await request(app)
      .post('/api/3.0/EmailAuthScore')
      .send({});
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Missing or invalid headers');
  });

  it('should return 400 for invalid content-type', async function () {
    const res = await request(app)
      .post('/api/3.0/EmailAuthScore')
      .set('authorization', 'Bearer token')
      .set('content-type', 'text/plain')
      .send('');
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Missing or invalid headers');
  });

  it('should return 400 for invalid modules', async function () {
    const res = await request(app)
      .post('/api/3.0/EmailAuthScore')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({ modules: [] });
    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('error', 'Invalid modules');
  });

  it('should call documentVerification for valid request', async function () {
    const res = await request(app)
      .post('/api/3.0/EmailAuthScore')
      .set('authorization', 'Bearer token')
      .set('content-type', 'application/json')
      .send({ modules: ['documentVerification'] });
    expect(res.status).to.equal(200);
    expect(res.body).to.deep.equal({ ok: true });
    expect(documentVerificationStub.calledOnce).to.be.true;
  });
});