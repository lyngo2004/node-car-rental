const express = require('express');
const auth = require('../middleware/auth');
const userRoute = require("./user.route");
const carRoute = require("./car.route");
const routerAPI = express.Router();

routerAPI.all("*", auth); // Áp dụng middleware cho tất cả các route trong routerAPI

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'API is working!' });
});

// Grouping routes
routerAPI.use("/user", userRoute);
routerAPI.use("/car", carRoute);

routerAPI.use("/cloudinary", require("./cloudinary.route"));

module.exports = routerAPI;
