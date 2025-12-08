const express = require("express");
const { getLocations, getTimeSlots } = require("../controllers/commonController");
const router = express.Router();

/**
 * @swagger
 * /api/v1/common/locations:
 *   get:
 *     summary: Get all garage locations
 *     tags: [Common]
 *     description: Retrieve pickup/dropoff location list.
 *
 *     responses:
 *       200:
 *         description: Location list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               EC: 0
 *               EM: "Success"
 *               DT: ["District 1", "District 5", "Thu Duc"]
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/locations", getLocations);

/**
 * @swagger
 * /api/v1/common/timeslots:
 *   get:
 *     summary: Get available pickup/dropoff timeslots
 *     tags: [Common]
 *     description: Return predefined time slots for filtering.
 *
 *     responses:
 *       200:
 *         description: Timeslot list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               EC: 0
 *               EM: "Success"
 *               DT: ["04:00", "06:00", "08:00"]
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/timeslots", getTimeSlots);

module.exports = router;
