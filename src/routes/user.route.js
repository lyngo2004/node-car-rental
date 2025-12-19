const express = require('express');
const { createUser, handleLogin } = require('../controllers/userController');

const router = express.Router();

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Users]
 *     description: Creates a new user and associated customer profile.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string }
 *               email: { type: string }
 *               password: { type: string }
 *
 *     responses:
 *       200:
 *         description: Registration result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *               success:
 *                 value:
 *                   EC: 0
 *                   EM: "User created successfully"
 *                   DT:
 *                     UserId: "UA001"
 *                     Username: "john"
 *               usernameExists:
 *                 value:
 *                   EC: 1
 *                   EM: "Username already exists"
 *                   DT: ""
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/register", createUser);

/**
 * @swagger
 * /api/v1/user/login:
 *   post:
 *     summary: User login
 *     tags: [Users]
 *     description: Authenticate user and return JWT access token.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *
 *     responses:
 *       200:
 *         description: Login result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: "#/components/schemas/BaseResponse"
 *             examples:
 *
 *               success:
 *                 summary: Login successful
 *                 value:
 *                   EC: 0
 *                   EM: "Login successful"
 *                   DT:
 *                     accessToken: "jwt-token"
 *                     user:
 *                       username: "john"
 *                       email: "john@mail.com"
 *
 *               usernameNotFound:
 *                 summary: Username does not exist
 *                 value:
 *                   EC: 1
 *                   EM: "Username/password not found"
 *                   DT: ""
 *
 *               invalidPassword:
 *                 summary: Wrong password
 *                 value:
 *                   EC: 2
 *                   EM: "Username/password not found"
 *                   DT: ""
 *
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/login", handleLogin);


module.exports = router;
