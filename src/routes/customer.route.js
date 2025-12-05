const express = require('express');
const { getCurrentCustomerController } = require('../controllers/customerController');

const router = express.Router();

router.get('/me', getCurrentCustomerController);

module.exports = router;
