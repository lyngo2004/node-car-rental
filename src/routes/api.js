const express = require('express');
const auth = require('../middleware/auth');
const userRoute = require("./user.route");
const carRoute = require("./car.route");
const routerAPI = express.Router();
const customerRoute = require('./customer.route');
const rentalRoute = require('./rental.route');

routerAPI.all("*", auth); // Áp dụng middleware cho tất cả các route trong routerAPI

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'API is working!' });
});

// Grouping routes
routerAPI.use("/user", userRoute);
routerAPI.use("/car", carRoute);
routerAPI.use("/customer", customerRoute);
routerAPI.use("/rental", rentalRoute);

module.exports = routerAPI;
