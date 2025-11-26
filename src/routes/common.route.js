const express = require("express");
const router = express.Router();
const { GARAGES } = require("../constants/locations");
const { TIME_SLOTS } = require("../constants/timeSlots");

router.get("/locations", (req, res) => {
    return res.json({ success: true, data: GARAGES });
});

router.get("/timeslots", (req, res) => {
    return res.json({ success: true, data: TIME_SLOTS });
});

module.exports = router;
