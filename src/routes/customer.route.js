const express = require('express');
const auth = require('../middleware/auth');
const { getCurrentCustomer } = require('../controllers/customerController');

const router = express.Router();

router.get('/me', auth, getCurrentCustomer);

module.exports = router;
