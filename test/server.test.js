const proxyquire = require('proxyquire').noCallThru();
const request = require('supertest');
const { expect } = require('chai');
const express = require('express');

describe('Server', function () {
  let app;
  let server;

  // Mock route handlers
  const idPlusRoute = express.Router().get('/', (req, res) => res.json({ route: 'id_plus' }));
  const docvRoute = express.Router().get('/', (req, res) => res.json({ route: 'docv' }));
  const dosRoute = express.Router().get('/', (req, res) => res.json({ route: 'dos' }));

  before(function () {
    // Proxyquire to inject mocks
    app = proxyquire('../server', {
      './routes/id_plus': idPlusRoute,
      './routes/docv': docvRoute,
      './routes/dos': dosRoute,
      dotenv: { config: () => {} }
    });

    server = app;
  });

  it('should mount /api/3.0/EmailAuthScore', async function () {
    const res = await request(server).get('/api/3.0/EmailAuthScore');
    expect(res.status).to.equal(200);
    expect(res.body.route).to.equal('id_plus');
  });

  it('should mount /docv', async function () {
    const res = await request(server).get('/docv');
    expect(res.status).to.equal(200);
    expect(res.body.route).to.equal('docv');
  });

  it('should mount /dos', async function () {
    const res = await request(server).get('/dos');
    expect(res.status).to.equal(200);
    expect(res.body.route).to.equal('dos');
  });

  it('should handle errors globally in production', async function () {
    server.get('/error', (req, res, next) => { next(new Error('Test error')); });
    const res = await request(server).get('/error');
    expect(res.status).to.equal(500);
    expect(res.body).to.have.property('error', 'Internal Server Error');
  });
});