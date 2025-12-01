const { GARAGES } = require("../constants/locations");
const { TIME_SLOTS } = require("../constants/timeSlots");

const getLocations = (req, res) => {
  return res.status(200).json({
    EC: 0,
    EM: "Success",
    DT: GARAGES
  });
};

const getTimeSlots = (req, res) => {
  return res.status(200).json({
    EC: 0,
    EM: "Success",
    DT: TIME_SLOTS
  });
};

module.exports = { getLocations, getTimeSlots };
