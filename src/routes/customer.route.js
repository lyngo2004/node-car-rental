const express = require('express');
const { getCurrentCustomerController } = require('../controllers/customerController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/customer/me:
 *   get:
 *     summary: Get current customer profile
 *     tags: [Customer]
 *     security:
 *       - bearerAuth: []
 *
 *     description: >
 *       Returns the customer profile mapped to the logged-in user (via UserId).
 *       Uses Customer + UserAccount.Email.
 *
 *     responses:
 *       200:
 *         description: Lookup result (EC = 0 if found, EC = 1 if not)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               success:
 *                 summary: Customer found
 *                 value:
 *                   EC: 0
 *                   EM: "OK"
 *                   DT:
 *                     CustomerId: "C012"
 *                     FullName: "John Doe"
 *                     Email: "john@mail.com"
 *                     Phone: "0909000000"
 *                     Address: "HCMC"
 *                     DriverLicense: "B123456"
 *
 *               notFound:
 *                 summary: Customer does not exist for current user
 *                 value:
 *                   EC: 1
 *                   EM: "Customer not found"
 *                   DT: null
 *
 *       401:
 *         $ref: "#/components/responses/UnauthorizedError"
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get('/me', getCurrentCustomerController);

module.exports = router;
