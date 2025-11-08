const express = require('express');

const routerAPI = express.Router();

routerAPI.get('/', (req, res) => {
  return res.status(200).json({ message: 'API is working!' });
});

module.exports = routerAPI;