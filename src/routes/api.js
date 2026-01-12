const express = require('express');
const auth = require('../middleware/auth');
const userRoute = require("./user.route");
const carRoute = require("./customer/car.route");
const routerAPI = express.Router();
const customerRoute = require('./customer/customer.route');
const rentalRoute = require('./customer/rental.route');
const adminRoute = require('./admin')

routerAPI.all("*", auth); // Áp dụng middleware cho tất cả các route trong routerAPI

routerAPI.get('/', (req, res) => {
    return res.status(200).json({ message: 'API is working!' });
});

routerAPI.use("/user", userRoute);

//customer API
routerAPI.use("/car", carRoute);
routerAPI.use("/customer", customerRoute);
routerAPI.use("/rental", rentalRoute);

//admin API
routerAPI.use("/admin", adminRoute);

module.exports = routerAPI;
