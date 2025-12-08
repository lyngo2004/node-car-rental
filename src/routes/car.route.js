const express = require('express');
const {
    getAllCarsController,
    getAvailableCarsController,
    getFilterOptionsController,
    filterCarsByFiltersController,
    getCarByIdController
} = require('../controllers/carController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/car:
 *   get:
 *     summary: Get all cars
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     description: Retrieve complete list of cars.
 *
 *     responses:
 *       200:
 *         description: Car list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               EC: 0
 *               EM: "Success"
 *               DT: []
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", getAllCarsController);

/**
 * @swagger
 * /api/v1/car/available:
 *   get:
 *     summary: Get available cars based on pickup & dropoff time
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *     description: >
 *       Returns only cars that are available for the selected pickup and dropoff time.
 *       Includes strict time validation rules.
 * 
 *     parameters:
 *       - in: query
 *         name: pickupLocation
 *         schema: { type: string }
 *       - in: query
 *         name: pickupDate
 *         schema: { type: string }
 *       - in: query
 *         name: pickupTime
 *         schema: { type: string }
 *       - in: query
 *         name: dropoffLocation
 *         schema: { type: string }
 *       - in: query
 *         name: dropoffDate
 *         schema: { type: string }
 *       - in: query
 *         name: dropoffTime
 *         schema: { type: string }
 *
 *     responses:
 *       200:
 *         description: Successful lookup (EC = 0)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *
 *       400:
 *         description: Time validation errors
 *         content:
 *           application/json:
 *             examples:
 *               pickupPast:
 *                 value: { EC: 1, EM: "Pick-up time cannot be in the past.", DT: null }
 *               dropoffPast:
 *                 value: { EC: 2, EM: "Drop-off time cannot be in the past.", DT: null }
 *               dropoffBeforePickup:
 *                 value: { EC: 3, EM: "Drop-off time must be after pick-up time.", DT: null }
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/available", getAvailableCarsController);

/**
 * @swagger
 * /api/v1/car/filter-options:
 *   get:
 *     summary: Get metadata used for filtering cars
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *
 *     description: >
 *       Provides car types, capacities, and price range used by the UI filter panel.
 *
 *     responses:
 *       200:
 *         description: Successful lookup (EC = 0)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/filter-options", getFilterOptionsController);

/**
 * @swagger
 * /api/v1/car/filter:
 *   get:
 *     summary: Filter cars using type, capacity, price, and optional availability window
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *
 *     description: >
 *       Multi-purpose filtering API.
 *       Supports type, capacity, price range, and optional pickup/dropoff time window.
 *       All parameters are optional, and API will apply only the filters provided.
 *
 *     parameters:
 *       - in: query
 *         name: type
 *         example: "SUV,MPV"
 *       - in: query
 *         name: capacity
 *         example: "4,7"
 *       - in: query
 *         name: min
 *       - in: query
 *         name: max
 *       - in: query
 *         name: pickupDate
 *       - in: query
 *         name: pickupTime
 *       - in: query
 *         name: dropoffDate
 *       - in: query
 *         name: dropoffTime
 *
 *     responses:
 *       200:
 *         description: Filtered results (EC = 0)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *
 *       400:
 *         description: Filter validation errors
 *         content:
 *           application/json:
 *             examples:
 *               invalidMin:
 *                 value: { EC: 4, EM: "Invalid min price", DT: null }
 *               invalidMax:
 *                 value: { EC: 5, EM: "Invalid max price", DT: null }
 *               invalidRange:
 *                 value: { EC: 6, EM: "Invalid price range: max < min", DT: null }
 *               pickupPast:
 *                 value: { EC: 7, EM: "Pick-up time cannot be in the past.", DT: null }
 *               dropoffPast:
 *                 value: { EC: 8, EM: "Drop-off time cannot be in the past.", DT: null }
 *               dropoffBeforePickup:
 *                 value: { EC: 9, EM: "Drop-off time must be after pick-up time.", DT: null }
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/filter", filterCarsByFiltersController);

/**
 * @swagger
 * /api/v1/car/{id}:
 *   get:
 *     summary: Get detail of a single car
 *     tags: [Cars]
 *     security:
 *       - bearerAuth: []
 *
 *     description: >
 *       Returns the detailed information of one car by its CarId.
 *       If the car does not exist, the API still returns HTTP 200
 *       with EC = 1 and DT = null.
 *
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: CarId (primary key of Car table)
 *         schema:
 *           type: integer
 *         example: 1
 *
 *     responses:
 *       200:
 *         description: Car detail lookup (EC = 0 if found, EC = 1 if not found)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               success:
 *                 summary: Car found
 *                 value:
 *                   EC: 0
 *                   EM: "Success"
 *                   DT:
 *                     CarId: CAR001
 *                     CarName: "Nissan GT - R"
 *                     Type: "Sport"
 *                     Capacity: 2
 *                     PricePerDay: 80
 *               notFound:
 *                 summary: Car not found
 *                 value:
 *                   EC: 1
 *                   EM: "Car not found"
 *                   DT: null
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:id", getCarByIdController);

module.exports = router;
