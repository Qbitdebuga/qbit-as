const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    service: process.env.SERVICE_NAME || 'health-demo',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`${process.env.SERVICE_NAME || 'Health demo'} service running on port ${port}`);
}); 