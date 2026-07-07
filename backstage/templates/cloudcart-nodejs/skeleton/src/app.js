const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res.json({ service: '${{ values.serviceName }}' });
});

app.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
