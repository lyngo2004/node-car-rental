const express = require('express');
const { checkoutRentalController } = require('../controllers/rentalController');

const router = express.Router();

router.post("/checkout", checkoutRentalController);

module.exports = router;