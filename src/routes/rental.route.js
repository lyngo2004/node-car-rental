const express = require('express');
const { checkoutRentalController } = require('../controllers/rentalController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/rental/checkout:
 *   post:
 *     summary: Create rental + payment in one transaction
 *     tags: [Rental]
 *     security:
 *       - bearerAuth: []
 *
 *     description: >
 *       Handles the full rental checkout flow:
 *       - Validate payload fields  
 *       - Validate pickup & dropoff datetime  
 *       - Load customer by UserId and auto-update missing profile fields  
 *       - Validate car availability and time overlap (with 2h buffer)  
 *       - Compute rental days, subtotal, tax, total  
 *       - Insert Rental + Payment in a single DB transaction  
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               [
 *                 CarId, pickupLocation, pickupDate, pickupTime,
 *                 dropoffLocation, dropoffDate, dropoffTime,
 *                 billing, paymentMethod
 *               ]
 *             properties:
 *               CarId: { type: string, example: "CAR012" }
 *               pickupLocation: { type: string }
 *               pickupDate: { type: string, example: "2025-12-10" }
 *               pickupTime: { type: string, example: "13:00" }
 *               dropoffLocation: { type: string }
 *               dropoffDate: { type: string, example: "2025-12-15" }
 *               dropoffTime: { type: string, example: "10:00" }
 *               billing:
 *                 type: object
 *                 required: [fullName, phone, address, driverLicense]
 *                 properties:
 *                   fullName: { type: string }
 *                   phone: { type: string }
 *                   address: { type: string }
 *                   driverLicense: { type: string }
 *               paymentMethod:
 *                 type: string
 *                 example: "credit-card"
 *
 *     responses:
 *       200:
 *         description: Rental checkout result (EC = 0 success)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               success:
 *                 summary: Rental created successfully
 *                 value:
 *                   EC: 0
 *                   EM: "Rental inserted OK"
 *                   DT:
 *                     RentalId: "RE012"
 *                     CarId: "CAR012"
 *                     CustomerId: "C012"
 *                     PickUpLocation: "HCMC"
 *                     PickUpDate: "2025-12-10"
 *                     PickUpTime: "13:00:00"
 *                     DropOffLocation: "HCMC"
 *                     DropOffDate: "2025-12-15"
 *                     DropOffTime: "10:00:00"
 *                     RentalStatus: "pending"
 *                     TotalAmount: 864
 *
 *               carUnavailable:
 *                 summary: Car has overlapping rental
 *                 value:
 *                   EC: 1
 *                   EM: "Car is not available at this time"
 *                   DT: null
 *
 *               invalidDatetime:
 *                 summary: Datetime validation errors
 *                 value:
 *                   EC: 1
 *                   EM: "Invalid pickup/dropoff datetime"
 *                   DT: null
 *
 *               pickupPast:
 *                 summary: Pickup is before now
 *                 value:
 *                   EC: 1
 *                   EM: "Pickup time must be greater than current time"
 *                   DT: null
 *
 *               dropoffBeforePickup:
 *                 summary: Dropoff earlier than pickup
 *                 value:
 *                   EC: 1
 *                   EM: "Dropoff must be after pickup"
 *                   DT: null
 *
 *               carNotFound:
 *                 summary: Car does not exist
 *                 value:
 *                   EC: 1
 *                   EM: "Car not found"
 *                   DT: null
 *
 *               customerNotFound:
 *                 summary: Customer does not exist for UserId
 *                 value:
 *                   EC: 1
 *                   EM: "Customer not found"
 *                   DT: null
 *
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   EC: 1
 *                   EM: "Missing required fields"
 *                   DT: null
 *
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/checkout", checkoutRentalController);

module.exports = router;