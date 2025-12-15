const express = require('express');
const {
    fetchAllRentalsController,
    fetchRentalSummaryController,
    fetchRentalByIdController,
    approveRentalController,
    rejectRentalController,
    cancelRentalController,
} = require('../../controllers/admin/rentalController');

const router = express.Router();

router.get("/", fetchAllRentalsController);
router.get("/summary", fetchRentalSummaryController);

router.get("/:id", fetchRentalByIdController);
router.patch("/:id/approve", approveRentalController);
router.patch("/:id/reject", rejectRentalController);
router.patch("/:id/cancel", cancelRentalController);

module.exports = router;