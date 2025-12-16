const express = require("express");
const requireAdmin = require("../../middleware/requireAdmin");

const carAdminRoute = require("./car.admin.route");
const rentalAdminRoute = require("./rental.admin.route");

const router = express.Router();

// chặn quyền ở đây
router.all('*', requireAdmin);

router.use("/car", carAdminRoute);
router.use("/rental", rentalAdminRoute);

module.exports = router;
