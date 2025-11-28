const express = require('express');
const {
    getAllCarsController,
    getAvailableCarsController,
    getFilterOptionsController,
    filterCarsByTypeController,
    filterCarsByCapacityController,
    filterCarsByPriceController
    , filterCarsByFiltersController
} = require('../controllers/carController');

const router = express.Router();

router.get('/', getAllCarsController);
router.get('/available', getAvailableCarsController);

router.get("/filter-options", getFilterOptionsController);
router.get("/filter-by-type", filterCarsByTypeController);
router.get("/filter-by-capacity", filterCarsByCapacityController);
router.get("/filter-by-price", filterCarsByPriceController);
router.get("/filter", filterCarsByFiltersController);


module.exports = router;
