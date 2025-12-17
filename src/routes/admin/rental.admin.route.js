const express = require('express');
const {
    getAllRentalsController,
    getRentalSummaryController,
    getRentalByIdController,
    getRentalsByStatusController,
    approveRentalController,
    rejectRentalController,
    cancelRentalController,
} = require('../../controllers/admin/rentalController');

const router = express.Router();

router.get("/", getAllRentalsController);
router.get("/summary", getRentalSummaryController);

router.get("/:id", getRentalByIdController);
router.get("/status/:status", getRentalsByStatusController);

router.patch("/:id/approve", approveRentalController);
router.patch("/:id/reject", rejectRentalController);
router.patch("/:id/cancel", cancelRentalController);

module.exports = router;