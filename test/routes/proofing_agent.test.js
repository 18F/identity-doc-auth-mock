const express = require('express');
const request = require('supertest');
const { expect } = require('chai');

const proofingAgentRoute = require('../../routes/proofing_agent');

describe('Proofing Agent Route', function () {
  let app;

  beforeEach(function () {
    app = express();
    app.use(express.json());
    app.use('/proofing_agent', proofingAgentRoute);
    delete process.env.PROOFING_AGENT_WEBHOOK_SECRET;
  });

  describe('POST /proofing_agent/webhook', function () {
    it('should return 400 if content-type is not application/json', async function () {
      const res = await request(app)
        .post('/proofing_agent/webhook')
        .set('content-type', 'text/plain')
        .send('hello');
      expect(res.status).to.equal(400);
      expect(res.body).to.have.property('error', 'Missing or invalid headers');
    });

    it('should accept a valid webhook and echo the event', async function () {
      const payload = { eventType: 'PROOFING_COMPLETE', referenceId: 'abc-123' };
      const res = await request(app)
        .post('/proofing_agent/webhook')
        .set('content-type', 'application/json')
        .send(payload);
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'received');
      expect(res.body).to.have.property('receivedAt');
      expect(res.body.event).to.deep.equal(payload);
    });

    it('should accept any request when no secret is configured', async function () {
      const res = await request(app)
        .post('/proofing_agent/webhook')
        .set('content-type', 'application/json')
        .send({ eventType: 'PING' });
      expect(res.status).to.equal(200);
    });

    it('should return 401 when a secret is configured and the header is missing', async function () {
      process.env.PROOFING_AGENT_WEBHOOK_SECRET = 'top-secret';
      const res = await request(app)
        .post('/proofing_agent/webhook')
        .set('content-type', 'application/json')
        .send({ eventType: 'PING' });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });

    it('should return 401 when a secret is configured and the header is wrong', async function () {
      process.env.PROOFING_AGENT_WEBHOOK_SECRET = 'top-secret';
      const res = await request(app)
        .post('/proofing_agent/webhook')
        .set('content-type', 'application/json')
        .set('authorization', 'wrong-secret')
        .send({ eventType: 'PING' });
      expect(res.status).to.equal(401);
      expect(res.body).to.have.property('error', 'Unauthorized');
    });

    it('should accept the request when the configured secret matches', async function () {
      process.env.PROOFING_AGENT_WEBHOOK_SECRET = 'top-secret';
      const res = await request(app)
        .post('/proofing_agent/webhook')
        .set('content-type', 'application/json')
        .set('authorization', 'top-secret')
        .send({ eventType: 'PING' });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('status', 'received');
    });
  });
});
