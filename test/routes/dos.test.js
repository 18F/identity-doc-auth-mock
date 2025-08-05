const express = require('express');
const request = require('supertest');
const { expect } = require('chai');

const dosRoute = require('../../routes/dos');

describe('DOS Route', function () {
  let app;

  before(function () {
    app = express();
    app.use(express.json());
    app.use('/dos', dosRoute);
  });

  describe('GET /dos/healthcheck', function () {
    it('should return status UP', async function () {
      const res = await request(app).get('/dos/healthcheck');
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ status: 'UP' });
    });
  });

  describe('POST /dos/mrz', function () {
    const validHeaders = {
      'client-id': 'test-client',
      'x-correlation-id': 'corr-id',
      'client-secret': 'secret',
      'content-type': 'application/json'
    };

    it('should return 400 for missing headers', async function () {
      const res = await request(app)
        .post('/dos/mrz')
        .send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Missing or invalid headers');
    });

    it('should return 200 and response YES for valid headers', async function () {
      const res = await request(app)
        .post('/dos/mrz')
        .set(validHeaders)
        .send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.deep.equal({ response: 'YES' });
    });

    it('should return 400 if content-type is not application/json', async function () {
      const headers = { ...validHeaders, 'content-type': 'text/plain' };
      const res = await request(app)
        .post('/dos/mrz')
        .set(headers)
        .send('');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Missing or invalid headers');
    });

    it('should return 400 if any required header is missing', async function () {
      const headers = { ...validHeaders };
      delete headers['client-secret'];
      const res = await request(app)
        .post('/dos/mrz')
        .set(headers)
        .send({});
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Missing or invalid headers');
    });
  });
});