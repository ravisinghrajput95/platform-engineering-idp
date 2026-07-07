const request = require('supertest');
const app = require('../src/app');

test('GET / returns service metadata', async () => {
  const res = await request(app).get('/');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ service: '${{ values.serviceName }}' });
});

test('GET /healthz returns ok', async () => {
  const res = await request(app).get('/healthz');
  expect(res.status).toBe(200);
  expect(res.body).toEqual({ status: 'ok' });
});
