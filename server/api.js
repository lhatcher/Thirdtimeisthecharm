const express = require('express');
const apiPort = require('../config/environments').apiPort;
const app = express();

app.get('/api', (req, res) => {
  res.send('Hello, world!');
});
 
app.listen(apiPort, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.info(`Api listening on port ${apiPort}!`);
  }
});