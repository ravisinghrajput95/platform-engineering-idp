const app = require('./app');

const port = ${{ values.port }};

app.listen(port, () => {
  console.log(`${{ values.serviceName }} listening on port ${port}`);
});
